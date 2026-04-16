'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useScriptStore } from '@/stores/script-store'
import { Logo } from '@/components/shared/Logo'
import { ScriptView } from '@/components/rehearsal/ScriptView'
import { Controls } from '@/components/rehearsal/Controls'
import { useRehearsal } from '@/hooks/useRehearsal'

export default function RehearsalPage() {
  const router = useRouter()
  const store = useScriptStore()
  const rehearsal = useRehearsal()

  const characterNames = store.characters.map(c => c.name)

  useEffect(() => {
    if (!store.parsedScript.length || !store.selectedCharacter) {
      router.push('/')
      return
    }
    const timer = setTimeout(() => rehearsal.start(), 500)
    return () => {
      clearTimeout(timer)
      rehearsal.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!store.parsedScript.length || !store.selectedCharacter) return null

  const total = store.parsedScript.length
  const current = store.currentLineIndex + 1
  const progress = total > 0 ? (current / total) * 100 : 0
  const isComplete = current >= total && !store.isRunning

  return (
    <div className="h-screen flex flex-col">
      <header className="flex items-center gap-4 p-3 border-b border-text-dim/20">
        <button
          onClick={() => { rehearsal.stop(); router.push('/setup') }}
          className="text-text-secondary hover:text-cream transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <Logo size="xs" />
        <div className="flex-1 flex flex-col items-center gap-1">
          <span className="text-xs text-text-secondary">
            {isComplete ? 'Complete!' : `Line ${Math.max(current, 0)} of ${total}`}
          </span>
          <div className="w-48 h-1.5 bg-stage-card rounded-full overflow-hidden">
            <div className="h-full bg-amber rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <button
          onClick={() => store.toggleMode()}
          className="text-text-secondary hover:text-cream transition-colors"
          title="Toggle line visibility"
        >
          {store.practiceMode ? (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 4C6 4 2 11 2 11s4 7 9 7 9-7 9-7-4-7-9-7z" stroke="currentColor" strokeWidth="1.5" /><circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="1.5" /></svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 3l16 16M11 4C6 4 2 11 2 11s1.5 2.7 4.2 4.8M11 18c1.5 0 2.9-.4 4.1-1M14 11a3 3 0 00-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          )}
        </button>
      </header>

      <ScriptView
        entries={store.parsedScript}
        currentIndex={store.currentLineIndex}
        selectedCharacter={store.selectedCharacter}
        practiceMode={store.practiceMode}
        characterNames={characterNames}
      />

      {store.isRunning && !isComplete && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 text-amber text-sm">
          <div className="w-3 h-3 bg-amber rounded-full animate-pulse" />
          Listening...
        </div>
      )}

      <Controls
        isPaused={store.isPaused}
        onRestart={rehearsal.restart}
        onBack={rehearsal.goBack}
        onPauseResume={() => store.isPaused ? rehearsal.resume() : rehearsal.pause()}
        onNext={rehearsal.manualAdvance}
        onSkipToEnd={() => {
          rehearsal.stop()
          store.setCurrentLineIndex(store.parsedScript.length - 1)
        }}
      />
    </div>
  )
}
