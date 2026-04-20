import { Audio } from 'expo-av'
import * as FileSystem from 'expo-file-system'
import { getSupabase } from '@line-reader/shared'

let enabled = false
const voiceMap = new Map<string, string>()

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

export async function speak(
  text: string,
  character: string,
  sceneNotes?: string
): Promise<boolean> {
  if (!enabled) return false

  const voice = voiceMap.get(character)
  if (!voice) return false

  try {
    const supabase = getSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return false

    // Call the TTS edge function (or API route)
    // For now this is a placeholder — will be connected in Phase 5
    // when we deploy Supabase Edge Functions
    return false
  } catch {
    return false
  }
}

export function clearVoices(): void {
  voiceMap.clear()
  enabled = false
}
