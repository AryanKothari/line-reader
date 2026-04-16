'use client'

import { useEffect, useState, useCallback } from 'react'
import * as synthesis from '@/lib/speech/synthesis'
import * as aiVoices from '@/lib/ai-voices'

type Props = {
  characterNames: string[]
  selectedCharacter: string | null
}

export function VoiceAssignment({ characterNames, selectedCharacter }: Props) {
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([])
  const [assignments, setAssignments] = useState<Record<string, string>>({})
  const [aiEnabled, setAiEnabled] = useState(false)

  // Poll AI enabled state (it's set from a sibling component)
  useEffect(() => {
    const interval = setInterval(() => setAiEnabled(aiVoices.isEnabled()), 500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const loadVoices = () => setBrowserVoices(synthesis.getEnglishVoices())
    loadVoices()
    speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => speechSynthesis.removeEventListener('voiceschanged', loadVoices)
  }, [])

  // Sync assignments from the active voice map
  useEffect(() => {
    if (aiEnabled) {
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
  }, [browserVoices, selectedCharacter, aiEnabled])

  const handleChange = useCallback((mapKey: string, value: string) => {
    if (aiEnabled) {
      aiVoices.setVoiceForCharacter(mapKey, value)
    } else {
      const voice = browserVoices.find(v => v.name === value)
      if (voice) synthesis.setVoiceForCharacter(mapKey, voice)
    }
    setAssignments(prev => ({ ...prev, [mapKey]: value }))
  }, [aiEnabled, browserVoices])

  const otherChars = characterNames.filter(n => n !== selectedCharacter)
  const entries = [...otherChars, 'Narrator']

  const voiceOptions = aiEnabled
    ? aiVoices.OPENAI_VOICES.map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))
    : browserVoices.map(v => ({ value: v.name, label: v.name }))

  if (!voiceOptions.length) return null

  return (
    <div className="space-y-2">
      <h3 className="font-[family-name:var(--font-display)] font-bold text-xs uppercase tracking-wider text-text-secondary">
        Voice Assignments {aiEnabled && <span className="text-amber">(AI)</span>}
      </h3>
      {entries.map(name => {
        const mapKey = name === 'Narrator' ? '__narrator__' : name
        return (
          <div key={name} className="flex items-center justify-between gap-4 py-1">
            <span className="text-sm text-text-primary">{name}</span>
            <select
              value={assignments[mapKey] || ''}
              onChange={(e) => handleChange(mapKey, e.target.value)}
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
  )
}
