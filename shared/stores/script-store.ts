import { create } from 'zustand'
import type { ScriptEntry, Character } from '../types'
import { extractCharacters } from '../lib/parser/script-parser'

interface ScriptStore {
  projectId: string | null
  projectTitle: string | null
  parsedScript: ScriptEntry[]
  characters: Character[]
  selectedCharacter: string | null
  sceneNotes: string

  currentLineIndex: number
  isPaused: boolean
  isRunning: boolean
  practiceMode: boolean

  userTurnPhase: 'typing' | 'revealed' | null
  attemptsLeft: number
  lastAttempt: string

  linesNailedFirstTry: number
  linesRevealed: number
  linesSkipped: number
  totalUserLines: number

  setProject: (id: string | null, title: string | null) => void
  setParsedScript: (entries: ScriptEntry[]) => void
  updateLine: (index: number, line: string) => void
  deleteLine: (index: number) => void
  insertLine: (index: number, entry: ScriptEntry) => void
  reorderLine: (from: number, to: number) => void
  updateCharacter: (index: number, character: string) => void
  selectCharacter: (name: string) => void
  refreshCharacters: () => void
  setSceneNotes: (notes: string) => void

  startUserTurn: () => void
  submitAttempt: (text: string) => boolean
  revealLine: () => void
  clearUserTurn: () => void
  recordLineResult: (result: 'first-try' | 'revealed' | 'skipped' | 'completed') => void
  resetPerformance: () => void

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
  projectId: null,
  projectTitle: null,
  parsedScript: [],
  characters: [],
  selectedCharacter: null,
  sceneNotes: '',
  currentLineIndex: -1,
  isPaused: false,
  isRunning: false,
  practiceMode: true,
  userTurnPhase: null,
  attemptsLeft: 3,
  lastAttempt: '',
  linesNailedFirstTry: 0,
  linesRevealed: 0,
  linesSkipped: 0,
  totalUserLines: 0,

  setProject: (id, title) => set({ projectId: id, projectTitle: title }),

  setParsedScript: (entries) => {
    const characters = extractCharacters(entries)
    set({ parsedScript: entries, characters, selectedCharacter: null })
  },

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

  setSceneNotes: (notes) => set({ sceneNotes: notes }),

  refreshCharacters: () =>
    set(state => ({ characters: extractCharacters(state.parsedScript) })),

  startUserTurn: () => set({ userTurnPhase: 'typing', attemptsLeft: 3, lastAttempt: '' }),

  submitAttempt: (text: string) => {
    if (text.toLowerCase().trim() === 'line') {
      set({ userTurnPhase: 'revealed', attemptsLeft: 0, lastAttempt: '' })
      return false
    }

    const { currentLineIndex, parsedScript, attemptsLeft } = get()
    const expected = parsedScript[currentLineIndex]?.line || ''
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim()
    const isCorrect = normalize(text) === normalize(expected)

    if (isCorrect) {
      set({ userTurnPhase: null, lastAttempt: '' })
      return true
    }

    const newAttempts = attemptsLeft - 1
    if (newAttempts <= 0) {
      set({ userTurnPhase: 'revealed', attemptsLeft: 0, lastAttempt: text })
    } else {
      set({ attemptsLeft: newAttempts, lastAttempt: text })
    }
    return false
  },

  revealLine: () => set({ userTurnPhase: 'revealed', attemptsLeft: 0 }),

  clearUserTurn: () => set({ userTurnPhase: null, attemptsLeft: 3, lastAttempt: '' }),

  recordLineResult: (result) => set(state => {
    switch (result) {
      case 'first-try':
        return { linesNailedFirstTry: state.linesNailedFirstTry + 1, totalUserLines: state.totalUserLines + 1 }
      case 'revealed':
        return { linesRevealed: state.linesRevealed + 1, totalUserLines: state.totalUserLines + 1 }
      case 'skipped':
        return { linesSkipped: state.linesSkipped + 1, totalUserLines: state.totalUserLines + 1 }
      case 'completed':
        return { totalUserLines: state.totalUserLines + 1 }
    }
  }),

  resetPerformance: () => set({ linesNailedFirstTry: 0, linesRevealed: 0, linesSkipped: 0, totalUserLines: 0 }),

  setCurrentLineIndex: (index) => set({ currentLineIndex: index, userTurnPhase: null, attemptsLeft: 3, lastAttempt: '' }),
  advanceLine: () => set(state => ({ currentLineIndex: state.currentLineIndex + 1 })),
  goBack: () => set(state => ({ currentLineIndex: Math.max(0, state.currentLineIndex - 1) })),
  pause: () => set({ isPaused: true }),
  resume: () => set({ isPaused: false }),
  restart: () => set({ currentLineIndex: 0, isPaused: false }),
  setRunning: (val) => set({ isRunning: val }),
  toggleMode: () => set(state => ({ practiceMode: !state.practiceMode })),
  reset: () =>
    set({
      projectId: null,
      projectTitle: null,
      parsedScript: [],
      characters: [],
      selectedCharacter: null,
      sceneNotes: '',
      currentLineIndex: -1,
      isPaused: false,
      isRunning: false,
      practiceMode: true,
      userTurnPhase: null,
      attemptsLeft: 3,
      lastAttempt: '',
      linesNailedFirstTry: 0,
      linesRevealed: 0,
      linesSkipped: 0,
      totalUserLines: 0,
    }),
}))
