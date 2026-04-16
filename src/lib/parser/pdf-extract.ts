import { cleanOcrText } from './ocr-cleanup'
import { supabase } from '@/lib/supabase'

type StatusCallback = (msg: string) => void

const PDF_JS_VERSION = '3.11.174'
const CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDF_JS_VERSION}`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pdfjsLib: any = null

async function loadPdfJs() {
  if (pdfjsLib) return pdfjsLib
  if (typeof window === 'undefined') throw new Error('pdf.js requires a browser')

  if ((window as any).pdfjsLib) {
    pdfjsLib = (window as any).pdfjsLib
    pdfjsLib.GlobalWorkerOptions.workerSrc = `${CDN}/pdf.worker.min.js`
    return pdfjsLib
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `${CDN}/pdf.min.js`
    script.onload = () => {
      pdfjsLib = (window as any).pdfjsLib
      pdfjsLib.GlobalWorkerOptions.workerSrc = `${CDN}/pdf.worker.min.js`
      resolve(pdfjsLib)
    }
    script.onerror = () => reject(new Error('Failed to load pdf.js'))
    document.head.appendChild(script)
  })
}

async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

async function isPremium(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return false
  const { data } = await supabase
    .from('profiles')
    .select('premium')
    .eq('id', session.user.id)
    .single()
  return data?.premium === true
}

export async function extractTextFromPdf(
  file: File,
  onStatus?: StatusCallback
): Promise<string> {
  const pdfjs = await loadPdfJs()

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
  const pages: string[] = []
  let totalChars = 0

  onStatus?.('Reading your script...')

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const lines: string[] = []
    let currentLine: string[] = []
    let lastY: number | null = null

    for (const item of content.items) {
      if (!('transform' in item)) continue
      const y = item.transform[5]
      if (lastY !== null && Math.abs(y - lastY) > 2) {
        lines.push(currentLine.join(''))
        currentLine = []
      }
      currentLine.push(item.str)
      lastY = y
    }
    if (currentLine.length) lines.push(currentLine.join(''))
    const pageText = lines.join('\n')
    totalChars += pageText.replace(/\s/g, '').length
    pages.push(pageText)
  }

  if (totalChars >= 20) {
    return pages.join('\n')
  }

  // Scanned PDF — try AI vision if premium, fall back to Tesseract
  const premium = await isPremium()
  if (premium) {
    try {
      return await extractTextWithVision(pdf, onStatus)
    } catch {
      onStatus?.('AI vision failed, falling back to OCR...')
    }
  }
  return await extractTextWithTesseract(pdf, onStatus)
}

// ═══ AI Vision extraction via API route ═══

async function extractTextWithVision(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdf: any,
  onStatus?: StatusCallback
): Promise<string> {
  onStatus?.('Scanned PDF detected — using AI vision for best accuracy...')

  const token = await getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const pageTexts: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    onStatus?.(`AI reading page ${i} of ${pdf.numPages}...`)
    const page = await pdf.getPage(i)
    const scale = 2
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)

    const response = await fetch('/api/vision-ocr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ image: dataUrl }),
    })

    if (!response.ok) throw new Error('Vision OCR failed')
    const { text } = await response.json()
    pageTexts.push(text)
  }

  return pageTexts.join('\n')
}

// ═══ Tesseract fallback (free, lower quality) ═══

function preprocessCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d')!
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    const contrast = gray < 128 ? Math.max(0, gray * 0.6) : Math.min(255, gray * 1.2 + 30)
    data[i] = data[i + 1] = data[i + 2] = contrast
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas
}

async function ocrCanvas(canvas: HTMLCanvasElement): Promise<string> {
  preprocessCanvas(canvas)
  const Tesseract = await import('tesseract.js')
  const { data: { text } } = await Tesseract.recognize(canvas, 'eng')
  return text
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function extractTextWithTesseract(pdf: any, onStatus?: StatusCallback): Promise<string> {
  onStatus?.('Scanned PDF detected — running OCR (this may take a moment)...')

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const pageTexts: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    onStatus?.(`OCR: processing page ${i} of ${pdf.numPages}...`)
    const page = await pdf.getPage(i)
    const scale = 3
    const viewport = page.getViewport({ scale })
    canvas.width = viewport.width
    canvas.height = viewport.height
    await page.render({ canvasContext: ctx, viewport }).promise

    if (canvas.width > canvas.height * 1.4) {
      const half = Math.floor(canvas.width / 2)
      const splitCanvas = document.createElement('canvas')
      const splitCtx = splitCanvas.getContext('2d')!
      splitCanvas.height = canvas.height
      splitCanvas.width = half

      splitCtx.drawImage(canvas, 0, 0, half, canvas.height, 0, 0, half, canvas.height)
      const leftText = await ocrCanvas(splitCanvas)

      splitCtx.clearRect(0, 0, half, canvas.height)
      splitCtx.drawImage(canvas, half, 0, canvas.width - half, canvas.height, 0, 0, half, canvas.height)
      const rightText = await ocrCanvas(splitCanvas)

      pageTexts.push(leftText + '\n' + rightText)
    } else {
      pageTexts.push(await ocrCanvas(canvas))
    }
  }

  return cleanOcrText(pageTexts.join('\n'))
}

// ═══ PDF page rendering for preview ═══

export async function renderPdfPages(file: File): Promise<string[]> {
  const pdfjs = await loadPdfJs()

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
  const dataUrls: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 1.5 })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise
    dataUrls.push(canvas.toDataURL())
  }

  return dataUrls
}
