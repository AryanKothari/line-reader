import { getSupabase } from '@line-reader/shared'

let enabled = false
const voiceMap = new Map<string, string>()

const TTS_VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']

export function isEnabled(): boolean {
  return enabled
}

export function setEnabled(val: boolean): void {
  enabled = val
}

export function assignVoice(character: string, voice: string): void {
  voiceMap.set(character, voice)
}

export function getVoice(character: string): string | undefined {
  return voiceMap.get(character)
}

export function getAvailableVoices(): string[] {
  return TTS_VOICES
}

export function autoAssignVoices(characters: string[]): void {
  characters.forEach((char, i) => {
    voiceMap.set(char, TTS_VOICES[i % TTS_VOICES.length])
  })
}

export async function speak(
  _text: string,
  _character: string,
  _sceneNotes?: string
): Promise<boolean> {
  // AI voice playback requires expo-av which has SDK 55 compatibility issues.
  // Will be re-enabled once expo-av is fixed upstream.
  // For now, falls back to expo-speech (system TTS) in useRehearsal.
  return false
}

export function clearVoices(): void {
  voiceMap.clear()
  enabled = false
}
