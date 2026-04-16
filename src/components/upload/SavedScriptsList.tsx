'use client'

import { getSavedScripts, deleteScript as removeScript } from '@/lib/storage'
import { useState } from 'react'

type Props = {
  onLoad: (name: string, script: import('@/types').ScriptEntry[]) => void
}

export function SavedScriptsList({ onLoad }: Props) {
  const [scripts, setScripts] = useState(() => getSavedScripts())
  const names = Object.keys(scripts)

  if (!names.length) return null

  const handleDelete = (name: string) => {
    if (!confirm(`Delete "${name}"?`)) return
    removeScript(name)
    setScripts(getSavedScripts())
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <h3 className="font-[family-name:var(--font-display)] font-bold text-center mb-3">Saved Scripts</h3>
      <div className="flex flex-col gap-2">
        {names.map(name => {
          const entry = scripts[name]
          const date = new Date(entry.savedAt).toLocaleDateString()
          return (
            <div
              key={name}
              className="flex items-center justify-between p-3 bg-stage-card rounded-lg border border-transparent hover:border-amber-dim cursor-pointer transition-all group"
              onClick={() => onLoad(name, entry.script)}
            >
              <div>
                <div className="font-semibold text-text-primary">{name}</div>
                <div className="text-xs text-text-secondary">{entry.script.length} lines &middot; {date}</div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(name) }}
                className="text-text-dim hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity text-lg px-2"
              >
                &times;
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
