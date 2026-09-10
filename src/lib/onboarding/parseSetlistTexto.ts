export type ItemRepertorioBruto = { texto: string; tipo: 'musica' | 'marcador' }

/**
 * Formato pessoal do usuário (não é o formato canônico de música — é uma
 * setlist já organizada em blocos): uma linha inteiramente em maiúsculas
 * marca o início de um bloco novo (ex.: "ABERTURAS", "FORRÓ"); qualquer
 * outra linha não-vazia é um item. Linhas em branco são só separadores
 * visuais, descartadas.
 */
export function ehLinhaDeMarcador(linha: string): boolean {
  return linha === linha.toUpperCase() && linha !== linha.toLowerCase()
}

export function parseSetlistTexto(texto: string): ItemRepertorioBruto[] {
  return texto
    .split('\n')
    .map((linha) => linha.trim())
    .filter((linha) => linha !== '')
    .map((linha) => ({
      texto: linha,
      tipo: ehLinhaDeMarcador(linha) ? ('marcador' as const) : ('musica' as const),
    }))
}
