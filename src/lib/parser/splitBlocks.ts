import { ehLinhaTerminadora } from './terminador'

function temConteudo(linhas: string[]): boolean {
  return linhas.some((linha) => linha.trim() !== '')
}

/**
 * Divide texto já normalizado em blocos (prompt.md §6). Um bloco só é
 * emitido — no terminador ou no fim do texto — se tiver pelo menos uma
 * linha não-vazia. Essa única regra cobre "dois /END seguidos" (bloco
 * vazio, ignorado) e "texto totalmente vazio" (zero blocos) sem caso
 * especial. Único lugar do sistema que sabe que `/END`/`/FIM` existem,
 * junto com `terminador.ts`.
 */
export function splitBlocks(texto: string): string[] {
  const linhas = texto.split('\n')
  const blocos: string[] = []
  let atual: string[] = []

  for (const linha of linhas) {
    if (ehLinhaTerminadora(linha)) {
      if (temConteudo(atual)) blocos.push(atual.join('\n'))
      atual = []
    } else {
      atual.push(linha)
    }
  }
  if (temConteudo(atual)) blocos.push(atual.join('\n'))

  return blocos
}
