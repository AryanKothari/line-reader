'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useScriptStore } from '@/stores/script-store'
import { getProjects, deleteProject, type Project } from '@/lib/projects'
import { extractTextFromPdf } from '@/lib/parser/pdf-extract'
import { parseFromText } from '@/lib/parser/script-parser'
import { Logo } from '@/components/shared/Logo'
import { AuthButton } from '@/components/shared/AuthButton'
import { ProjectCard } from '@/components/dashboard/ProjectCard'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const store = useScriptStore()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
      return
    }
    if (user) {
      getProjects().then(setProjects).finally(() => setLoading(false))
    }
  }, [user, authLoading, router])

  if (authLoading || !user) return null

  const handleFile = async (file: File) => {
    setStatus('Reading your script...')
    store.setUploadedFile(file)
    store.setProject(null, null)

    try {
      if (file.name.endsWith('.json') || file.type === 'application/json') {
        const text = await file.text()
        const entries = JSON.parse(text)
        if (!Array.isArray(entries) || !entries.length || !entries[0].character) {
          setStatus(null)
          return
        }
        store.setParsedScript(entries)
        setStatus(null)
        router.push('/review')
        return
      }

      let rawText: string
      if (file.type === 'application/pdf') {
        rawText = await extractTextFromPdf(file, setStatus)
      } else {
        rawText = await file.text()
      }

      const result = parseFromText(rawText)
      if (!result.characters.length || !result.script.length) {
        setStatus(null)
        return
      }

      store.setParsedScript(result.script)
      setStatus(null)
      router.push('/review')
    } catch {
      setStatus(null)
    }
  }

  const handleOpenProject = (project: Project) => {
    store.setProject(project.id, project.title)
    store.setParsedScript(project.entries)
    if (project.selected_character) store.selectCharacter(project.selected_character)
    router.push('/setup')
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return
    await deleteProject(id)
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-text-dim/20">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <span className="text-text-secondary text-sm font-[family-name:var(--font-display)] italic hidden sm:inline">
            Your scene partner, on demand
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-amber text-stage-deep font-semibold rounded-lg text-sm hover:bg-amber-dim transition-colors"
          >
            + New Project
          </button>
          <AuthButton />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.json"
          className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = '' }}
        />
      </header>

      {/* Status */}
      {status && (
        <div className="flex items-center justify-center gap-3 py-3 text-cream-dim">
          <div className="w-5 h-5 border-2 border-amber border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">{status}</span>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 px-6 py-6 max-w-6xl mx-auto w-full">
        <div className="text-xs text-text-secondary uppercase tracking-widest font-[family-name:var(--font-display)] font-bold mb-4">
          My Projects
        </div>

        {loading ? (
          <div className="text-center text-text-dim py-20">Loading projects...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => handleOpenProject(project)}
                onDelete={() => handleDelete(project.id, project.title)}
              />
            ))}

            {/* Upload card */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border-2 border-dashed border-text-dim hover:border-amber cursor-pointer transition-all flex flex-col items-center justify-center min-h-[180px] gap-2 group"
            >
              <div className="text-2xl text-text-dim group-hover:text-amber transition-colors">+</div>
              <div className="text-sm text-text-dim group-hover:text-amber transition-colors">Upload script</div>
              <div className="text-[10px] text-text-dim/60">PDF, TXT, or JSON</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
