export function cleanOcrText(text: string): string {
  return text
    .split('\n')
    .map(line => {
      return line
        .replace(/^B[eéh]?\s*A\s*B?\s*[:]\s*/i, 'B: ')
        .replace(/^B[eéh]+\s*[A-Z]?\s*[:]\s*/i, 'B: ')
        .replace(/^A[sz2]*\s*[A-Z]?\s*[:]\s*/i, 'A: ')
        .replace(/^([AB])\s+[A-Z]{1,3}\s*[:]\s*/i, (_, ch: string) => ch.toUpperCase() + ': ')
    })
    .filter(line => !/^\s*\d{1,3}\s*$/.test(line))
    .join('\n')
}
