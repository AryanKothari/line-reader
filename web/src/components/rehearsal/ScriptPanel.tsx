'use client'

import { useEffect, useRef, useState } from 'react'
import { useScriptStore } from '@/stores/script-store'
import { renderPdfPages } from '@/lib/parser/pdf-extract'

const CHAR_COLORS = ['text-rose-400', 'text-green-400', 'text-blue-400', 'text-purple-400', 'text-orange-400', 'text-teal-400']

type Tab = 'script' | 'pdf'

export function ScriptPanel({ onClose }: { onClose: () => void }) {
  const { parsedScript, characters, uploadedFile } = useScriptStore()
  const characterNames = characters.map(c => c.name)
  const hasPdf = uploadedFile?.type === 'application/pdf'
  const [tab, setTab] = useState<Tab>('script')
  const [pdfPages, setPdfPages] = useState<string[]>([])
  const [pdfLoading, setPdfLoading] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (tab === 'pdf' && hasPdf && pdfPages.length === 0 && !pdfLoading) {
      setPdfLoading(true)
      renderPdfPages(uploadedFile!).then(setPdfPages).finally(() => setPdfLoading(false))
    }
  }, [tab, hasPdf, uploadedFile, pdfPages.length, pdfLoading])

  const colorMap = new Map<string, string>()
  characterNames.forEach((name, i) => colorMap.set(name, CHAR_COLORS[i % CHAR_COLORS.length]))

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        ref={panelRef}
        className="relative ml-auto w-full max-w-lg h-full bg-stage-bg border-l border-text-dim/20 flex flex-col animate-in slide-in-from-right duration-200"
      >
        <div className="flex items-center justify-between p-4 border-b border-text-dim/20">
          <div className="flex items-center gap-2">
            <h3 className="font-[family-name:var(--font-display)] text-cream font-bold text-lg">Full Script</h3>
            {hasPdf && (
              <div className="flex bg-stage-card rounded-lg p-0.5 ml-2">
                <TabBtn active={tab === 'script'} onClick={() => setTab('script')}>Lines</TabBtn>
                <TabBtn active={tab === 'pdf'} onClick={() => setTab('pdf')}>PDF</TabBtn>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-cream transition-colors p-1"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === 'script' ? (
            <div className="p-4 space-y-2">
              {parsedScript.map((entry, i) => {
                const isDirection = entry.type === 'direction'
                const charLabel = isDirection && entry.character === 'STAGE DIRECTION' ? 'Stage Direction' : entry.character
                const charColor = colorMap.get(entry.character) || 'text-text-secondary'

                return (
                  <div key={i} className={`p-3 rounded-lg ${isDirection ? 'italic' : ''} bg-stage-card/50`}>
                    <div className={`font-[family-name:var(--font-display)] font-bold text-xs uppercase tracking-widest mb-1 ${isDirection ? 'text-text-dim' : charColor}`}>
                      {charLabel}
                    </div>
                    <div className={`text-sm leading-relaxed ${isDirection ? 'text-text-secondary italic' : 'text-cream/90'}`}>
                      {entry.line}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-4">
              {pdfLoading ? (
                <div className="flex items-center justify-center p-10 text-cream-dim">
                  <div className="w-5 h-5 border-2 border-amber border-t-transparent rounded-full animate-spin mr-3" />
                  Rendering PDF...
                </div>
              ) : pdfPages.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {pdfPages.map((src, i) => (
                    <img key={i} src={src} alt={`Page ${i + 1}`} className="w-full rounded" />
                  ))}
                </div>
              ) : (
                <p className="text-text-dim text-center p-10 italic">Could not render PDF</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
        active ? 'bg-amber text-stage-deep' : 'text-text-secondary hover:text-cream'
      }`}
    >
      {children}
    </button>
  )
}
