import { getDb } from './db'

// Preferências de exibição por música (prompt.md §9: fonte "ajustável pelo
// usuário e persistida por música"; §8.5: autoscroll "com velocidade
// salva por música"). Não são campos de Musica — o §5 fecha esse modelo —
// é um dado auxiliar de UI, guardado à parte.
export type PreferenciaMusica = {
  musicaId: string
  fontIndex: number
  velocidadeAutoscrollIndex: number
}

let preferencias = $state<PreferenciaMusica[]>([])
let loaded = false

async function load() {
  if (loaded) return
  const db = await getDb()
  preferencias = await db.getAll('preferenciasMusica')
  loaded = true
}

function obter(musicaId: string): PreferenciaMusica | undefined {
  return preferencias.find((p) => p.musicaId === musicaId)
}

async function salvar(pref: PreferenciaMusica) {
  const db = await getDb()
  await db.put('preferenciasMusica', pref)
  const existe = preferencias.some((p) => p.musicaId === pref.musicaId)
  preferencias = existe ? preferencias.map((p) => (p.musicaId === pref.musicaId ? pref : p)) : [...preferencias, pref]
}

export const preferenciasStore = {
  get list() {
    return preferencias
  },
  load,
  obter,
  salvar,
}
