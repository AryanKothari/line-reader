'use client'

import type { Project } from '@line-reader/shared'

type Props = {
  project: Project
  onClick: () => void
  onDelete: () => void
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  return new Date(dateStr).toLocaleDateString()
}

export function ProjectCard({ project, onClick, onDelete }: Props) {
  const charCount = new Set(
    project.entries.filter(e => e.character !== 'STAGE DIRECTION').map(e => e.character)
  ).size

  return (
    <div
      onClick={onClick}
      className="bg-stage-card rounded-xl border border-transparent hover:border-amber-dim cursor-pointer transition-all group relative"
    >
      {/* Preview area */}
      <div className="h-28 bg-stage-elevated rounded-t-xl flex items-center justify-center px-4 overflow-hidden">
        <div className="text-center">
          <div className="text-2xl mb-1">🎭</div>
          <div className="text-xs text-text-dim">{charCount} character{charCount !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="font-semibold text-cream text-sm truncate">{project.title}</div>
        <div className="text-[11px] text-text-dim mt-1">
          {project.entries.length} lines &middot; {timeAgo(project.updated_at)}
        </div>
        {project.selected_character && (
          <div className="text-[10px] text-amber mt-1">Playing as {project.selected_character}</div>
        )}
      </div>

      {/* Delete */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete() }}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-stage-deep/80 text-text-dim hover:text-danger hover:bg-danger/15 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-all"
      >
        &times;
      </button>
    </div>
  )
}
