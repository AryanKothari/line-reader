'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useScriptStore } from '@line-reader/shared'
import { Logo } from '@/components/shared/Logo'
import { SaveButton } from '@/components/shared/SaveButton'
import { ScriptView } from '@/components/rehearsal/ScriptView'
import { Controls } from '@/components/rehearsal/Controls'
import { UserTurnInput } from '@/components/rehearsal/UserTurnInput'
import { CompletionScreen } from '@/components/rehearsal/CompletionScreen'
import { ScriptPanel } from '@/components/rehearsal/ScriptPanel'
import { useRehearsal } from '@/hooks/useRehearsal'

export default function RehearsalPage() {
  const router = useRouter()
  const store = useScriptStore()
  const rehearsal = useRehearsal()
  const [showScript, setShowScript] = useState(false)

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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowScript(s => !s)}
            title="View full script"
            className={`p-2 rounded-lg transition-colors ${
              showScript ? 'bg-amber/20 text-amber' : 'text-text-secondary hover:text-cream hover:bg-stage-card'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 3h12v12H3V3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M6 7h6M6 10h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
          <SaveButton />
        </div>
      </header>

      <ScriptView
        entries={store.parsedScript}
        currentIndex={store.currentLineIndex}
        selectedCharacter={store.selectedCharacter}
        characterNames={characterNames}
      />

      <UserTurnInput onCorrect={rehearsal.handleTypedCorrect} />

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

      {isComplete && (
        <CompletionScreen
          onRestart={() => { rehearsal.restart() }}
          onHome={() => { rehearsal.stop(); store.reset(); router.push('/') }}
        />
      )}

      {showScript && <ScriptPanel onClose={() => setShowScript(false)} />}
    </div>
  )
}
