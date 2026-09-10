import { getDb } from './db'
import type { LotesImportacao } from '../../types'

let lotes = $state<LotesImportacao[]>([])
let loaded = false

async function load() {
  if (loaded) return
  const db = await getDb()
  lotes = await db.getAll('lotesImportacao')
  loaded = true
}

async function create(musicaIds: string[]): Promise<LotesImportacao> {
  const lote: LotesImportacao = { id: crypto.randomUUID(), musicaIds, importadoEm: Date.now() }
  const db = await getDb()
  await db.put('lotesImportacao', lote)
  lotes = [...lotes, lote]
  return lote
}

async function remove(id: string) {
  const db = await getDb()
  await db.delete('lotesImportacao', id)
  lotes = lotes.filter((l) => l.id !== id)
}

export const lotesStore = {
  get list() {
    return lotes
  },
  load,
  create,
  remove,
}
