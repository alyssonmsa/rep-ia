/**
 * Splits lyrics into verses. A blank line is the boundary between verses
 * (prompt.md §8.5) — it is never content inside a verse, since a run of
 * non-blank lines is exactly what a verse is.
 */
export function splitIntoVerses(letra: string): string[] {
  const verses: string[] = []
  let current: string[] = []

  for (const line of letra.split('\n')) {
    if (line.trim() === '') {
      if (current.length > 0) {
        verses.push(current.join('\n'))
        current = []
      }
    } else {
      current.push(line)
    }
  }
  if (current.length > 0) verses.push(current.join('\n'))

  return verses
}
