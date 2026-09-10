const BOM = String.fromCharCode(0xfeff)
const NBSP = String.fromCharCode(0xa0)

/**
 * Normalização de entrada (prompt.md §6), nesta ordem exata e nada além
 * disso: remove BOM UTF-8 do início, converte quebras de linha CRLF/CR pra
 * LF, e troca nbsp por espaço comum (nbsp de exportações do Google Docs/Word
 * faz uma linha "parecer" vazia sem ser — quebraria detecção de título e
 * separação de estrofes se não fosse tratado).
 */
export function normalizar(texto: string): string {
  let resultado = texto.startsWith(BOM) ? texto.slice(BOM.length) : texto
  resultado = resultado.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  resultado = resultado.split(NBSP).join(' ')
  return resultado
}
