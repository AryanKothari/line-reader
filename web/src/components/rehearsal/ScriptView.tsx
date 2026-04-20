'use client'

import { useEffect, useRef } from 'react'
import type { ScriptEntry } from '@line-reader/shared'

const CHAR_COLORS = ['text-rose-400', 'text-green-400', 'text-blue-400', 'text-purple-400', 'text-orange-400', 'text-teal-400']

type Props = {
  entries: ScriptEntry[]
  currentIndex: number
  selectedCharacter: string
  characterNames: string[]
}

export function ScriptView({ entries, currentIndex, selectedCharacter, characterNames }: Props) {
  const currentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    currentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [currentIndex])

  const colorMap = new Map<string, string>()
  characterNames.forEach((name, i) => colorMap.set(name, CHAR_COLORS[i % CHAR_COLORS.length]))

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
      {entries.map((entry, i) => {
        if (i > currentIndex) return null // hide future lines

        const isCurrent = i === currentIndex
        const isUser = entry.character === selectedCharacter && entry.type === 'dialogue'
        const isDirection = entry.type === 'direction'
        const charLabel = isDirection && entry.character === 'STAGE DIRECTION' ? 'Stage Direction' : entry.character
        const charColor = colorMap.get(entry.character) || 'text-text-secondary'

        // Always hide user's current line — they need to type or speak it
        const hideText = isUser && isCurrent

        return (
          <div
            key={i}
            ref={isCurrent ? currentRef : undefined}
            className={`
              p-3 rounded-lg transition-all duration-300
              ${isCurrent
                ? isUser
                  ? 'bg-amber-glow border-l-[3px] border-amber'
                  : 'bg-cream-faint'
                : 'opacity-50'}
              ${isDirection ? 'italic' : ''}
            `}
          >
            <div className={`font-[family-name:var(--font-display)] font-bold text-xs uppercase tracking-widest mb-1 ${isDirection ? 'text-text-dim' : charColor}`}>
              {charLabel}
            </div>
            <div className={`text-base leading-relaxed ${isDirection ? 'text-text-secondary text-sm italic' : ''}`}>
              {hideText ? (
                <span className="text-amber-dim italic text-sm">Your turn</span>
              ) : (
                entry.line
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
