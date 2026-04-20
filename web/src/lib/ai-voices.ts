import type { Character } from '@line-reader/shared'
import { supabase } from './supabase'

export const OPENAI_VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] as const

let enabled = false
let audioContext: AudioContext | null = null
let characterVoiceMap: Record<string, string> = {}

export function setEnabled(val: boolean) {
  enabled = val
}

export function isEnabled() {
  return enabled
}

export function assignVoices(characters: Character[], userCharacter: string) {
  characterVoiceMap = {}
  let idx = 0
  for (const char of characters) {
    if (char.name === userCharacter) continue
    characterVoiceMap[char.name] = OPENAI_VOICES[idx % OPENAI_VOICES.length]
    idx++
  }
  characterVoiceMap['__narrator__'] = 'onyx'
}

export function getCharacterVoiceMap() {
  return characterVoiceMap
}

export function setVoiceForCharacter(name: string, voice: string) {
  characterVoiceMap[name] = voice
}

async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

export async function speak(text: string, characterName: string, sceneNotes?: string): Promise<boolean> {
  if (!enabled) return false

  const token = await getAuthToken()
  if (!token) return false

  if (!audioContext) {
    audioContext = new AudioContext()
  }

  const isNarrator = characterName === 'STAGE DIRECTION'
  const voice = isNarrator
    ? characterVoiceMap['__narrator__'] || 'onyx'
    : characterVoiceMap[characterName] || 'alloy'
  const speed = isNarrator ? 0.9 : 1.0

  let instructions: string | undefined
  if (sceneNotes?.trim()) {
    instructions = isNarrator
      ? `You are reading stage directions for a scene. Context: ${sceneNotes}`
      : `You are reading the lines of the character "${characterName}". Deliver with appropriate emotion and tone. Context: ${sceneNotes}`
  }

  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text, voice, speed, instructions }),
    })

    if (!response.ok) return false

    const arrayBuffer = await response.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    const source = audioContext.createBufferSource()
    source.buffer = audioBuffer
    source.connect(audioContext.destination)

    return new Promise(resolve => {
      source.onended = () => resolve(true)
      source.start(0)
    })
  } catch {
    return false
  }
}
