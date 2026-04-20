'use client'

import { useCallback, useRef, useState } from 'react'

type Props = {
  onFile: (file: File) => void
  status: string | null
  error: string | null
}

export function DropZone({ onFile, status, error }: Props) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) onFile(file)
    },
    [onFile]
  )

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          w-full max-w-md mx-auto p-12 rounded-2xl border-2 border-dashed cursor-pointer
          transition-all duration-200 text-center
          ${dragOver
            ? 'border-amber bg-amber-glow scale-[1.02]'
            : 'border-text-dim hover:border-cream-dim bg-stage-card/50 hover:bg-stage-card'}
        `}
      >
        <svg className="mx-auto mb-4 text-cream-dim" width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path d="M8 36V40C8 41.1 8.9 42 10 42H38C39.1 42 40 41.1 40 40V36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M24 32V8M24 8L16 16M24 8L32 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-lg text-cream mb-1">Drop your script here</p>
        <p className="text-sm text-text-secondary">PDF, TXT, or JSON &middot; 2-3 character scripts work best</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onFile(file)
            e.target.value = ''
          }}
        />
      </div>

      {status && (
        <div className="flex items-center gap-3 text-cream-dim">
          <div className="w-5 h-5 border-2 border-amber border-t-transparent rounded-full animate-spin" />
          <span>{status}</span>
        </div>
      )}

      {error && (
        <div className="max-w-md mx-auto text-center">
          <p className="text-danger font-semibold mb-1">Couldn&apos;t parse the script automatically</p>
          <p className="text-text-secondary text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}
