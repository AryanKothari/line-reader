'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useScriptStore } from '@/stores/script-store'
import * as synthesis from '@/lib/speech/synthesis'
import * as recognition from '@/lib/speech/recognition'
import * as aiVoices from '@/lib/ai-voices'
import { fuzzyMatch } from '@/lib/speech/matching'

export function useRehearsal() {
  const store = useScriptStore()
  const resolveRef = useRef<(() => void) | null>(null)
  const runningRef = useRef(false)

  const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

  const processLine = useCallback(async (index: number) => {
    const { parsedScript, selectedCharacter } = useScriptStore.getState()
    if (index >= parsedScript.length) {
      useScriptStore.getState().setRunning(false)
      return
    }

    useScriptStore.getState().setCurrentLineIndex(index)
    const entry = parsedScript[index]

    if (useScriptStore.getState().isPaused || !runningRef.current) return

    if (entry.character === selectedCharacter && entry.type === 'dialogue') {
      // User's turn — show typing input, listen for speech
      useScriptStore.getState().startUserTurn()
      await waitForUserTurn(entry.line)
      useScriptStore.getState().clearUserTurn()
      if (!runningRef.current || useScriptStore.getState().isPaused) return
      await delay(400)
      processLine(index + 1)
    } else {
      // Other character or direction — speak
      let spoken = false
      if (aiVoices.isEnabled()) {
        spoken = await aiVoices.speak(entry.line, entry.character)
      }
      if (!spoken) {
        await synthesis.speak(entry.line, entry.character)
      }
      if (!runningRef.current || useScriptStore.getState().isPaused) return
      await delay(300)
      processLine(index + 1)
    }
  }, [])

  const waitForUserTurn = (expectedLine: string): Promise<void> => {
    return new Promise(resolve => {
      let resolved = false

      const done = () => {
        if (resolved) return
        resolved = true
        recognition.stopListening()
        resolve()
      }

      resolveRef.current = done

      // Listen for speech — correct match advances, wrong match counts as attempt
      let speechTimeout: ReturnType<typeof setTimeout> | null = null
      let currentSpeech = ''

      recognition.startListening(({ final: finalText, interim }) => {
        if (resolved) return
        const state = useScriptStore.getState()

        if (finalText.trim()) currentSpeech += ' ' + finalText.trim()
        const allText = (currentSpeech + ' ' + interim).trim()

        if (allText && fuzzyMatch(allText, expectedLine)) {
          if (speechTimeout) clearTimeout(speechTimeout)
          done()
          return
        }

        // When we get final text, start a timer — if no more speech comes,
        // treat it as a completed (wrong) attempt
        if (finalText.trim() && state.userTurnPhase === 'typing') {
          if (speechTimeout) clearTimeout(speechTimeout)
          speechTimeout = setTimeout(() => {
            if (resolved) return
            const s = useScriptStore.getState()
            if (s.userTurnPhase !== 'typing') return

            // Count as a failed voice attempt
            const correct = s.submitAttempt(currentSpeech.trim())
            currentSpeech = ''
            if (correct) {
              done()
            }
          }, 2000) // 2s silence = attempt is done
        }

        // In revealed phase, accept any speech match
        if (allText && state.userTurnPhase === 'revealed' && fuzzyMatch(allText, expectedLine)) {
          if (speechTimeout) clearTimeout(speechTimeout)
          done()
        }
      })
    })
  }

  // Watch for correct typed submission to resolve the turn
  const handleTypedCorrect = useCallback(() => {
    if (resolveRef.current) {
      resolveRef.current()
      resolveRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    recognition.initRecognition()
    runningRef.current = true
    useScriptStore.getState().setRunning(true)
    useScriptStore.getState().resume()
    processLine(0)
  }, [processLine])

  const manualAdvance = useCallback(() => {
    if (resolveRef.current) {
      resolveRef.current()
      resolveRef.current = null
      return
    }
    const { isPaused, isRunning, currentLineIndex } = useScriptStore.getState()
    if (!isPaused && isRunning) {
      synthesis.stopSpeaking()
      recognition.stopListening()
      processLine(currentLineIndex + 1)
    } else if (isPaused) {
      useScriptStore.getState().resume()
      processLine(useScriptStore.getState().currentLineIndex)
    }
  }, [processLine])

  const goBack = useCallback(() => {
    const { currentLineIndex } = useScriptStore.getState()
    if (currentLineIndex <= 0) return
    synthesis.stopSpeaking()
    recognition.stopListening()
    resolveRef.current = null
    useScriptStore.getState().clearUserTurn()
    processLine(currentLineIndex - 1)
  }, [processLine])

  const pause = useCallback(() => {
    useScriptStore.getState().pause()
    synthesis.stopSpeaking()
    recognition.stopListening()
  }, [])

  const resume = useCallback(() => {
    useScriptStore.getState().resume()
    processLine(useScriptStore.getState().currentLineIndex)
  }, [processLine])

  const restart = useCallback(() => {
    synthesis.stopSpeaking()
    recognition.stopListening()
    resolveRef.current = null
    useScriptStore.getState().clearUserTurn()
    useScriptStore.getState().resume()
    processLine(0)
  }, [processLine])

  const stop = useCallback(() => {
    runningRef.current = false
    useScriptStore.getState().setRunning(false)
    useScriptStore.getState().clearUserTurn()
    synthesis.stopSpeaking()
    recognition.shutdownRecognition()
    resolveRef.current = null
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!store.isRunning && !store.isPaused) return
      // Don't capture keys when user is typing in the input
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return
      switch (e.key) {
        case ' ':
        case 'ArrowRight':
          e.preventDefault()
          manualAdvance()
          break
        case 'ArrowLeft':
          goBack()
          break
        case 'p':
          store.isPaused ? resume() : pause()
          break
        case 'r':
          restart()
          break
        case 'h':
          useScriptStore.getState().toggleMode()
          break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [store.isRunning, store.isPaused, manualAdvance, goBack, resume, pause, restart])

  return { start, stop, manualAdvance, goBack, pause, resume, restart, handleTypedCorrect }
}
