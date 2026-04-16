'use client'

import { useState, useRef, useEffect } from 'react'
import { useScriptStore } from '@/stores/script-store'

type Props = {
  onCorrect: () => void
}

export function UserTurnInput({ onCorrect }: Props) {
  const { userTurnPhase, attemptsLeft, lastAttempt, submitAttempt, parsedScript, currentLineIndex } = useScriptStore()
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const expectedLine = parsedScript[currentLineIndex]?.line || ''

  useEffect(() => {
    setText('')
    inputRef.current?.focus()
  }, [currentLineIndex, userTurnPhase])

  if (!userTurnPhase) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    const correct = submitAttempt(text.trim())
    if (correct) {
      onCorrect()
    } else {
      setText('')
      inputRef.current?.focus()
    }
  }

  if (userTurnPhase === 'revealed') {
    return (
      <div className="mx-4 mb-4 p-4 bg-stage-card rounded-xl border border-amber/30">
        <div className="text-sm text-text-secondary mb-2">The line was:</div>
        <div className="text-lg text-cream font-medium mb-3">{expectedLine}</div>
        <div className="flex items-center gap-2 text-amber text-sm">
          <div className="w-3 h-3 bg-amber rounded-full animate-pulse" />
          Now say it out loud to continue
        </div>
      </div>
    )
  }

  // typing phase
  return (
    <div className="mx-4 mb-4 p-4 bg-stage-card rounded-xl border border-text-dim/30">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-text-secondary">Your line — type or speak it</span>
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i < attemptsLeft ? 'bg-amber' : 'bg-text-dim/30'
              }`}
            />
          ))}
        </div>
      </div>

      {lastAttempt && (
        <div className="text-sm text-danger mb-2">
          Not quite — try again
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type the line..."
          className="flex-1 bg-stage-elevated text-cream border border-text-dim rounded-lg px-3 py-2 text-sm focus:border-amber focus:outline-none placeholder:text-text-dim"
          autoFocus
        />
        <button
          type="submit"
          className="px-4 py-2 bg-amber text-stage-deep font-semibold rounded-lg text-sm hover:bg-amber-dim transition-colors"
        >
          Submit
        </button>
      </form>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 text-text-dim text-xs">
          <div className="w-2 h-2 bg-text-dim rounded-full animate-pulse" />
          Or speak the line out loud
        </div>
        <span className="text-[10px] text-text-dim">
          Say &quot;line&quot; to reveal
        </span>
      </div>
    </div>
  )
}
