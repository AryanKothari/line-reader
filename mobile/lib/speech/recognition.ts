import type { SpeechResult } from '@line-reader/shared'

// @react-native-voice/voice requires a dev build (not Expo Go)
// This module will be fully implemented in Phase 4 when we set up dev builds

type SpeechCallback = (result: SpeechResult) => void

let currentCallback: SpeechCallback | null = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Voice: any = null

export function initRecognition(): void {
  try {
    Voice = require('@react-native-voice/voice').default
    if (Voice) {
      Voice.onSpeechResults = (e: { value?: string[] }) => {
        if (currentCallback && e.value?.[0]) {
          currentCallback({ final: e.value[0], interim: '' })
        }
      }
      Voice.onSpeechPartialResults = (e: { value?: string[] }) => {
        if (currentCallback && e.value?.[0]) {
          currentCallback({ final: '', interim: e.value[0] })
        }
      }
    }
  } catch {
    console.warn('Speech recognition not available (requires dev build)')
  }
}

export function startListening(callback: SpeechCallback): void {
  currentCallback = callback
  try {
    Voice?.start('en-US')
  } catch {
    console.warn('Failed to start speech recognition')
  }
}

export function stopListening(): void {
  currentCallback = null
  try {
    Voice?.stop()
  } catch {
    // ignore
  }
}

export function shutdownRecognition(): void {
  currentCallback = null
  try {
    Voice?.destroy()
  } catch {
    // ignore
  }
}
