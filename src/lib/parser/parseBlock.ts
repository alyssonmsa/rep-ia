export type BlocoParseado = { titulo: string; letra: string }

/**
 * A primeira linha não-vazia é o título; linhas vazias entre título e corpo
 * são descartadas; linhas vazias no fim do corpo são descartadas; linhas
 * vazias no MEIO do corpo são preservadas exatamente — são o que delimita
 * estrofe no modo palco (prompt.md §6, §8.5).
 */
export function parseBlock(bloco: string): BlocoParseado {
  const linhas = bloco.split('\n')

  let inicioTitulo = 0
  while (inicioTitulo < linhas.length && linhas[inicioTitulo].trim() === '') inicioTitulo++
  const titulo = inicioTitulo < linhas.length ? linhas[inicioTitulo].trim() : ''

  let inicioCorpo = inicioTitulo + 1
  while (inicioCorpo < linhas.length && linhas[inicioCorpo].trim() === '') inicioCorpo++

  let fimCorpo = linhas.length
  while (fimCorpo > inicioCorpo && linhas[fimCorpo - 1].trim() === '') fimCorpo--

  const letra = linhas.slice(inicioCorpo, fimCorpo).join('\n')

  return { titulo, letra }
}
