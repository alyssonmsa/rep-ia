import { describe, expect, it } from 'vitest'
import { normalizarBusca, normalizarParaVinculo } from '../src/lib/data/normalize'

describe('normalizarBusca', () => {
  it('remove acentos', () => {
    expect(normalizarBusca('Evidências')).toBe('evidencias')
  })

  it('ignora caixa', () => {
    expect(normalizarBusca('SÓ VOCÊ')).toBe('so voce')
  })

  it('permite achar por trecho no meio da palavra', () => {
    const titulo = normalizarBusca('Evidências')
    const busca = normalizarBusca('evidencia')
    expect(titulo.includes(busca)).toBe(true)
  })

  it('mantém caracteres não acentuados intactos', () => {
    expect(normalizarBusca('Bloco 1 - Românticas')).toBe('bloco 1 - romanticas')
  })
})

describe('normalizarParaVinculo', () => {
  it('ignora o que estiver entre parênteses', () => {
    expect(normalizarParaVinculo('Evidências (Ao Vivo)')).toBe('evidencias')
  })

  it('remove pontuação', () => {
    expect(normalizarParaVinculo('Só Você!')).toBe('so voce')
  })

  it('duas variações do mesmo título normalizam igual', () => {
    expect(normalizarParaVinculo('Só Você (versão acelerada)')).toBe(normalizarParaVinculo('só  você'))
  })

  it('colapsa espaços extras', () => {
    expect(normalizarParaVinculo('Bloco   1  -  Românticas')).toBe('bloco 1 romanticas')
  })
})
