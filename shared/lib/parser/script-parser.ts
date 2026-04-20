import type { ScriptEntry, Character, ParseResult } from '../../types'

const charColonPattern = /^([A-Z][A-Z\s.'-]{0,30})\s*[:]\s*(.*)/
const charAlonePattern = /^([A-Z][A-Z\s.'-]{1,30})\s*$/
const mixedCaseCharPattern = /^([A-Za-z][A-Za-z\s.'-]{0,30})\s*[:]\s*(.*)/

const directionPatterns = [
  /^\s*\(([^)]+)\)\s*$/,
  /^\s*\[([^\]]+)\]\s*$/,
  /^\s*<([^>]+)>\s*$/,
]

function splitInlineDirections(text: string): { text: string; type: 'dialogue' | 'direction' }[] {
  const parts: { text: string; type: 'dialogue' | 'direction' }[] = []
  let lastIndex = 0
  const regex = /\(([^)]+)\)/g
  let match

  while ((match = regex.exec(text)) !== null) {
    const before = text.slice(lastIndex, match.index).trim()
    if (before) parts.push({ text: before, type: 'dialogue' })
    parts.push({ text: match[1].trim(), type: 'direction' })
    lastIndex = regex.lastIndex
  }
  const after = text.slice(lastIndex).trim()
  if (after) parts.push({ text: after, type: 'dialogue' })

  return parts.length ? parts : [{ text, type: 'dialogue' }]
}

function normalizeName(name: string): string {
  const trimmed = name.trim().replace(/\s+/g, ' ')
  if (trimmed.length === 1) return trimmed.toUpperCase()
  return trimmed
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

export function parseScript(rawText: string): ScriptEntry[] {
  const lines = rawText.split('\n')
  const script: ScriptEntry[] = []
  let currentCharacter: string | null = null
  let currentDialogue: string[] = []

  function flushDialogue() {
    if (currentCharacter && currentDialogue.length > 0) {
      const text = currentDialogue.join(' ').trim()
      if (text) {
        const parts = splitInlineDirections(text)
        for (const part of parts) {
          script.push({
            character: currentCharacter,
            line: part.text,
            type: part.type,
          })
        }
      }
    }
    currentDialogue = []
  }

  for (const rawLine of lines) {
    const trimmed = rawLine.trim()
    if (!trimmed) continue

    let isDirection = false
    for (const pattern of directionPatterns) {
      const m = trimmed.match(pattern)
      if (m) {
        flushDialogue()
        script.push({ character: 'STAGE DIRECTION', line: m[1].trim(), type: 'direction' })
        currentCharacter = null
        isDirection = true
        break
      }
    }
    if (isDirection) continue

    let charMatch = trimmed.match(charColonPattern)
    if (!charMatch) charMatch = trimmed.match(mixedCaseCharPattern)

    if (charMatch) {
      flushDialogue()
      currentCharacter = normalizeName(charMatch[1])
      const remaining = charMatch[2].trim()
      if (remaining) currentDialogue.push(remaining)
      continue
    }

    const aloneMatch = trimmed.match(charAlonePattern)
    if (aloneMatch && trimmed.length < 25) {
      flushDialogue()
      currentCharacter = normalizeName(aloneMatch[1])
      continue
    }

    if (currentCharacter) {
      currentDialogue.push(trimmed)
    }
  }

  flushDialogue()
  return script
}

export function extractCharacters(script: ScriptEntry[]): Character[] {
  const chars = new Map<string, number>()
  for (const entry of script) {
    if (entry.type === 'direction' && entry.character === 'STAGE DIRECTION') continue
    const name = entry.character
    if (!chars.has(name)) chars.set(name, 0)
    if (entry.type === 'dialogue') {
      chars.set(name, chars.get(name)! + 1)
    }
  }
  return Array.from(chars.entries())
    .map(([name, lineCount]) => ({ name, lineCount }))
    .sort((a, b) => b.lineCount - a.lineCount)
}

export function parseFromText(text: string): ParseResult {
  const script = parseScript(text)
  const characters = extractCharacters(script)
  return { script, characters }
}
