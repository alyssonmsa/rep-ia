/** A linha mais longa da letra inteira — o teto de zoom é calculado sobre ela, não só das estrofes visíveis. */
export function encontrarLinhaMaisLonga(letra: string): string {
  return letra.split('\n').reduce((maior, linha) => (linha.length > maior.length ? linha : maior), '')
}

/**
 * Parte pura do cálculo (prompt.md §7): dada a largura medida de um texto
 * num tamanho de referência, e a largura disponível na tela, calcula o
 * maior tamanho de fonte em que o texto cabe sem quebrar. `Infinity` quando
 * não há texto pra medir (nada limita o zoom).
 */
export function tetoFontePorLargura(
  larguraMedidaNoTamanhoReferencia: number,
  tamanhoReferencia: number,
  larguraDisponivel: number,
): number {
  if (larguraMedidaNoTamanhoReferencia <= 0) return Infinity
  return Math.floor((larguraDisponivel / larguraMedidaNoTamanhoReferencia) * tamanhoReferencia)
}

const FONTE_CIFRA = '"IBM Plex Mono", monospace'

/** Wrapper fino sobre canvas.measureText — não testado diretamente, mesmo padrão do wakelock.ts. */
export function medirLarguraTexto(texto: string, tamanhoReferencia: number): number {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx || texto === '') return 0
  ctx.font = `${tamanhoReferencia}px ${FONTE_CIFRA}`
  return ctx.measureText(texto).width
}
