// Faixa Unicode das marcas diacriticas combinantes (usada apos NFD).
const COMBINING_DIACRITICS_START = 0x0300
const COMBINING_DIACRITICS_END = 0x036f

export function removerAcentos(texto: string): string {
  return Array.from(texto.normalize('NFD'))
    .filter((char) => {
      const codigo = char.codePointAt(0) ?? 0
      return codigo < COMBINING_DIACRITICS_START || codigo > COMBINING_DIACRITICS_END
    })
    .join('')
}

/**
 * Normaliza texto pra busca sem acento e case-insensitive (prompt.md secao
 * 8.1, 8.4): quem digita "evidencia" precisa achar "Evidencias".
 */
export function normalizarBusca(texto: string): string {
  return removerAcentos(texto).toLowerCase()
}

const REGEX_PARENTESES = /\([^)]*\)/g
const REGEX_NAO_ALFANUMERICO = /[^\p{L}\p{N}\s]/gu
const REGEX_ESPACOS_EXTRAS = /\s+/g

/**
 * Normaliza título pra vinculação tardia (prompt.md secao 8.4): minusculas,
 * sem acento, sem pontuacao, ignorando o que estiver entre parenteses. Mais
 * agressiva que normalizarBusca porque aqui a comparacao e de igualdade,
 * nao de substring.
 */
export function normalizarParaVinculo(texto: string): string {
  const semParenteses = texto.replace(REGEX_PARENTESES, ' ')
  const semAcentos = removerAcentos(semParenteses).toLowerCase()
  const semPontuacao = semAcentos.replace(REGEX_NAO_ALFANUMERICO, ' ')
  return semPontuacao.replace(REGEX_ESPACOS_EXTRAS, ' ').trim()
}
