import { describe, expect, it } from 'vitest'
import { encontrarLinhaMaisLonga, tetoFontePorLargura } from '../src/lib/cifra/zoom'

describe('tetoFontePorLargura', () => {
  it('sem largura medida (texto vazio), não limita o zoom', () => {
    expect(tetoFontePorLargura(0, 100, 300)).toBe(Infinity)
  })

  it('calcula o maior tamanho que cabe, proporcional à largura medida', () => {
    // linha mede 200px a 100px de fonte; tela tem 300px disponíveis
    // → cabe até 150px de fonte (200 * 1.5 = 300)
    expect(tetoFontePorLargura(200, 100, 300)).toBe(150)
  })

  it('arredonda pra baixo (nunca estoura a largura disponível)', () => {
    expect(tetoFontePorLargura(333, 100, 1000)).toBe(300)
  })
})

describe('encontrarLinhaMaisLonga', () => {
  it('acha a linha mais longa entre várias', () => {
    const letra = 'curta\numa linha bem mais longa que as outras\nmédia aqui'
    expect(encontrarLinhaMaisLonga(letra)).toBe('uma linha bem mais longa que as outras')
  })

  it('letra vazia dá string vazia', () => {
    expect(encontrarLinhaMaisLonga('')).toBe('')
  })
})
