'use client'

import { useState, useEffect } from 'react'
import * as aiVoices from '@/lib/ai-voices'

export function AiVoiceSettings() {
  const [enabled, setEnabled] = useState(false)
  const [apiKey, setApiKey] = useState('')

  useEffect(() => {
    aiVoices.initAiVoices()
    setApiKey(aiVoices.getApiKey())
    setEnabled(aiVoices.isEnabled())
  }, [])

  const handleToggle = () => {
    const next = !enabled
    setEnabled(next)
    aiVoices.setEnabled(next)
  }

  const handleKeyChange = (key: string) => {
    setApiKey(key)
    aiVoices.setApiKey(key)
  }

  return (
    <div className="space-y-3">
      <div
        onClick={handleToggle}
        className="flex items-center justify-between cursor-pointer group"
      >
        <span className="text-sm text-text-primary group-hover:text-cream transition-colors">
          Use enhanced AI voices (OpenAI TTS)
        </span>
        <div className={`w-10 h-5 rounded-full transition-colors relative ${enabled ? 'bg-amber' : 'bg-text-dim'}`}>
          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </div>
      </div>

      {enabled && (
        <div className="space-y-2">
          <input
            type="password"
            value={apiKey}
            onChange={e => handleKeyChange(e.target.value)}
            placeholder="sk-... your OpenAI API key"
            className="w-full bg-stage-elevated text-cream border border-text-dim rounded-lg px-3 py-2 text-sm focus:border-amber focus:outline-none placeholder:text-text-dim"
          />
          <p className="text-xs text-text-dim">
            Stored locally. Never sent anywhere except OpenAI. Costs ~$0.015 per 1,000 characters.
          </p>
        </div>
      )}
    </div>
  )
}
