'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/shared/Logo'
import { DropZone } from '@/components/upload/DropZone'
import { SavedScriptsList } from '@/components/upload/SavedScriptsList'
import { useScriptStore } from '@/stores/script-store'
import { extractTextFromPdf } from '@/lib/parser/pdf-extract'
import { parseFromText } from '@/lib/parser/script-parser'
import * as aiVoicesLib from '@/lib/ai-voices'
import type { ScriptEntry } from '@/types'

export default function UploadPage() {
  const router = useRouter()
  const { setParsedScript, setUploadedFile } = useScriptStore()
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [showKeyInput, setShowKeyInput] = useState(false)

  useEffect(() => {
    aiVoicesLib.initAiVoices()
    setApiKey(aiVoicesLib.getApiKey())
  }, [])

  const handleFile = async (file: File) => {
    setStatus('Reading your script...')
    setError(null)
    setUploadedFile(file)

    try {
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

      setParsedScript(result.script)
      setStatus(null)
      router.push('/review')
    } catch (err) {
      console.error('Parse error:', err)
      setStatus(null)
      setError('Failed to parse the file. Try a different format.')
    }
  }

  const handleLoadSaved = (_name: string, script: ScriptEntry[]) => {
    setParsedScript(script)
    router.push('/review')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <header className="text-center mb-10">
        <Logo />
        <p className="text-text-secondary mt-2 font-[family-name:var(--font-display)] italic">
          Your scene partner, on demand
        </p>
      </header>

      <DropZone onFile={handleFile} status={status} error={error} />

      <div className="max-w-md mx-auto mt-6 w-full">
        {apiKey ? (
          <div className="flex items-center gap-2 text-xs text-text-dim justify-center">
            <div className="w-2 h-2 bg-success rounded-full" />
            OpenAI key saved — scanned PDFs will use AI vision for best accuracy
          </div>
        ) : (
          <div className="text-center">
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="text-xs text-text-dim hover:text-text-secondary transition-colors"
            >
              {showKeyInput ? 'Hide' : 'Have an OpenAI API key? Add it for better scan quality'}
            </button>
            {showKeyInput && (
              <div className="mt-2 flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => {
                    setApiKey(e.target.value)
                    aiVoicesLib.setApiKey(e.target.value)
                  }}
                  placeholder="sk-..."
                  className="flex-1 bg-stage-elevated text-cream border border-text-dim rounded-lg px-3 py-2 text-sm focus:border-amber focus:outline-none placeholder:text-text-dim"
                />
              </div>
            )}
          </div>
        )}
      </div>

      <SavedScriptsList onLoad={handleLoadSaved} />
    </div>
  )
}
