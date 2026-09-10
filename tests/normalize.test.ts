import { describe, expect, it } from 'vitest'
import { normalizarBusca } from '../src/lib/data/normalize'

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
