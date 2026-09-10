// Faixa Unicode das marcas diacriticas combinantes (usada apos NFD).
const COMBINING_DIACRITICS_START = 0x0300
const COMBINING_DIACRITICS_END = 0x036f

/**
 * Normaliza texto pra busca sem acento e case-insensitive (prompt.md secao
 * 8.1, 8.4): quem digita "evidencia" precisa achar "Evidencias".
 */
export function normalizarBusca(texto: string): string {
  const semAcentos = Array.from(texto.normalize('NFD'))
    .filter((char) => {
      const codigo = char.codePointAt(0) ?? 0
      return codigo < COMBINING_DIACRITICS_START || codigo > COMBINING_DIACRITICS_END
    })
    .join('')

  return semAcentos.toLowerCase()
}
