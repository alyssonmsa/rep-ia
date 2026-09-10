import { ehArquivoLegado } from '../parser/legado'
import { processarTexto } from '../parser/processarTexto'
import type { BlocoParseado } from '../parser/parseBlock'

export type ResultadoImportacao =
  | { tipo: 'vazio' }
  | { tipo: 'bloco-unico'; bloco: BlocoParseado }
  | { tipo: 'revisao'; blocos: BlocoParseado[] }
  | { tipo: 'legado'; textoOriginal: string }

/**
 * Decide o que fazer com um texto colado ou importado (prompt.md §8.2,
 * §8.3). `forcarRevisao: true` pra importação de arquivo (revisão sempre
 * aparece); `false` pra colar (só 2+ blocos vão pra revisão).
 */
export function iniciarImportacao(
  textoBruto: string,
  opts: { forcarRevisao: boolean },
): ResultadoImportacao {
  if (ehArquivoLegado(textoBruto)) {
    return { tipo: 'legado', textoOriginal: textoBruto }
  }

  const blocos = processarTexto(textoBruto)

  if (blocos.length === 0) return { tipo: 'vazio' }
  if (!opts.forcarRevisao && blocos.length === 1) return { tipo: 'bloco-unico', bloco: blocos[0] }
  return { tipo: 'revisao', blocos }
}
