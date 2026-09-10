import { describe, expect, it } from 'vitest'
import { duplicarItens, reordenarItens } from '../src/lib/data/setlistHelpers'
import type { ItemSetlist } from '../src/types'

function item(id: string, ordem: number): ItemSetlist {
  return { id, ordem, texto: `item ${id}`, musicaId: null, tipo: 'musica' }
}

describe('reordenarItens', () => {
  it('recomputa ordem sequencial a partir da nova ordem de ids', () => {
    const itens = [item('a', 0), item('b', 1), item('c', 2)]
    const resultado = reordenarItens(itens, ['c', 'a', 'b'])
    expect(resultado.map((i) => i.id)).toEqual(['c', 'a', 'b'])
    expect(resultado.map((i) => i.ordem)).toEqual([0, 1, 2])
  })

  it('ignora ids que não existem mais na lista original', () => {
    const itens = [item('a', 0), item('b', 1)]
    const resultado = reordenarItens(itens, ['b', 'fantasma', 'a'])
    expect(resultado.map((i) => i.id)).toEqual(['b', 'a'])
  })
})

describe('duplicarItens', () => {
  it('gera ids novos preservando texto, vínculo, tipo e ordem', () => {
    const itens = [item('a', 0), { ...item('b', 1), musicaId: 'musica-1' }]
    const copia = duplicarItens(itens)

    expect(copia).toHaveLength(2)
    expect(copia[0].id).not.toBe('a')
    expect(copia[1].id).not.toBe('b')
    expect(copia.map((i) => i.texto)).toEqual(itens.map((i) => i.texto))
    expect(copia[1].musicaId).toBe('musica-1')
  })
})
