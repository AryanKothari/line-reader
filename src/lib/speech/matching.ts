function levenshteinClose(a: string, b: string): boolean {
  const maxDist = a.length <= 3 ? 0 : a.length <= 6 ? 1 : 2
  if (Math.abs(a.length - b.length) > maxDist) return false
  let dist = 0
  const len = Math.max(a.length, b.length)
  for (let i = 0; i < len; i++) {
    if (a[i] !== b[i]) dist++
    if (dist > maxDist) return false
  }
  return true
}

export function fuzzyMatch(spoken: string, expected: string): boolean {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim()
  const spokenWords = normalize(spoken).split(' ').filter(Boolean)
  const expectedWords = normalize(expected).split(' ').filter(Boolean)

  if (!expectedWords.length) return true
  if (!spokenWords.length) return false

  let matches = 0
  let searchFrom = 0
  for (const ew of expectedWords) {
    for (let j = searchFrom; j < spokenWords.length; j++) {
      if (spokenWords[j] === ew || levenshteinClose(spokenWords[j], ew)) {
        matches++
        searchFrom = j + 1
        break
      }
    }
  }

  const ratio = matches / expectedWords.length

  if (expectedWords.length <= 2) return ratio >= 1.0
  if (expectedWords.length <= 4) return ratio >= 0.75
  return ratio >= 0.6
}
