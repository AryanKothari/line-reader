'use client'

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { ScriptLineEditor } from './ScriptLineEditor'
import type { ScriptEntry } from '@/types'

type Props = {
  entries: ScriptEntry[]
  characterNames: string[]
  onUpdateLine: (index: number, line: string) => void
  onUpdateCharacter: (index: number, character: string) => void
  onDelete: (index: number) => void
  onReorder: (from: number, to: number) => void
  onAddLine: () => void
}

export function DragList({
  entries,
  characterNames,
  onUpdateLine,
  onUpdateCharacter,
  onDelete,
  onReorder,
  onAddLine,
}: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = parseInt(active.id as string, 10)
    const to = parseInt(over.id as string, 10)
    onReorder(from, to)
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto space-y-1 p-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={entries.map((_, i) => i.toString())} strategy={verticalListSortingStrategy}>
            {entries.map((entry, i) => (
              <ScriptLineEditor
                key={`${i}-${entry.character}`}
                entry={entry}
                index={i}
                characterNames={characterNames}
                onUpdateLine={onUpdateLine}
                onUpdateCharacter={onUpdateCharacter}
                onDelete={onDelete}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
      <button
        onClick={onAddLine}
        className="w-full p-2 border-2 border-dashed border-text-dim rounded-lg text-text-secondary text-sm hover:border-amber hover:text-amber transition-all flex-shrink-0"
      >
        + Add Line
      </button>
    </div>
  )
}
