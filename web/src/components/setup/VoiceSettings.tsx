'use client'

import { useEffect, useState, useCallback } from 'react'
import * as synthesis from '@/lib/speech/synthesis'
import * as aiVoices from '@/lib/ai-voices'
import { useAuth } from '@/lib/auth-context'

type Props = {
  characterNames: string[]
  selectedCharacter: string | null
}

export function VoiceSettings({ characterNames, selectedCharacter }: Props) {
  const { isPremium, user } = useAuth()
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([])
  const [assignments, setAssignments] = useState<Record<string, string>>({})
  const [tier, setTier] = useState<'free' | 'premium'>('free')

  useEffect(() => {
    if (isPremium) setTier('premium')
  }, [isPremium])

  useEffect(() => {
    const loadVoices = () => setBrowserVoices(synthesis.getEnglishVoices())
    loadVoices()
    speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => speechSynthesis.removeEventListener('voiceschanged', loadVoices)
  }, [])

  useEffect(() => {
    if (tier === 'premium') {
      const map = aiVoices.getCharacterVoiceMap()
      const a: Record<string, string> = {}
      for (const [key, voice] of Object.entries(map)) a[key] = voice
      setAssignments(a)
    } else {
      const map = synthesis.getCharacterVoiceMap()
      const a: Record<string, string> = {}
      for (const [key, voice] of Object.entries(map)) a[key] = voice.name
      setAssignments(a)
    }
  }, [browserVoices, selectedCharacter, tier])

  const handleTierChange = (newTier: 'free' | 'premium') => {
    if (newTier === 'premium' && !isPremium) return
    setTier(newTier)
    aiVoices.setEnabled(newTier === 'premium')
  }

  const handleVoiceChange = useCallback((mapKey: string, value: string) => {
    if (tier === 'premium') {
      aiVoices.setVoiceForCharacter(mapKey, value)
    } else {
      const voice = browserVoices.find(v => v.name === value)
      if (voice) synthesis.setVoiceForCharacter(mapKey, voice)
    }
    setAssignments(prev => ({ ...prev, [mapKey]: value }))
  }, [tier, browserVoices])

  const otherChars = characterNames.filter(n => n !== selectedCharacter)
  const entries = [...otherChars, 'Narrator']

  const voiceOptions = tier === 'premium'
    ? aiVoices.OPENAI_VOICES.map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))
    : browserVoices.map(v => ({ value: v.name, label: v.name }))

  return (
    <div className="space-y-4">
      <h3 className="font-[family-name:var(--font-display)] font-bold text-sm uppercase tracking-wider text-text-secondary">
        Voice Quality
      </h3>

      <div className="flex rounded-lg overflow-hidden border border-text-dim">
        <button
          onClick={() => handleTierChange('free')}
          className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
            tier === 'free'
              ? 'bg-stage-elevated text-cream'
              : 'bg-stage-card text-text-dim hover:text-text-secondary'
          }`}
        >
          Free
          <span className="block text-[10px] mt-0.5 opacity-60">Browser voices</span>
        </button>
        <button
          onClick={() => handleTierChange('premium')}
          className={`flex-1 py-2 px-4 text-sm font-medium transition-colors relative ${
            tier === 'premium'
              ? 'bg-amber/20 text-amber border-l border-amber/30'
              : isPremium
                ? 'bg-stage-card text-text-dim hover:text-text-secondary border-l border-text-dim'
                : 'bg-stage-card text-text-dim border-l border-text-dim cursor-not-allowed opacity-50'
          }`}
          disabled={!isPremium}
        >
          Premium
          <span className="block text-[10px] mt-0.5 opacity-60">
            {!user ? 'Sign in to unlock' : !isPremium ? 'Ask admin for access' : 'OpenAI TTS'}
          </span>
        </button>
      </div>

      {voiceOptions.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-[family-name:var(--font-display)] font-bold text-xs uppercase tracking-wider text-text-secondary">
            Assign Voices
          </h4>
          {entries.map(name => {
            const mapKey = name === 'Narrator' ? '__narrator__' : name
            return (
              <div key={name} className="flex items-center justify-between gap-4 py-1">
                <span className="text-sm text-text-primary">{name}</span>
                <select
                  value={assignments[mapKey] || ''}
                  onChange={(e) => handleVoiceChange(mapKey, e.target.value)}
                  className="bg-stage-elevated text-text-primary border border-text-dim rounded px-2 py-1 text-sm focus:border-amber focus:outline-none max-w-[200px]"
                >
                  {voiceOptions.map(v => (
                    <option key={v.value} value={v.value}>{v.label}</option>
                  ))}
                </select>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
