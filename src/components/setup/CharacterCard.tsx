'use client'

import type { Character } from '@/types'

const COLORS = ['bg-rose-400', 'bg-green-400', 'bg-blue-400', 'bg-purple-400', 'bg-orange-400', 'bg-teal-400']

type Props = {
  character: Character
  index: number
  selected: boolean
  onSelect: () => void
}

export function CharacterCard({ character, index, selected, onSelect }: Props) {
  return (
    <div
      onClick={onSelect}
      className={`
        flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all
        ${selected
          ? 'border-2 border-amber bg-amber-glow shadow-[0_0_20px_var(--color-amber-glow)]'
          : 'border-2 border-transparent bg-stage-card hover:bg-stage-hover hover:border-text-dim'}
      `}
    >
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-full ${COLORS[index % COLORS.length]} flex items-center justify-center font-[family-name:var(--font-display)] font-black text-lg text-stage-deep`}>
          {character.name.charAt(0)}
        </div>
        <div>
          <div className="font-[family-name:var(--font-display)] font-bold text-lg">{character.name}</div>
          <div className="text-xs text-text-secondary">{character.lineCount} line{character.lineCount !== 1 ? 's' : ''}</div>
        </div>
      </div>
      {selected && (
        <span className="text-xs font-medium uppercase tracking-wider px-3 py-1 rounded-full bg-amber-glow text-amber">
          You
        </span>
      )}
    </div>
  )
}
