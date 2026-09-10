import type { Musica } from '../../types'

// Letras originais, escritas só pra exercitar o modo palco (navegação por
// estrofe, preenchimento de tela) sem depender de conteúdo de terceiros —
// ver risco de direito autoral no prompt.md §13.

const agora = Date.now()

export const musicasFixture: Musica[] = [
  {
    id: 'fixture-1',
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
    cifrada: false,
    criadoEm: agora,
    atualizadoEm: agora,
  },
  {
    id: 'fixture-2',
    titulo: 'Silêncio da Noite',
    letra: `O silêncio da noite pesa diferente quando a plateia foi embora e sobra só o eco do último acorde ainda preso na madeira do violão, e eu fico ali mais um instante olhando as cadeiras vazias pensando em quantas pessoas passaram por essa noite sem eu nem saber o nome de nenhuma delas, e talvez seja isso mesmo, talvez a música sirva pra isso, pra encher um espaço por duas horas e depois deixar todo mundo em paz com o que sentiu, sem precisar explicar nada a ninguém, nem a mim mesmo`,
    cifrada: false,
    criadoEm: agora,
    atualizadoEm: agora,
  },
  {
    id: 'fixture-3',
    titulo: 'Valsa da Manhã',
    letra: `Quando o dia chega devagar

E o café ainda esquenta na panela

Eu penso em você

E em nada mais`,
    cifrada: false,
    criadoEm: agora,
    atualizadoEm: agora,
  },
]
