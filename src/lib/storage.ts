import type { ScriptEntry } from '@/types'

const STORAGE_KEY = 'linereader_saved_scripts'

export type SavedScript = {
  script: ScriptEntry[]
  savedAt: string
}

export function getSavedScripts(): Record<string, SavedScript> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

export function saveScript(name: string, script: ScriptEntry[]) {
  const saved = getSavedScripts()
  saved[name] = { script, savedAt: new Date().toISOString() }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
}

export function deleteScript(name: string) {
  const saved = getSavedScripts()
  delete saved[name]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
}

export function exportScriptAsJson(script: ScriptEntry[]) {
  const blob = new Blob([JSON.stringify(script, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'script.json'
  a.click()
  URL.revokeObjectURL(url)
}

export function importScriptFromJson(file: File): Promise<ScriptEntry[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result as string))
      } catch {
        reject(new Error('Invalid JSON file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}
