import { normalizarBusca } from '../data/normalize'
import type { BlocoParseado } from '../parser/parseBlock'
import type { Musica } from '../../types'

export type PoliticaDuplicata = 'pular' | 'substituir' | 'importar-mesmo-assim'

export type PlanoImportacao = {
  criar: BlocoParseado[]
  substituir: { musicaId: string; bloco: BlocoParseado }[]
  pulados: BlocoParseado[]
}

/**
 * Classifica cada bloco contra o acervo existente por título normalizado
 * (prompt.md §8.3). Uma única política vale pro lote inteiro — "regra
 * previsível" (§3) em vez de decisão por item em 60 músicas de uma vez.
 */
export function planejarImportacao(
  blocos: BlocoParseado[],
  musicasExistentes: Musica[],
  politica: PoliticaDuplicata,
): PlanoImportacao {
  const plano: PlanoImportacao = { criar: [], substituir: [], pulados: [] }

  for (const bloco of blocos) {
    const existente = musicasExistentes.find(
      (musica) => normalizarBusca(musica.titulo) === normalizarBusca(bloco.titulo),
    )

    if (!existente) {
      plano.criar.push(bloco)
    } else if (politica === 'pular') {
      plano.pulados.push(bloco)
    } else if (politica === 'substituir') {
      plano.substituir.push({ musicaId: existente.id, bloco })
    } else {
      plano.criar.push(bloco)
    }
  }

  return plano
}
