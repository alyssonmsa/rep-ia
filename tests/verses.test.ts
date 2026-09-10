import { describe, expect, it } from 'vitest'
import { splitIntoVerses } from '../src/lib/stage/verses'

describe('splitIntoVerses', () => {
  it('splits on blank lines into separate verses', () => {
    const letra = 'linha um\nlinha dois\n\nlinha tres'
    expect(splitIntoVerses(letra)).toEqual(['linha um\nlinha dois', 'linha tres'])
  })

  it('treats lyrics with no blank line as a single verse', () => {
    const letra = 'linha um\nlinha dois\nlinha tres'
    expect(splitIntoVerses(letra)).toEqual(['linha um\nlinha dois\nlinha tres'])
  })

  it('collapses multiple consecutive blank lines into one boundary', () => {
    const letra = 'estrofe um\n\n\n\nestrofe dois'
    expect(splitIntoVerses(letra)).toEqual(['estrofe um', 'estrofe dois'])
  })

  it('discards leading and trailing blank lines without creating empty verses', () => {
    const letra = '\n\nestrofe um\n\nestrofe dois\n\n\n'
    expect(splitIntoVerses(letra)).toEqual(['estrofe um', 'estrofe dois'])
  })

  it('returns an empty array for empty lyrics', () => {
    expect(splitIntoVerses('')).toEqual([])
    expect(splitIntoVerses('\n\n  \n')).toEqual([])
  })

  it('preserves leading whitespace inside a verse line', () => {
    const letra = '      G              Em\nQuando eu digo que deixei de te amar'
    expect(splitIntoVerses(letra)).toEqual([
      '      G              Em\nQuando eu digo que deixei de te amar',
    ])
  })
})
