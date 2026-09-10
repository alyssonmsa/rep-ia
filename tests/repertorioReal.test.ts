import { describe, expect, it } from 'vitest'
import letrasRaw from '../src/lib/onboarding/dados/letras-reais.txt?raw'
import repertorioRaw from '../src/lib/onboarding/dados/repertorio-real.txt?raw'
import { processarTexto } from '../src/lib/parser/processarTexto'
import { parseSetlistTexto } from '../src/lib/onboarding/parseSetlistTexto'

// Sanity check dos dados reais semeados no primeiro acesso (não é sobre o
// conteúdo em si, é sobre a integridade do parse — pega regressão se os
// arquivos em dados/ forem editados de um jeito que quebre o formato).
describe('dados do repertório real', () => {
  it('letras-reais.txt inteiro vira blocos válidos, todos com título', () => {
    const blocos = processarTexto(letrasRaw)
    expect(blocos.length).toBeGreaterThan(0)
    expect(blocos.every((b) => b.titulo.trim() !== '')).toBe(true)
  })

  it('repertorio-real.txt tem marcadores e itens de música', () => {
    const itens = parseSetlistTexto(repertorioRaw)
    expect(itens.some((i) => i.tipo === 'marcador')).toBe(true)
    expect(itens.some((i) => i.tipo === 'musica')).toBe(true)
  })
})
