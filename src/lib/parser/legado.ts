import { ehLinhaTerminadora } from './terminador'

const LIMITE_LINHAS = 80

/**
 * Arquivo legado (prompt.md §8.3): mais de 80 linhas e nenhuma linha
 * terminadora. Usa o mesmo detector do `splitBlocks` (aceita `/END` e
 * `/FIM`) pra não cair no fallback por engano um arquivo válido que só usa
 * `/FIM`.
 */
export function ehArquivoLegado(texto: string): boolean {
  const linhas = texto.split('\n')
  if (linhas.length <= LIMITE_LINHAS) return false
  return !linhas.some(ehLinhaTerminadora)
}
