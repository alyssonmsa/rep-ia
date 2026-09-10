import letrasRaw from './dados/letras-reais.txt?raw'
import repertorioRaw from './dados/repertorio-real.txt?raw'
import { musicasStore } from '../data/musicasStore.svelte'
import { setlistsStore } from '../data/setlistsStore.svelte'
import { processarTexto } from '../parser/processarTexto'
import { parseSetlistTexto } from './parseSetlistTexto'

/**
 * Semeia o acervo e a setlist reais do usuário (não é mais um exemplo
 * fictício — letras-reais.txt já está no formato canônico /END, e
 * repertorio-real.txt é a setlist dele mesmo, com blocos delimitados por
 * linhas em CAIXA ALTA). Chamado uma única vez, no primeiro boot com o
 * acervo vazio — ver App.svelte.
 */
export async function semearRepertorioReal() {
  const musicas = []
  for (const bloco of processarTexto(letrasRaw)) {
    musicas.push(await musicasStore.create({ titulo: bloco.titulo, letra: bloco.letra }))
  }

  const setlist = await setlistsStore.create('Repertório')
  for (const item of parseSetlistTexto(repertorioRaw)) {
    await setlistsStore.addItem(setlist.id, { texto: item.texto, musicaId: null, tipo: item.tipo })
  }

  // Vincula de cara o que der por título normalizado (prompt.md §8.4) — o
  // resto fica sem vínculo, como é o normal quando a setlist foi digitada
  // com anotação de cifra que o título da música não tem.
  await setlistsStore.tentarVincularTodas(musicas)

  return setlist.id
}
