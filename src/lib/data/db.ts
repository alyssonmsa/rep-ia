import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { LotesImportacao, Musica, Setlist } from '../../types'

interface PrompterDB extends DBSchema {
  musicas: { key: string; value: Musica }
  setlists: { key: string; value: Setlist }
  lotesImportacao: { key: string; value: LotesImportacao }
}

let dbPromise: Promise<IDBPDatabase<PrompterDB>> | null = null

export function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<PrompterDB>('prompter', 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('musicas')) {
          db.createObjectStore('musicas', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('setlists')) {
          db.createObjectStore('setlists', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('lotesImportacao')) {
          db.createObjectStore('lotesImportacao', { keyPath: 'id' })
        }
      },
    })
  }
  return dbPromise
}
