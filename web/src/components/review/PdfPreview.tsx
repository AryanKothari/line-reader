'use client'

import { useEffect, useState } from 'react'
import { renderPdfPages } from '@/lib/parser/pdf-extract'

type Props = {
  file: File | null
}

export function PdfPreview({ file }: Props) {
  const [pages, setPages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!file || file.type !== 'application/pdf') {
      setPages([])
      return
    }
    setLoading(true)
    renderPdfPages(file).then(setPages).finally(() => setLoading(false))
  }, [file])

  if (!file || file.type !== 'application/pdf') {
    return <p className="text-text-dim text-center p-10 italic">No PDF to preview</p>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10 text-cream-dim">
        <div className="w-5 h-5 border-2 border-amber border-t-transparent rounded-full animate-spin mr-3" />
        Rendering PDF...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 p-2 overflow-y-auto">
      {pages.map((src, i) => (
        <img key={i} src={src} alt={`Page ${i + 1}`} className="w-full rounded" />
      ))}
    </div>
  )
}
