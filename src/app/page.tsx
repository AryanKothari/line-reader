'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/shared/Logo'
import { AuthButton } from '@/components/shared/AuthButton'
import { DropZone } from '@/components/upload/DropZone'
import { SavedScriptsList } from '@/components/upload/SavedScriptsList'
import { ProjectsList } from '@/components/upload/ProjectsList'
import { useScriptStore } from '@/stores/script-store'
import { useAuth } from '@/lib/auth-context'
import { extractTextFromPdf } from '@/lib/parser/pdf-extract'
import { parseFromText } from '@/lib/parser/script-parser'
import type { Project } from '@/lib/projects'
import type { ScriptEntry } from '@/types'

export default function UploadPage() {
  const router = useRouter()
  const store = useScriptStore()
  const { isPremium, user } = useAuth()
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    setStatus('Reading your script...')
    setError(null)
    store.setUploadedFile(file)
    store.setProject(null, null) // new upload = no project yet

    try {
      // JSON files are already parsed script entries
      if (file.name.endsWith('.json') || file.type === 'application/json') {
        const text = await file.text()
        const entries = JSON.parse(text)
        if (!Array.isArray(entries) || !entries.length || !entries[0].character) {
          setStatus(null)
          setError('Invalid JSON format. Expected an array of script entries.')
          return
        }
        store.setParsedScript(entries)
        setStatus(null)
        router.push('/review')
        return
      }

      let rawText: string
      if (file.type === 'application/pdf') {
        rawText = await extractTextFromPdf(file, setStatus)
      } else {
        rawText = await file.text()
      }

      const result = parseFromText(rawText)
      if (!result.characters.length || !result.script.length) {
        setStatus(null)
        setError('No characters or dialogue found. Try a different file or paste the text manually.')
        return
      }

      store.setParsedScript(result.script)
      setStatus(null)
      router.push('/review')
    } catch (err) {
      console.error('Parse error:', err)
      setStatus(null)
      setError('Failed to parse the file. Try a different format.')
    }
  }

  const handleLoadProject = (project: Project) => {
    store.setProject(project.id, project.title)
    store.setParsedScript(project.entries)
    if (project.selected_character) store.selectCharacter(project.selected_character)
    router.push('/review')
  }

  const handleLoadSaved = (_name: string, script: ScriptEntry[]) => {
    store.setProject(null, null)
    store.setParsedScript(script)
    router.push('/review')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex justify-end p-4">
        <AuthButton />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-12">
        <header className="text-center mb-10">
          <Logo />
          <p className="text-text-secondary mt-2 font-[family-name:var(--font-display)] italic">
            Your scene partner, on demand
          </p>
        </header>

        <DropZone onFile={handleFile} status={status} error={error} />

        {user && isPremium && (
          <div className="flex items-center gap-2 text-xs text-text-dim justify-center mt-4">
            <div className="w-2 h-2 bg-success rounded-full" />
            Premium — scanned PDFs use AI vision for best accuracy
          </div>
        )}

        {user ? (
          <ProjectsList onLoad={handleLoadProject} />
        ) : (
          <SavedScriptsList onLoad={handleLoadSaved} />
        )}
      </div>
    </div>
  )
}
