'use client'

import { useState, useCallback } from 'react'
import { useScriptStore } from '@/stores/script-store'
import { useAuth } from '@/lib/auth-context'
import { saveProject } from '@/lib/projects'
import { saveScript as saveToLocal } from '@/lib/storage'

export function useSaveProject() {
  const store = useScriptStore()
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)

  const save = useCallback(async () => {
    if (!store.parsedScript.length) return

    const title = store.projectTitle || prompt('Name this project:')
    if (!title) return
    setSaving(true)

    try {
      if (user) {
        const project = await saveProject({
          id: store.projectId || undefined,
          title,
          entries: store.parsedScript,
          selected_character: store.selectedCharacter,
        })
        store.setProject(project.id, project.title)
      } else {
        saveToLocal(title, store.parsedScript)
      }
    } catch (err) {
      console.error('Save error:', err)
      alert('Failed to save. Try again.')
    } finally {
      setSaving(false)
    }
  }, [store, user])

  return { save, saving }
}
