import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Musica, Setlist } from '../../types'

interface PrompterDB extends DBSchema {
  musicas: { key: string; value: Musica }
  setlists: { key: string; value: Setlist }
}

let dbPromise: Promise<IDBPDatabase<PrompterDB>> | null = null

export function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<PrompterDB>('prompter', 1, {
      upgrade(db) {
        db.createObjectStore('musicas', { keyPath: 'id' })
        db.createObjectStore('setlists', { keyPath: 'id' })
      },
    })
  }
  return dbPromise
}
