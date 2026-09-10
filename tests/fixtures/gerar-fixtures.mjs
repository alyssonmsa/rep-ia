// Gera os fixtures de teste do parser (prompt.md §11) com bytes exatos —
// BOM, CRLF e nbsp são difíceis de digitar de forma confiável num editor,
// então são montados aqui via código em vez de escritos à mão nos .txt.
// Rode com: node tests/fixtures/gerar-fixtures.mjs
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const DIR = dirname(fileURLToPath(import.meta.url))

const BOM = String.fromCharCode(0xfeff)
const NBSP = String.fromCharCode(0xa0)

function escrever(nome, conteudo) {
  writeFileSync(join(DIR, nome), conteudo, 'utf-8')
}

// 1. uma-musica.txt — bloco único sem /END.
escrever(
  'uma-musica.txt',
  [
    'SÓ VOCÊ',
    '',
    'Demorei muito pra te encontrar',
    'Agora eu quero só você',
    'Teu jeito todo especial de ser',
    'Eu fico louco com você',
  ].join('\n'),
)

// 2. tres-musicas.txt — formato canônico, 3 blocos.
escrever(
  'tres-musicas.txt',
  [
    'SÓ VOCÊ',
    '',
    'Demorei muito pra te encontrar',
    'Agora eu quero só você',
    '/END',
    '',
    'Evidências',
    'Quando eu digo que deixei de te amar',
    'É porque eu te amo',
    '/END',
    '',
    'Valsa da Manhã',
    '',
    'Quando o dia chega devagar',
    'E o café ainda esquenta na panela',
    '/END',
  ].join('\n'),
)

// 3. sem-end-no-ultimo.txt — primeiro bloco com /END, último fechado só pelo fim do arquivo.
escrever(
  'sem-end-no-ultimo.txt',
  [
    'PRIMEIRA MÚSICA',
    '',
    'Linha única da primeira música',
    '/END',
    '',
    'ÚLTIMA MÚSICA',
    '',
    'Essa aqui não tem terminador',
    'Fecha só porque o arquivo acabou',
  ].join('\n'),
)

// 4. estrofes.txt — várias estrofes, incluindo múltiplas linhas em branco
// seguidas entre duas delas (tem que virar só um limite de estrofe).
escrever(
  'estrofes.txt',
  [
    'ESTRADA SEM FIM',
    '',
    'Peguei a estrada assim que o sol nasceu',
    'Deixei pra trás o que não me servia',
    '',
    'Passei por cidades que nem sei o nome',
    'Toquei praça, toquei bar, toquei varanda',
    '',
    '',
    '',
    'Não sei se chego, não sei se volto',
    'Só sei que o canto não cabe parado',
    '/END',
  ].join('\n'),
)

// 5. com-cifra.txt — alinhamento e espaços à esquerda têm que sobreviver ao
// parser intactos (detecção de cifra em si é Fatia 4, aqui é só preservação).
escrever(
  'com-cifra.txt',
  [
    'EVIDÊNCIAS',
    '',
    '      G              Em',
    'Quando eu digo que deixei de te amar',
    '   C                    D',
    'É porque eu te amo',
    '/END',
  ].join('\n'),
)

// 6. baguncado.txt — BOM, CRLF, nbsp escondido numa linha "vazia", /end
// minúsculo, /FIM, dois terminadores seguidos (bloco vazio) e espaços
// sobrando nas pontas das linhas terminadoras.
{
  const linhas = [
    'primeira música',
    '',
    'letra da primeira',
    '/end',
    '',
    'segunda música',
    NBSP, // linha "vazia" de verdade só com nbsp — não pode contar como conteúdo
    'letra da segunda',
    '/FIM',
    '',
    '  /END  ',
    '',
    'terceira música',
    '',
    'letra da terceira',
    '/END',
  ]
  const comCrlf = linhas.join('\r\n')
  escrever('baguncado.txt', BOM + comCrlf)
}

// 7. legado.txt — mais de 80 linhas, zero ocorrências de /END ou /FIM.
{
  const linhas = []
  for (let i = 1; i <= 100; i++) {
    linhas.push(i % 10 === 0 ? '' : `Linha ${i} de uma letra colada sem nenhuma marcação`)
  }
  escrever('legado.txt', linhas.join('\n'))
}

// 8. google-docs.txt — nbsp espalhado (como export real do Google Docs) e
// reticências unicode, que normalizar() NÃO deve tocar.
escrever(
  'google-docs.txt',
  [
    'SILÊNCIO DA NOITE',
    '',
    `O silêncio${NBSP}da noite pesa diferente…`,
    `quando a plateia foi embora${NBSP}e sobra só o eco`,
    '/END',
  ].join('\n'),
)

console.log('Fixtures gerados em', DIR)
