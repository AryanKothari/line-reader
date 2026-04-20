'use client'

import { useState } from 'react'
import { useSaveProject } from '@/hooks/useSaveProject'
import { useScriptStore } from '@line-reader/shared'

export function SaveButton() {
  const { save, saving, showNameModal, dismissModal } = useSaveProject()
  const { parsedScript, characters } = useScriptStore()
  const [name, setName] = useState('')

  if (!parsedScript.length) return null

  const charCount = characters.length
  const lineCount = parsedScript.length

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    save(name.trim())
    setName('')
    dismissModal()
  }

  return (
    <>
      <button
        onClick={() => save()}
        disabled={saving}
        className="text-sm text-text-secondary hover:text-amber transition-colors disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save'}
      </button>

      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={dismissModal}>
          <div
            className="bg-stage-card rounded-2xl p-6 w-full max-w-sm mx-4 border border-text-dim/30 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-full bg-amber/15 text-amber flex items-center justify-center mx-auto mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
              </div>
              <h3 className="font-[family-name:var(--font-display)] font-bold text-xl text-cream">
                Save Project
              </h3>
              <p className="text-text-secondary text-xs mt-1">
                {lineCount} lines &middot; {charCount} character{charCount !== 1 ? 's' : ''}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-text-secondary block mb-1.5">Project name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Spare Scene 2"
                  autoFocus
                  className="w-full bg-stage-elevated text-cream border border-text-dim rounded-lg px-3 py-2.5 text-sm focus:border-amber focus:outline-none placeholder:text-text-dim"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={dismissModal}
                  className="flex-1 py-2.5 rounded-lg border border-text-dim text-text-secondary text-sm hover:border-cream hover:text-cream transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="flex-1 py-2.5 bg-amber text-stage-deep font-semibold rounded-lg text-sm hover:bg-amber-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
