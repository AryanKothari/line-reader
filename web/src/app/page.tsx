'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/shared/Logo'
import { AuthButton } from '@/components/shared/AuthButton'
import { DropZone } from '@/components/upload/DropZone'
import { SavedScriptsList } from '@/components/upload/SavedScriptsList'
import { useScriptStore } from '@line-reader/shared'
import { useAuth } from '@/lib/auth-context'
import { extractTextFromPdf } from '@/lib/parser/pdf-extract'
import { parseFromText } from '@line-reader/shared'
import type { ScriptEntry } from '@line-reader/shared'

export default function UploadPage() {
  const router = useRouter()
  const store = useScriptStore()
  const { user, loading: authLoading } = useAuth()
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (!authLoading && user) router.push('/dashboard')
  }, [user, authLoading, router])

  if (user) return null

  const handleFile = async (file: File) => {
    setStatus('Reading your script...')
    setError(null)
    store.setUploadedFile(file)
    store.setProject(null, null)

    try {
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

        <SavedScriptsList onLoad={handleLoadSaved} />
      </div>
    </div>
  )
}
