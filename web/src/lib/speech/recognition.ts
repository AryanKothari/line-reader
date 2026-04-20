import type { SpeechResult } from '@line-reader/shared'

type ResultCallback = (result: SpeechResult) => void

/* eslint-disable @typescript-eslint/no-explicit-any */
const SpeechRecognitionAPI: any =
  typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null

let recognition: any = null
let onResultCallback: ResultCallback | null = null
let isListening = false
let recognitionActive = false

function ensureRecognitionRunning() {
  if (!recognition || recognitionActive) return
  try {
    recognition.start()
    recognitionActive = true
  } catch {
    /* already started */
  }
}

export function initRecognition() {
  if (!SpeechRecognitionAPI || recognition) return

  recognition = new SpeechRecognitionAPI()
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = 'en-US'

  recognition.onresult = (event: any) => {
    let finalTranscript = ''
    let interimTranscript = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript
      if (event.results[i].isFinal) {
        finalTranscript += transcript
      } else {
        interimTranscript += transcript
      }
    }
    onResultCallback?.({ final: finalTranscript, interim: interimTranscript })
  }

  recognition.onerror = (event: any) => {
    if (event.error === 'no-speech' || event.error === 'aborted') return
    console.warn('Speech recognition error:', event.error)
  }

  recognition.onend = () => {
    recognitionActive = false
    if (isListening) {
      ensureRecognitionRunning()
    }
  }
}

export function startListening(callback: ResultCallback): boolean {
  if (!recognition) {
    console.warn('Speech recognition not available')
    return false
  }
  onResultCallback = callback
  isListening = true
  ensureRecognitionRunning()
  return true
}

export function stopListening() {
  isListening = false
  onResultCallback = null
}

export function shutdownRecognition() {
  isListening = false
  onResultCallback = null
  recognitionActive = false
  if (recognition) {
    try { recognition.stop() } catch { /* not started */ }
  }
}

export function isRecognitionSupported(): boolean {
  return !!SpeechRecognitionAPI
}
