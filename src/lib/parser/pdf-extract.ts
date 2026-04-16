import { cleanOcrText } from './ocr-cleanup'

type StatusCallback = (msg: string) => void

const PDF_JS_VERSION = '3.11.174'
const CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDF_JS_VERSION}`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pdfjsLib: any = null

async function loadPdfJs() {
  if (pdfjsLib) return pdfjsLib
  if (typeof window === 'undefined') throw new Error('pdf.js requires a browser')

  // Check if already loaded via script tag
  if ((window as any).pdfjsLib) {
    pdfjsLib = (window as any).pdfjsLib
    pdfjsLib.GlobalWorkerOptions.workerSrc = `${CDN}/pdf.worker.min.js`
    return pdfjsLib
  }

  // Load from CDN
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

  if (totalChars < 20) {
    return await extractTextWithOcr(pdf, onStatus)
  }

  return pages.join('\n')
}

async function ocrCanvas(canvas: HTMLCanvasElement): Promise<string> {
  const Tesseract = await import('tesseract.js')
  const { data: { text } } = await Tesseract.recognize(canvas, 'eng')
  return text
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function extractTextWithOcr(pdf: any, onStatus?: StatusCallback): Promise<string> {
  onStatus?.('Scanned PDF detected — running OCR (this may take a moment)...')

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const pageTexts: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    onStatus?.(`OCR: processing page ${i} of ${pdf.numPages}...`)
    const page = await pdf.getPage(i)
    const scale = 2
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
