import { describe, expect, it } from 'vitest'
import { gerarJsonBackup, gerarTxtCanonico } from '../src/lib/parser/exportar'
import { processarTexto } from '../src/lib/parser/processarTexto'
import type { Musica } from '../src/types'

function musica(titulo: string, letra: string): Musica {
  return { id: crypto.randomUUID(), titulo, letra, cifrada: false, criadoEm: 0, atualizadoEm: 0 }
}

describe('gerarTxtCanonico', () => {
  it('texto vazio pra lista vazia', () => {
    expect(gerarTxtCanonico([])).toBe('')
  })

  it('cada música vira um bloco terminado em /END', () => {
    const txt = gerarTxtCanonico([musica('Só Você', 'linha 1\nlinha 2')])
    expect(txt).toContain('Só Você')
    expect(txt).toContain('/END')
    expect(txt.trim().endsWith('/END')).toBe(true)
  })

  it('reproduz o exemplo canônico do §6 ao reprocessar', () => {
    const musicas = [
      musica('SÓ VOCÊ', 'Demorei muito pra te encontrar\n\nAgora eu quero só você'),
      musica('Evidências', 'Quando eu digo que deixei de te amar'),
    ]
    const blocos = processarTexto(gerarTxtCanonico(musicas))
    expect(blocos).toEqual(musicas.map((m) => ({ titulo: m.titulo, letra: m.letra })))
  })
})

describe('gerarJsonBackup', () => {
  it('inclui musicas (com cifrada), setlists e lotes', () => {
    const musicas = [musica('Só Você', 'letra')]
    const backup = JSON.parse(gerarJsonBackup(musicas, [], []))
    expect(backup.musicas).toHaveLength(1)
    expect(backup.musicas[0].cifrada).toBe(false)
    expect(backup.setlists).toEqual([])
    expect(backup.lotesImportacao).toEqual([])
    expect(typeof backup.exportadoEm).toBe('number')
  })
})
