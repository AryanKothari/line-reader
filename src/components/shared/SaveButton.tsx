'use client'

import { useSaveProject } from '@/hooks/useSaveProject'
import { useScriptStore } from '@/stores/script-store'

export function SaveButton() {
  const { save, saving } = useSaveProject()
  const { parsedScript } = useScriptStore()

  if (!parsedScript.length) return null

  return (
    <button
      onClick={save}
      disabled={saving}
      className="text-sm text-text-secondary hover:text-amber transition-colors disabled:opacity-50"
    >
      {saving ? 'Saving...' : 'Save'}
    </button>
  )
}
