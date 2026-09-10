import { getDb } from './db'
import { duplicarItens, reordenarItens } from './setlistHelpers'
import { casarItensPendentes, type Vinculo } from '../import/vinculacaoTardia'
import type { ItemSetlist, Musica, Setlist } from '../../types'

let setlists = $state<Setlist[]>([])
let loaded = false

async function load() {
  if (loaded) return
  const db = await getDb()
  setlists = await db.getAll('setlists')
  loaded = true
}

async function persist(setlist: Setlist) {
  const db = await getDb()
  await db.put('setlists', setlist)
  setlists = setlists.map((s) => (s.id === setlist.id ? setlist : s))
}

async function create(nome: string): Promise<Setlist> {
  const agora = Date.now()
  const setlist: Setlist = { id: crypto.randomUUID(), nome, itens: [], criadoEm: agora, atualizadoEm: agora }
  const db = await getDb()
  await db.put('setlists', setlist)
  setlists = [...setlists, setlist]
  return setlist
}

async function rename(id: string, nome: string) {
  const setlist = setlists.find((s) => s.id === id)
  if (!setlist) return
  await persist({ ...setlist, nome, atualizadoEm: Date.now() })
}

async function duplicate(id: string): Promise<Setlist | undefined> {
  const original = setlists.find((s) => s.id === id)
  if (!original) return
  const agora = Date.now()
  const copia: Setlist = {
    id: crypto.randomUUID(),
    nome: `${original.nome} (cópia)`,
    itens: duplicarItens(original.itens),
    criadoEm: agora,
    atualizadoEm: agora,
  }
  const db = await getDb()
  await db.put('setlists', copia)
  setlists = [...setlists, copia]
  return copia
}

async function addItem(setlistId: string, item: Omit<ItemSetlist, 'id' | 'ordem'>) {
  const setlist = setlists.find((s) => s.id === setlistId)
  if (!setlist) return
  const novoItem: ItemSetlist = { ...item, id: crypto.randomUUID(), ordem: setlist.itens.length }
  await persist({ ...setlist, itens: [...setlist.itens, novoItem], atualizadoEm: Date.now() })
}

async function removeItem(setlistId: string, itemId: string) {
  const setlist = setlists.find((s) => s.id === setlistId)
  if (!setlist) return
  const restantes = setlist.itens.filter((i) => i.id !== itemId)
  const itens = reordenarItens(restantes, restantes.map((i) => i.id))
  await persist({ ...setlist, itens, atualizadoEm: Date.now() })
}

async function reorderItems(setlistId: string, idsOrdenados: string[]) {
  const setlist = setlists.find((s) => s.id === setlistId)
  if (!setlist) return
  await persist({ ...setlist, itens: reordenarItens(setlist.itens, idsOrdenados), atualizadoEm: Date.now() })
}

/** Exclusão de música não cascateia (prompt.md §5): só zera o vínculo, o item continua com o texto. */
async function unlinkMusica(musicaId: string) {
  const afetadas = setlists.filter((s) => s.itens.some((i) => i.musicaId === musicaId))
  for (const setlist of afetadas) {
    const itens = setlist.itens.map((i) => (i.musicaId === musicaId ? { ...i, musicaId: null } : i))
    await persist({ ...setlist, itens, atualizadoEm: Date.now() })
  }
}

async function vincularItens(setlistId: string, vinculos: Vinculo[]) {
  if (vinculos.length === 0) return
  const setlist = setlists.find((s) => s.id === setlistId)
  if (!setlist) return
  const musicaIdPorItem = new Map(vinculos.map((v) => [v.itemId, v.musicaId]))
  const itens = setlist.itens.map((item) =>
    musicaIdPorItem.has(item.id) ? { ...item, musicaId: musicaIdPorItem.get(item.id)! } : item,
  )
  await persist({ ...setlist, itens, atualizadoEm: Date.now() })
}

/** Vinculação tardia (prompt.md §8.4): roda depois de qualquer importação, em todas as setlists. */
async function tentarVincularTodas(musicas: Musica[]): Promise<number> {
  let total = 0
  for (const setlist of setlists) {
    const vinculos = casarItensPendentes(setlist.itens, musicas)
    if (vinculos.length === 0) continue
    await vincularItens(setlist.id, vinculos)
    total += vinculos.length
  }
  return total
}

export const setlistsStore = {
  get list() {
    return setlists
  },
  load,
  create,
  rename,
  duplicate,
  addItem,
  removeItem,
  reorderItems,
  unlinkMusica,
  vincularItens,
  tentarVincularTodas,
}
