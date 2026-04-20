import { Audio } from 'expo-av'
import * as FileSystem from 'expo-file-system'
import { getSupabase } from '@line-reader/shared'
import Constants from 'expo-constants'

let enabled = false
const voiceMap = new Map<string, string>()
let currentSound: Audio.Sound | null = null

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

    const apiBase = Constants.expoConfig?.extra?.apiUrl
      ?? process.env.EXPO_PUBLIC_API_URL
      ?? ''

    if (!apiBase) return false

    const response = await fetch(`${apiBase}/api/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        text,
        voice,
        instructions: sceneNotes
          ? `You are playing the character ${character}. Scene context: ${sceneNotes}`
          : undefined,
      }),
    })

    if (!response.ok) return false

    const arrayBuffer = await response.arrayBuffer()
    const base64 = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    )

    const tempFile = `${FileSystem.cacheDirectory}tts_${Date.now()}.mp3`
    await FileSystem.writeAsStringAsync(tempFile, base64, {
      encoding: FileSystem.EncodingType.Base64,
    })

    await stopCurrentSound()

    const { sound } = await Audio.Sound.createAsync({ uri: tempFile })
    currentSound = sound

    await sound.playAsync()

    return new Promise((resolve) => {
      sound.setOnPlaybackStatusUpdate((status) => {
        if ('didJustFinish' in status && status.didJustFinish) {
          sound.unloadAsync()
          currentSound = null
          FileSystem.deleteAsync(tempFile, { idempotent: true })
          resolve(true)
        }
      })
    })
  } catch {
    return false
  }
}

async function stopCurrentSound(): Promise<void> {
  if (currentSound) {
    try {
      await currentSound.stopAsync()
      await currentSound.unloadAsync()
    } catch {
      // ignore
    }
    currentSound = null
  }
}

export function clearVoices(): void {
  voiceMap.clear()
  enabled = false
  stopCurrentSound()
}
