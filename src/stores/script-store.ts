import { create } from 'zustand'
import type { ScriptEntry, Character } from '@/types'
import { extractCharacters } from '@/lib/parser/script-parser'

interface ScriptStore {
  parsedScript: ScriptEntry[]
  characters: Character[]
  selectedCharacter: string | null
  uploadedFile: File | null

  // Rehearsal state
  currentLineIndex: number
  isPaused: boolean
  isRunning: boolean
  practiceMode: boolean

  // Actions
  setParsedScript: (entries: ScriptEntry[]) => void
  setUploadedFile: (file: File | null) => void
  updateLine: (index: number, line: string) => void
  deleteLine: (index: number) => void
  insertLine: (index: number, entry: ScriptEntry) => void
  reorderLine: (from: number, to: number) => void
  updateCharacter: (index: number, character: string) => void
  selectCharacter: (name: string) => void
  refreshCharacters: () => void

  // Rehearsal actions
  setCurrentLineIndex: (index: number) => void
  advanceLine: () => void
  goBack: () => void
  pause: () => void
  resume: () => void
  restart: () => void
  setRunning: (val: boolean) => void
  toggleMode: () => void
  reset: () => void
}

export const useScriptStore = create<ScriptStore>((set, get) => ({
  parsedScript: [],
  characters: [],
  selectedCharacter: null,
  uploadedFile: null,
  currentLineIndex: -1,
  isPaused: false,
  isRunning: false,
  practiceMode: true,

  setParsedScript: (entries) => {
    const characters = extractCharacters(entries)
    set({ parsedScript: entries, characters, selectedCharacter: null })
  },

  setUploadedFile: (file) => set({ uploadedFile: file }),

  updateLine: (index, line) =>
    set(state => {
      const script = [...state.parsedScript]
      script[index] = { ...script[index], line }
      return { parsedScript: script }
    }),

  deleteLine: (index) =>
    set(state => {
      const script = state.parsedScript.filter((_, i) => i !== index)
      return { parsedScript: script, characters: extractCharacters(script) }
    }),

  insertLine: (index, entry) =>
    set(state => {
      const script = [...state.parsedScript]
      script.splice(index, 0, entry)
      return { parsedScript: script, characters: extractCharacters(script) }
    }),

  reorderLine: (from, to) =>
    set(state => {
      const script = [...state.parsedScript]
      const [moved] = script.splice(from, 1)
      script.splice(to, 0, moved)
      return { parsedScript: script }
    }),

  updateCharacter: (index, character) =>
    set(state => {
      const script = [...state.parsedScript]
      script[index] = {
        ...script[index],
        character,
        type: character === 'STAGE DIRECTION' ? 'direction' : 'dialogue',
      }
      return { parsedScript: script, characters: extractCharacters(script) }
    }),

  selectCharacter: (name) => set({ selectedCharacter: name }),

  refreshCharacters: () =>
    set(state => ({ characters: extractCharacters(state.parsedScript) })),

  setCurrentLineIndex: (index) => set({ currentLineIndex: index }),
  advanceLine: () => set(state => ({ currentLineIndex: state.currentLineIndex + 1 })),
  goBack: () => set(state => ({ currentLineIndex: Math.max(0, state.currentLineIndex - 1) })),
  pause: () => set({ isPaused: true }),
  resume: () => set({ isPaused: false }),
  restart: () => set({ currentLineIndex: 0, isPaused: false }),
  setRunning: (val) => set({ isRunning: val }),
  toggleMode: () => set(state => ({ practiceMode: !state.practiceMode })),
  reset: () =>
    set({
      parsedScript: [],
      characters: [],
      selectedCharacter: null,
      uploadedFile: null,
      currentLineIndex: -1,
      isPaused: false,
      isRunning: false,
      practiceMode: true,
    }),
}))
