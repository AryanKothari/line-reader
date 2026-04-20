'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ScriptEntry } from '@line-reader/shared'

type Props = {
  entry: ScriptEntry
  index: number
  characterNames: string[]
  onUpdateLine: (index: number, line: string) => void
  onUpdateCharacter: (index: number, character: string) => void
  onDelete: (index: number) => void
}

export function ScriptLineEditor({
  entry,
  index,
  characterNames,
  onUpdateLine,
  onUpdateCharacter,
  onDelete,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: index.toString(),
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-2 p-2 rounded-lg bg-stage-card border-2 border-transparent
        hover:bg-stage-hover transition-all
        ${isDragging ? 'opacity-40 border-amber' : ''}
        ${entry.type === 'direction' ? 'italic opacity-70' : ''}
      `}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-text-dim hover:text-text-secondary text-sm px-1 flex-shrink-0"
        title="Drag to reorder"
      >
        &#x2630;
      </button>

      <select
        value={entry.character}
        onChange={(e) => onUpdateCharacter(index, e.target.value)}
        className="bg-stage-elevated text-text-primary border border-text-dim rounded px-2 py-1 text-xs font-[family-name:var(--font-display)] font-bold uppercase tracking-wider min-w-[90px] flex-shrink-0 focus:border-amber focus:outline-none"
      >
        {characterNames.map(name => (
          <option key={name} value={name}>{name}</option>
        ))}
        <option value="STAGE DIRECTION">Stage Direction</option>
      </select>

      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onUpdateLine(index, e.currentTarget.textContent?.trim() || '')}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur() } }}
        className="flex-1 min-w-0 px-2 py-1 rounded border border-transparent hover:border-text-dim focus:border-amber focus:bg-stage-elevated outline-none transition-all"
      >
        {entry.line}
      </div>

      <button
        onClick={() => onDelete(index)}
        className="flex-shrink-0 w-6 h-6 text-text-dim hover:text-danger hover:bg-danger/15 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-lg"
        style={{ opacity: undefined }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
        title="Delete line"
      >
        &times;
      </button>
    </div>
  )
}
