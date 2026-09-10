import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ehArquivoLegado } from '../src/lib/parser/legado'

function lerFixture(nome: string): string {
  return readFileSync(join(__dirname, 'fixtures', nome), 'utf-8')
}

describe('ehArquivoLegado', () => {
  it('identifica um arquivo de 100+ linhas sem nenhum terminador', () => {
    expect(ehArquivoLegado(lerFixture('legado.txt'))).toBe(true)
  })

  it('não cai no fallback um arquivo grande que usa /FIM em vez de /END', () => {
    const linhas = Array.from({ length: 90 }, (_, i) => `linha ${i}`)
    linhas.push('/FIM')
    expect(ehArquivoLegado(linhas.join('\n'))).toBe(false)
  })

  it('não cai no fallback um texto curto sem terminador (é só uma letra colada)', () => {
    expect(ehArquivoLegado('linha 1\nlinha 2\nlinha 3')).toBe(false)
  })

  it('não cai no fallback um arquivo grande que já usa /END corretamente', () => {
    expect(ehArquivoLegado(lerFixture('tres-musicas.txt'))).toBe(false)
  })
})
