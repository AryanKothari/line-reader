import * as Speech from 'expo-speech'
import type { Character } from '@line-reader/shared'

const voiceAssignments = new Map<string, string>()

export async function assignVoices(characters: Character[]): Promise<void> {
  const voices = await Speech.getAvailableVoicesAsync()
  const englishVoices = voices.filter(v =>
    v.language.startsWith('en') && v.quality === 'Enhanced'
  )
  const fallbackVoices = voices.filter(v => v.language.startsWith('en'))
  const pool = englishVoices.length > 0 ? englishVoices : fallbackVoices

  voiceAssignments.clear()
  characters.forEach((char, i) => {
    if (pool.length > 0) {
      voiceAssignments.set(char.name, pool[i % pool.length].identifier)
    }
  })
}

export async function speak(text: string, character: string): Promise<void> {
  return new Promise((resolve) => {
    const voice = voiceAssignments.get(character)
    Speech.speak(text, {
      voice: voice || undefined,
      rate: 0.95,
      onDone: resolve,
      onStopped: resolve,
      onError: () => resolve(),
    })
  })
}

export function stopSpeaking(): void {
  Speech.stop()
}
