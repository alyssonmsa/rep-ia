import { describe, expect, it } from 'vitest'
import { casarItensPendentes } from '../src/lib/import/vinculacaoTardia'
import type { ItemSetlist, Musica } from '../src/types'

function musica(id: string, titulo: string): Musica {
  return { id, titulo, letra: 'letra', cifrada: false, criadoEm: 0, atualizadoEm: 0 }
}

function item(id: string, texto: string, opts: Partial<ItemSetlist> = {}): ItemSetlist {
  return { id, ordem: 0, texto, musicaId: null, tipo: 'musica', ...opts }
}

describe('casarItensPendentes', () => {
  const musicas = [musica('m1', 'Evidências'), musica('m2', 'Só Você')]

  it('casa item sem vínculo com música de título igual (normalizado)', () => {
    const itens = [item('i1', 'evidencias')]
    expect(casarItensPendentes(itens, musicas)).toEqual([{ itemId: 'i1', musicaId: 'm1' }])
  })

  it('ignora o que está entre parênteses na comparação', () => {
    const itens = [item('i1', 'Só Você (abre o show)')]
    expect(casarItensPendentes(itens, musicas)).toEqual([{ itemId: 'i1', musicaId: 'm2' }])
  })

  it('não mexe em item que já tem vínculo', () => {
    const itens = [item('i1', 'Evidências', { musicaId: 'm1' })]
    expect(casarItensPendentes(itens, musicas)).toEqual([])
  })

  it('não mexe em marcador', () => {
    const itens = [item('i1', 'BLOCO 1', { tipo: 'marcador' })]
    expect(casarItensPendentes(itens, musicas)).toEqual([])
  })

  it('sem título correspondente, não casa nada', () => {
    const itens = [item('i1', 'Uma música que não existe')]
    expect(casarItensPendentes(itens, musicas)).toEqual([])
  })
})
