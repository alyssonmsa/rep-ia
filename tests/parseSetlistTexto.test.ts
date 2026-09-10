import { describe, expect, it } from 'vitest'
import { ehLinhaDeMarcador, parseSetlistTexto } from '../src/lib/onboarding/parseSetlistTexto'

describe('ehLinhaDeMarcador', () => {
  it('linha inteira em maiúsculas é marcador', () => {
    expect(ehLinhaDeMarcador('ABERTURAS')).toBe(true)
    expect(ehLinhaDeMarcador('MODÃO SERTANEJO')).toBe(true)
  })

  it('linha com minúscula não é marcador', () => {
    expect(ehLinhaDeMarcador('Só Você (C)')).toBe(false)
  })

  it('linha sem nenhuma letra (só símbolos/números) não é marcador', () => {
    expect(ehLinhaDeMarcador('123')).toBe(false)
    expect(ehLinhaDeMarcador('---')).toBe(false)
  })
})

describe('parseSetlistTexto', () => {
  it('classifica marcadores e itens, descarta linhas vazias', () => {
    const texto = 'ABERTURAS\n\nDou a vida por um beijo (G)\nNova Iorque (G)\n\nFORRÓ\nCobertor'
    expect(parseSetlistTexto(texto)).toEqual([
      { texto: 'ABERTURAS', tipo: 'marcador' },
      { texto: 'Dou a vida por um beijo (G)', tipo: 'musica' },
      { texto: 'Nova Iorque (G)', tipo: 'musica' },
      { texto: 'FORRÓ', tipo: 'marcador' },
      { texto: 'Cobertor', tipo: 'musica' },
    ])
  })

  it('apara espaços nas pontas de cada linha', () => {
    expect(parseSetlistTexto('  Cadê Você (G)   \n')).toEqual([{ texto: 'Cadê Você (G)', tipo: 'musica' }])
  })
})
