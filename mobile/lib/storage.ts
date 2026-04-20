import AsyncStorage from '@react-native-async-storage/async-storage'
import type { ScriptEntry } from '@line-reader/shared'

const STORAGE_KEY = 'linereader_saved_scripts'

export type SavedScript = {
  script: ScriptEntry[]
  savedAt: string
}

export async function getSavedScripts(): Promise<Record<string, SavedScript>> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export async function saveScript(name: string, script: ScriptEntry[]): Promise<void> {
  const saved = await getSavedScripts()
  saved[name] = { script, savedAt: new Date().toISOString() }
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
}

export async function deleteScript(name: string): Promise<void> {
  const saved = await getSavedScripts()
  delete saved[name]
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
}
