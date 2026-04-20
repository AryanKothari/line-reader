import { getSupabase } from './supabase'
import type { ScriptEntry } from '../types'

export type Project = {
  id: string
  user_id: string
  title: string
  entries: ScriptEntry[]
  selected_character: string | null
  created_at: string
  updated_at: string
}

export async function getProjects(): Promise<Project[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getProject(id: string): Promise<Project | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function saveProject(project: {
  id?: string
  title: string
  entries: ScriptEntry[]
  selected_character?: string | null
}): Promise<Project> {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  if (project.id) {
    const { data, error } = await supabase
      .from('projects')
      .update({
        title: project.title,
        entries: project.entries,
        selected_character: project.selected_character || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', project.id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      title: project.title,
      entries: project.entries,
      selected_character: project.selected_character || null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = getSupabase()
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
  if (error) throw error
}
