import { cleanOcrText } from './ocr-cleanup'

type StatusCallback = (msg: string) => void

export async function extractTextFromPdf(
  file: File,
  onStatus?: StatusCallback
): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
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

async function extractTextWithOcr(
  pdf: import('pdfjs-dist').PDFDocumentProxy,
  onStatus?: StatusCallback
): Promise<string> {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (page as any).render({ canvasContext: ctx, viewport }).promise

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
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const dataUrls: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 1.5 })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (page as any).render({ canvasContext: canvas.getContext('2d')!, viewport }).promise
    dataUrls.push(canvas.toDataURL())
  }

  return dataUrls
}
