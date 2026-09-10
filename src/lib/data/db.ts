import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { LotesImportacao, Musica, Setlist } from '../../types'
import type { PreferenciaMusica } from './preferenciasStore.svelte'

interface PrompterDB extends DBSchema {
  musicas: { key: string; value: Musica }
  setlists: { key: string; value: Setlist }
  lotesImportacao: { key: string; value: LotesImportacao }
  preferenciasMusica: { key: string; value: PreferenciaMusica }
}

let dbPromise: Promise<IDBPDatabase<PrompterDB>> | null = null

export function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<PrompterDB>('prompter', 3, {
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
        if (!db.objectStoreNames.contains('preferenciasMusica')) {
          db.createObjectStore('preferenciasMusica', { keyPath: 'musicaId' })
        }
      },
    })
  }
  return dbPromise
}
