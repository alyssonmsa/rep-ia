import { musicasStore } from '../data/musicasStore.svelte'
import { setlistsStore } from '../data/setlistsStore.svelte'

// Letras originais, escritas só pra dar um primeiro contato com o app —
// mesmo cuidado de direito autoral do prompt.md §13 (nada de letra de
// terceiros no produto, nem como exemplo).
const MUSICAS_EXEMPLO = [
  {
    titulo: 'Estrada Sem Fim',
    letra: `Peguei a estrada assim que o sol nasceu
Deixei pra trás o que não me servia
Um violão nas costas, o resto é o vento
Contando os dias como se fossem versos

Passei por cidades que nem sei o nome
Toquei praça, toquei bar, toquei varanda
Quem para pra ouvir já é motivo
De eu seguir mais um pedaço dessa estrada

Não sei se chego, não sei se volto
Só sei que o canto não cabe parado
Estrada sem fim, céu sem fronteira
Eu e essa música, o resto é passageiro`,
  },
  {
    titulo: 'Valsa da Manhã',
    letra: `Quando o dia chega devagar

E o café ainda esquenta na panela

Eu penso em você

E em nada mais`,
  },
  {
    titulo: 'Silêncio da Noite',
    letra: `O silêncio da noite pesa diferente quando a plateia foi embora e sobra só o eco do último acorde ainda preso na madeira do violão, e eu fico ali mais um instante olhando as cadeiras vazias pensando em quantas pessoas passaram por essa noite sem eu nem saber o nome de nenhuma delas`,
  },
]

/** Cria o repertório de exemplo (prompt.md §10, Fatia 5) e retorna a setlist já populada. */
export async function semearRepertorioExemplo() {
  const musicas = []
  for (const { titulo, letra } of MUSICAS_EXEMPLO) {
    musicas.push(await musicasStore.create({ titulo, letra }))
  }

  const setlist = await setlistsStore.create('Show de exemplo')
  await setlistsStore.addItem(setlist.id, { texto: 'ABERTURA', musicaId: null, tipo: 'marcador' })
  for (const musica of musicas) {
    await setlistsStore.addItem(setlist.id, { texto: musica.titulo, musicaId: musica.id, tipo: 'musica' })
  }

  return setlist.id
}
