import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { processarTexto } from '../src/lib/parser/processarTexto'
import { gerarTxtCanonico } from '../src/lib/parser/exportar'
import type { Musica } from '../src/types'

function lerFixture(nome: string): string {
  return readFileSync(join(__dirname, 'fixtures', nome), 'utf-8')
}

function paraMusicas(blocos: { titulo: string; letra: string }[]): Musica[] {
  return blocos.map((b) => ({
    id: crypto.randomUUID(),
    titulo: b.titulo,
    letra: b.letra,
    cifrada: false,
    criadoEm: 0,
    atualizadoEm: 0,
  }))
}

// O teste mais valioso do parser (prompt.md §6): importar, exportar,
// importar de novo — sem metadados no formato, a igualdade tem que ser
// exata.
describe('round-trip: importar → exportar → importar', () => {
  const fixturesRelevantes = [
    'uma-musica.txt',
    'tres-musicas.txt',
    'sem-end-no-ultimo.txt',
    'estrofes.txt',
    'com-cifra.txt',
    'baguncado.txt',
    'google-docs.txt',
  ]

  for (const nome of fixturesRelevantes) {
    it(`${nome} sobrevive a um ciclo completo de import/export/import`, () => {
      const primeiraLeitura = processarTexto(lerFixture(nome))
      const txtExportado = gerarTxtCanonico(paraMusicas(primeiraLeitura))
      const segundaLeitura = processarTexto(txtExportado)

      expect(segundaLeitura).toEqual(primeiraLeitura)
    })
  }

  it('um terceiro ciclo não muda mais nada (idempotência total)', () => {
    const primeira = processarTexto(lerFixture('estrofes.txt'))
    const exportado1 = gerarTxtCanonico(paraMusicas(primeira))
    const segunda = processarTexto(exportado1)
    const exportado2 = gerarTxtCanonico(paraMusicas(segunda))
    const terceira = processarTexto(exportado2)

    expect(exportado2).toBe(exportado1)
    expect(terceira).toEqual(segunda)
  })
})
