import { describe, expect, it } from 'vitest'
import { planejarImportacao } from '../src/lib/import/duplicatas'
import type { Musica } from '../src/types'

function musica(id: string, titulo: string): Musica {
  return { id, titulo, letra: 'letra antiga', cifrada: false, criadoEm: 0, atualizadoEm: 0 }
}

const existentes: Musica[] = [musica('m1', 'Evidências'), musica('m2', 'Só Você')]

describe('planejarImportacao', () => {
  it('não-duplicatas sempre vão pra criar, independente da política', () => {
    const blocos = [{ titulo: 'Estrada Sem Fim', letra: 'nova letra' }]
    for (const politica of ['pular', 'substituir', 'importar-mesmo-assim'] as const) {
      const plano = planejarImportacao(blocos, existentes, politica)
      expect(plano.criar).toEqual(blocos)
      expect(plano.substituir).toEqual([])
      expect(plano.pulados).toEqual([])
    }
  })

  it('detecta duplicata por título normalizado (sem acento, case-insensitive)', () => {
    const blocos = [{ titulo: 'evidencias', letra: 'nova letra' }]
    const plano = planejarImportacao(blocos, existentes, 'pular')
    expect(plano.pulados).toEqual(blocos)
    expect(plano.criar).toEqual([])
  })

  it('política pular: duplicata some do que será criado', () => {
    const blocos = [{ titulo: 'Só Você', letra: 'nova letra' }]
    const plano = planejarImportacao(blocos, existentes, 'pular')
    expect(plano.criar).toEqual([])
    expect(plano.pulados).toEqual(blocos)
  })

  it('política substituir: aponta pro id da música existente', () => {
    const blocos = [{ titulo: 'Só Você', letra: 'nova letra' }]
    const plano = planejarImportacao(blocos, existentes, 'substituir')
    expect(plano.substituir).toEqual([{ musicaId: 'm2', bloco: blocos[0] }])
    expect(plano.criar).toEqual([])
  })

  it('política importar-mesmo-assim: duplicata vira uma entrada nova', () => {
    const blocos = [{ titulo: 'Só Você', letra: 'nova letra' }]
    const plano = planejarImportacao(blocos, existentes, 'importar-mesmo-assim')
    expect(plano.criar).toEqual(blocos)
    expect(plano.substituir).toEqual([])
    expect(plano.pulados).toEqual([])
  })
})
