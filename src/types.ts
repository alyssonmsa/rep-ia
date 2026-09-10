export type Musica = {
  id: string
  titulo: string
  letra: string
  cifrada: boolean
  criadoEm: number
  atualizadoEm: number
}

export type ItemSetlist = {
  id: string
  ordem: number
  texto: string
  musicaId: string | null
  tipo: 'musica' | 'marcador'
}

export type Setlist = {
  id: string
  nome: string
  itens: ItemSetlist[]
  criadoEm: number
  atualizadoEm: number
}

export type LotesImportacao = {
  id: string
  musicaIds: string[]
  importadoEm: number
}
