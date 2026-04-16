'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useScriptStore } from '@/stores/script-store'
import { Logo } from '@/components/shared/Logo'
import { SaveButton } from '@/components/shared/SaveButton'
import { DragList } from '@/components/review/DragList'
import { PdfPreview } from '@/components/review/PdfPreview'
import { exportScriptAsJson, importScriptFromJson } from '@/lib/storage'

export default function ReviewPage() {
  const router = useRouter()
  const store = useScriptStore()
  const importRef = useRef<HTMLInputElement>(null)

  const characterNames = [...new Set(
    store.parsedScript
      .filter(e => e.character !== 'STAGE DIRECTION')
      .map(e => e.character)
  )]

  useEffect(() => {
    if (!store.parsedScript.length) router.push('/')
  }, [store.parsedScript.length, router])

  if (!store.parsedScript.length) return null

  const handleImport = async (file: File) => {
    try {
      const entries = await importScriptFromJson(file)
      store.setParsedScript(entries)
    } catch {
      alert('Invalid JSON file.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between p-4 border-b border-text-dim/20">
        <button onClick={() => router.push('/')} className="flex items-center gap-2 text-text-secondary hover:text-cream transition-colors">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Back
        </button>
        <Logo size="sm" />
        <SaveButton />
      </header>

      <div className="flex-1 flex flex-col px-6 py-4 max-w-7xl mx-auto w-full">
        <div className="text-center mb-4">
          <h2 className="font-[family-name:var(--font-display)] font-bold text-2xl">Review Script</h2>
          <p className="text-text-secondary text-sm mt-1">Click any line to edit. Compare with the original PDF on the right.</p>
        </div>

        <div className="flex-1 flex gap-4 min-h-0" style={{ height: '60vh' }}>
          <div className="flex-1 flex flex-col min-w-0">
            <div className="font-[family-name:var(--font-display)] font-bold text-xs uppercase tracking-widest text-text-secondary px-3 py-2 bg-stage-card rounded-t-lg border-b border-text-dim">
              Parsed Script
            </div>
            <div className="flex-1 bg-stage-bg rounded-b-lg flex flex-col min-h-0">
              <DragList
                entries={store.parsedScript}
                characterNames={characterNames}
                onUpdateLine={store.updateLine}
                onUpdateCharacter={store.updateCharacter}
                onDelete={store.deleteLine}
                onReorder={store.reorderLine}
                onAddLine={() => store.insertLine(store.parsedScript.length, { character: characterNames[0] || 'A', line: '', type: 'dialogue' })}
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            <div className="font-[family-name:var(--font-display)] font-bold text-xs uppercase tracking-widest text-text-secondary px-3 py-2 bg-stage-card rounded-t-lg border-b border-text-dim">
              Original PDF
            </div>
            <div className="flex-1 bg-stage-bg rounded-b-lg overflow-hidden">
              <PdfPreview file={store.uploadedFile} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mt-4">
          <button onClick={() => exportScriptAsJson(store.parsedScript)} className="px-4 py-2 bg-stage-card border border-text-dim rounded-lg text-text-secondary text-sm hover:border-amber hover:text-amber transition-all">
            Export JSON
          </button>
          <button onClick={() => importRef.current?.click()} className="px-4 py-2 bg-stage-card border border-text-dim rounded-lg text-text-secondary text-sm hover:border-amber hover:text-amber transition-all">
            Import JSON
          </button>
          <input ref={importRef} type="file" accept=".json" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleImport(e.target.files[0]); e.target.value = '' }} />
        </div>

        <button
          onClick={() => {
            store.refreshCharacters()
            router.push('/setup')
          }}
          className="mt-4 mx-auto block px-8 py-3 bg-amber text-stage-deep font-bold rounded-xl text-lg hover:bg-amber-dim transition-colors"
        >
          Looks Good — Next
        </button>
      </div>
    </div>
  )
}
