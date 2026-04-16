'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getProjects, deleteProject, type Project } from '@/lib/projects'

type Props = {
  onLoad: (project: Project) => void
}

export function ProjectsList({ onLoad }: Props) {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      setProjects([])
      return
    }
    setLoading(true)
    getProjects().then(setProjects).finally(() => setLoading(false))
  }, [user])

  if (!user || (!loading && !projects.length)) return null

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return
    await deleteProject(id)
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="max-w-md mx-auto mt-8 w-full">
      <h3 className="font-[family-name:var(--font-display)] font-bold text-center mb-3">My Projects</h3>
      {loading ? (
        <div className="text-center text-text-dim text-sm">Loading...</div>
      ) : (
        <div className="flex flex-col gap-2">
          {projects.map(project => {
            const date = new Date(project.updated_at).toLocaleDateString()
            const charCount = new Set(
              project.entries.filter(e => e.character !== 'STAGE DIRECTION').map(e => e.character)
            ).size
            return (
              <div
                key={project.id}
                onClick={() => onLoad(project)}
                className="flex items-center justify-between p-3 bg-stage-card rounded-lg border border-transparent hover:border-amber-dim cursor-pointer transition-all group"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-text-primary truncate">{project.title}</div>
                  <div className="text-xs text-text-secondary">
                    {project.entries.length} lines &middot; {charCount} character{charCount !== 1 ? 's' : ''} &middot; {date}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(project.id, project.title) }}
                  className="text-text-dim hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity text-lg px-2 flex-shrink-0"
                >
                  &times;
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
