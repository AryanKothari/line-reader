'use client'

import { useEffect, useState } from 'react'
import * as synthesis from '@/lib/speech/synthesis'

type Props = {
  characterNames: string[]
  selectedCharacter: string | null
}

export function VoiceAssignment({ characterNames, selectedCharacter }: Props) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    const loadVoices = () => setVoices(synthesis.getEnglishVoices())
    loadVoices()
    speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => speechSynthesis.removeEventListener('voiceschanged', loadVoices)
  }, [])

  const otherChars = characterNames.filter(n => n !== selectedCharacter)
  const entries = [...otherChars, 'Narrator']
  const voiceMap = synthesis.getCharacterVoiceMap()

  if (!voices.length) return null

  return (
    <div className="space-y-2">
      <h3 className="font-[family-name:var(--font-display)] font-bold text-sm uppercase tracking-wider text-text-secondary">
        Voice Assignments
      </h3>
      {entries.map(name => {
        const mapKey = name === 'Narrator' ? '__narrator__' : name
        const assigned = voiceMap[mapKey]
        return (
          <div key={name} className="flex items-center justify-between gap-4 py-1">
            <span className="text-sm text-text-primary">{name}</span>
            <select
              value={assigned?.name || ''}
              onChange={(e) => {
                const voice = voices.find(v => v.name === e.target.value)
                if (voice) synthesis.setVoiceForCharacter(mapKey, voice)
              }}
              className="bg-stage-elevated text-text-primary border border-text-dim rounded px-2 py-1 text-sm focus:border-amber focus:outline-none max-w-[200px]"
            >
              {voices.map(v => (
                <option key={v.name} value={v.name}>{v.name}</option>
              ))}
            </select>
          </div>
        )
      })}
    </div>
  )
}
