import type { Character } from '@/types'

const OPENAI_VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] as const

let apiKey = ''
let enabled = false
let audioContext: AudioContext | null = null
let characterVoiceMap: Record<string, string> = {}

export function initAiVoices() {
  if (typeof window === 'undefined') return
  const savedKey = localStorage.getItem('lineReader_openaiKey')
  if (savedKey) apiKey = savedKey
}

export function setApiKey(key: string) {
  apiKey = key
  localStorage.setItem('lineReader_openaiKey', key)
}

export function getApiKey() {
  return apiKey
}

export function setEnabled(val: boolean) {
  enabled = val
}

export function isEnabled() {
  return enabled && !!apiKey
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

export async function speak(text: string, characterName: string): Promise<boolean> {
  if (!isEnabled()) return false

  if (!audioContext) {
    audioContext = new AudioContext()
  }

  const isNarrator = characterName === 'STAGE DIRECTION'
  const voice = isNarrator
    ? characterVoiceMap['__narrator__'] || 'onyx'
    : characterVoiceMap[characterName] || 'alloy'
  const speed = isNarrator ? 0.9 : 1.0

  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice,
        speed,
        response_format: 'mp3',
      }),
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
