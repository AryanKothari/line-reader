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
  const [showNameModal, setShowNameModal] = useState(false)

  const save = useCallback(async (title?: string) => {
    if (!store.parsedScript.length) return

    const finalTitle = title || store.projectTitle
    if (!finalTitle) {
      setShowNameModal(true)
      return
    }

    setSaving(true)
    try {
      if (user) {
        const project = await saveProject({
          id: store.projectId || undefined,
          title: finalTitle,
          entries: store.parsedScript,
          selected_character: store.selectedCharacter,
        })
        store.setProject(project.id, project.title)
      } else {
        saveToLocal(finalTitle, store.parsedScript)
      }
    } catch (err) {
      console.error('Save error:', err)
      alert('Failed to save. Try again.')
    } finally {
      setSaving(false)
    }
  }, [store, user])

  const dismissModal = useCallback(() => setShowNameModal(false), [])

  return { save, saving, showNameModal, dismissModal }
}
