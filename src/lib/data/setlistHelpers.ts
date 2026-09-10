import type { ItemSetlist } from '../../types'

/** Recomputa `ordem` sequencialmente a partir de uma nova ordem de ids (drag-and-drop). */
export function reordenarItens(itens: ItemSetlist[], idsOrdenados: string[]): ItemSetlist[] {
  const porId = new Map(itens.map((item) => [item.id, item]))
  return idsOrdenados
    .map((id) => porId.get(id))
    .filter((item): item is ItemSetlist => item !== undefined)
    .map((item, index) => ({ ...item, ordem: index }))
}

/** Cópia profunda dos itens com ids novos, pra duplicar uma setlist inteira de um toque. */
export function duplicarItens(itens: ItemSetlist[]): ItemSetlist[] {
  return itens.map((item) => ({ ...item, id: crypto.randomUUID() }))
}
