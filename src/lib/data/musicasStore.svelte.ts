import { getDb } from './db'
import type { Musica } from '../../types'

let musicas = $state<Musica[]>([])
let loaded = false

async function load() {
  if (loaded) return
  const db = await getDb()
  musicas = await db.getAll('musicas')
  loaded = true
}

async function create(input: { titulo: string; letra: string }): Promise<Musica> {
  const agora = Date.now()
  const musica: Musica = {
    id: crypto.randomUUID(),
    titulo: input.titulo,
    letra: input.letra,
    cifrada: false,
    criadoEm: agora,
    atualizadoEm: agora,
  }
  const db = await getDb()
  await db.put('musicas', musica)
  musicas = [...musicas, musica]
  return musica
}

async function update(id: string, patch: { titulo: string; letra: string }) {
  const existente = musicas.find((m) => m.id === id)
  if (!existente) return
  const atualizada: Musica = { ...existente, ...patch, atualizadoEm: Date.now() }
  const db = await getDb()
  await db.put('musicas', atualizada)
  musicas = musicas.map((m) => (m.id === id ? atualizada : m))
}

async function remove(id: string) {
  const db = await getDb()
  await db.delete('musicas', id)
  musicas = musicas.filter((m) => m.id !== id)
}

export const musicasStore = {
  get list() {
    return musicas
  },
  load,
  create,
  update,
  remove,
}
