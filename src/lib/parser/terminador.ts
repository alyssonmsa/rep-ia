/**
 * Uma linha termina um bloco se, trimada e sem diferenciar caixa, for
 * exatamente `/END` ou `/FIM` (prompt.md §6, tabela de bordas — os dois são
 * aceitos na leitura, só `/END` é usado na exportação). `/END` no meio de
 * uma linha de letra não conta — só quando a linha inteira é o terminador.
 */
export function ehLinhaTerminadora(linha: string): boolean {
  const normalizada = linha.trim().toUpperCase()
  return normalizada === '/END' || normalizada === '/FIM'
}
