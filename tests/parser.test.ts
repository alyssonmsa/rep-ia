import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { normalizar } from '../src/lib/parser/normalizar'
import { splitBlocks } from '../src/lib/parser/splitBlocks'
import { parseBlock } from '../src/lib/parser/parseBlock'
import { processarTexto } from '../src/lib/parser/processarTexto'

const FIXTURES_DIR = join(__dirname, 'fixtures')
function lerFixture(nome: string): string {
  return readFileSync(join(FIXTURES_DIR, nome), 'utf-8')
}

describe('normalizar', () => {
  it('remove o BOM do início', () => {
    const bom = String.fromCharCode(0xfeff)
    expect(normalizar(`${bom}texto`)).toBe('texto')
  })

  it('converte CRLF e CR pra LF', () => {
    expect(normalizar('a\r\nb\rc')).toBe('a\nb\nc')
  })

  it('troca nbsp por espaço comum', () => {
    const nbsp = String.fromCharCode(0xa0)
    expect(normalizar(`linha${nbsp}com nbsp`)).toBe('linha com nbsp')
  })

  it('não mexe em reticências nem acentuação', () => {
    expect(normalizar('Isso é lindo…')).toBe('Isso é lindo…')
  })

  it('não colapsa espaços internos nem faz trim do corpo', () => {
    expect(normalizar('  G    Em  \ntexto')).toBe('  G    Em  \ntexto')
  })
})

describe('splitBlocks — tabela de bordas do §6', () => {
  it('/end, /End, /END com espaços são aceitos, case-insensitive e trimados', () => {
    expect(splitBlocks('a\n/end')).toEqual(['a'])
    expect(splitBlocks('a\n/End')).toEqual(['a'])
    expect(splitBlocks('a\n  /END  ')).toEqual(['a'])
  })

  it('/FIM sozinho na linha é aceito na leitura', () => {
    expect(splitBlocks('a\n/FIM')).toEqual(['a'])
  })

  it('/END no meio de uma linha de letra não é terminador', () => {
    expect(splitBlocks('a\nchegou o fim /END desse jeito')).toEqual(['a\nchegou o fim /END desse jeito'])
  })

  it('último bloco sem /END é aceito — fim do texto fecha o bloco', () => {
    expect(splitBlocks('a\n/END\nb')).toEqual(['a', 'b'])
  })

  it('texto sem nenhum /END vira um bloco só', () => {
    expect(splitBlocks('linha 1\nlinha 2')).toEqual(['linha 1\nlinha 2'])
  })

  it('dois /END seguidos geram um bloco vazio, ignorado silenciosamente', () => {
    expect(splitBlocks('a\n/END\n/END\nb')).toEqual(['a', 'b'])
  })

  it('texto totalmente vazio dá zero blocos, sem erro', () => {
    expect(splitBlocks('')).toEqual([])
    expect(splitBlocks('\n\n   \n')).toEqual([])
  })
})

describe('parseBlock', () => {
  it('bloco só com título, sem letra, gera letra vazia', () => {
    expect(parseBlock('Título Solo')).toEqual({ titulo: 'Título Solo', letra: '' })
  })

  it('descarta linhas vazias entre título e letra', () => {
    expect(parseBlock('Título\n\n\nCorpo')).toEqual({ titulo: 'Título', letra: 'Corpo' })
  })

  it('descarta linhas vazias só no fim do bloco', () => {
    expect(parseBlock('Título\n\nCorpo\n\n\n')).toEqual({ titulo: 'Título', letra: 'Corpo' })
  })

  it('preserva linhas vazias no meio da letra exatamente', () => {
    expect(parseBlock('Título\n\nEstrofe 1\n\nEstrofe 2')).toEqual({
      titulo: 'Título',
      letra: 'Estrofe 1\n\nEstrofe 2',
    })
  })

  it('preserva espaços à esquerda no corpo (alinhamento de cifra)', () => {
    const bloco = 'Título\n\n   G   Em\nLetra da linha'
    expect(parseBlock(bloco)).toEqual({ titulo: 'Título', letra: '   G   Em\nLetra da linha' })
  })
})

describe('processarTexto com os fixtures', () => {
  it('uma-musica.txt: bloco único sem /END', () => {
    const blocos = processarTexto(lerFixture('uma-musica.txt'))
    expect(blocos).toHaveLength(1)
    expect(blocos[0].titulo).toBe('SÓ VOCÊ')
  })

  it('tres-musicas.txt: formato canônico', () => {
    const blocos = processarTexto(lerFixture('tres-musicas.txt'))
    expect(blocos.map((b) => b.titulo)).toEqual(['SÓ VOCÊ', 'Evidências', 'Valsa da Manhã'])
  })

  it('sem-end-no-ultimo.txt: fim de arquivo fecha o último bloco', () => {
    const blocos = processarTexto(lerFixture('sem-end-no-ultimo.txt'))
    expect(blocos).toHaveLength(2)
    expect(blocos[1].titulo).toBe('ÚLTIMA MÚSICA')
  })

  it('estrofes.txt: linhas em branco no meio do corpo são preservadas exatamente, mesmo várias seguidas', () => {
    const [bloco] = processarTexto(lerFixture('estrofes.txt'))
    expect(bloco.letra).toBe(
      [
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
      ].join('\n'),
    )
  })

  it('com-cifra.txt: espaços à esquerda e alinhamento sobrevivem', () => {
    const [bloco] = processarTexto(lerFixture('com-cifra.txt'))
    expect(bloco.letra).toContain('      G              Em')
  })

  it('baguncado.txt: BOM, CRLF, nbsp, /end minúsculo, /FIM e bloco vazio, tudo tratado', () => {
    const blocos = processarTexto(lerFixture('baguncado.txt'))
    expect(blocos.map((b) => b.titulo)).toEqual(['primeira música', 'segunda música', 'terceira música'])
  })

  it('google-docs.txt: nbsp normalizado, reticências preservadas', () => {
    const [bloco] = processarTexto(lerFixture('google-docs.txt'))
    expect(bloco.letra).toContain('O silêncio da noite pesa diferente…')
  })
})
