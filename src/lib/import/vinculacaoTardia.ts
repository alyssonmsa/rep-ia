import { normalizarParaVinculo } from '../data/normalize'
import type { ItemSetlist, Musica } from '../../types'

export type Vinculo = { itemId: string; musicaId: string }

/**
 * Casa itens de setlist sem vínculo com músicas do acervo por título
 * normalizado (prompt.md §8.4) — o caso comum de digitar a setlist correndo
 * antes do show e importar o acervo depois. Pura: só decide, quem chama
 * aplica e persiste.
 */
export function casarItensPendentes(itens: ItemSetlist[], musicas: Musica[]): Vinculo[] {
  const vinculos: Vinculo[] = []

  for (const item of itens) {
    if (item.tipo !== 'musica' || item.musicaId !== null) continue
    const alvo = normalizarParaVinculo(item.texto)
    const musica = musicas.find((m) => normalizarParaVinculo(m.titulo) === alvo)
    if (musica) vinculos.push({ itemId: item.id, musicaId: musica.id })
  }

  return vinculos
}
