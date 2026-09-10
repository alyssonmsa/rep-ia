// Padrão de acorde do prompt.md §7.
const PADRAO_ACORDE = /^[A-G][#b]?(m|maj|min|dim|aug|sus|add|º|°)?\d*(\/[A-G][#b]?)?$/
const PADRAO_NOTA_CRUA = /^[A-G]$/

function ehLinhaCandidata(linha: string): boolean {
  if (linha.trim() === '') return false

  const tokens = linha.trim().split(/\s+/)
  if (!tokens.every((token) => PADRAO_ACORDE.test(token))) return false

  const temMultiplosTokens = tokens.length >= 2
  const temTokenComSufixo = tokens.some((token) => !PADRAO_NOTA_CRUA.test(token))
  if (!temMultiplosTokens && !temTokenComSufixo) return false

  return / {2,}/.test(linha)
}

/**
 * Deriva o flag `cifrada` na importação (prompt.md §7) — nunca perguntado
 * ao usuário. Uma linha é candidata se: não-vazia, todos os tokens batem
 * no padrão de acorde, tem 2+ tokens OU algum token tem sufixo (m, 7, /G),
 * e contém pelo menos uma sequência de 2+ espaços seguidos (alinhamento
 * acorde/sílaba). 2+ linhas candidatas → cifrada. Em caso de dúvida,
 * prefere `false` — letra tratada como cifra desalinha, cifra tratada como
 * letra fica só com fonte errada.
 */
export function detectarCifra(letra: string): boolean {
  const candidatas = letra.split('\n').filter(ehLinhaCandidata)
  return candidatas.length >= 2
}
