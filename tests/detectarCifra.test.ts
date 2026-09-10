import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { detectarCifra } from '../src/lib/cifra/detectarCifra'
import { processarTexto } from '../src/lib/parser/processarTexto'

function lerFixture(nome: string): string {
  return readFileSync(join(__dirname, 'fixtures', nome), 'utf-8')
}

describe('detectarCifra', () => {
  it('detecta cifra real (com-cifra.txt): acordes alinhados com espaço duplo', () => {
    const [bloco] = processarTexto(lerFixture('com-cifra.txt'))
    expect(detectarCifra(bloco.letra)).toBe(true)
  })

  it('não cai no falso-positivo de palavras portuguesas que também são acordes', () => {
    const [bloco] = processarTexto(lerFixture('falso-positivo-cifra.txt'))
    expect(detectarCifra(bloco.letra)).toBe(false)
  })

  it('letra comum, sem nenhum token parecido com acorde, é false', () => {
    expect(detectarCifra('Uma letra qualquer\nsem nenhum acorde\nem lugar nenhum')).toBe(false)
  })

  it('exige 2+ linhas candidatas — uma só não basta', () => {
    const umaLinha = '      G              Em\nUma linha comum sem espaço duplo'
    expect(detectarCifra(umaLinha)).toBe(false)
  })

  it('2 linhas candidatas já classificam como cifrada', () => {
    const duasLinhas = '      G              Em\nUma linha de letra\n   C        D\nOutra linha de letra'
    expect(detectarCifra(duasLinhas)).toBe(true)
  })

  it('uma linha com só um acorde bare (1 token, sem sufixo) não é candidata mesmo com espaço duplo ao redor', () => {
    // "A" sozinho, sem sufixo e sem outro token — condição 3 do §7 falha.
    expect(detectarCifra('  A  \nletra normal\n  A  \noutra letra normal')).toBe(false)
  })

  it('acorde com sufixo e espaço duplo, mesmo sozinho na linha, conta como candidata', () => {
    // "Em7" tem sufixo — só precisa do espaço duplo pra virar candidata.
    const texto = '  Em7   \nletra 1\n  D/F#   \nletra 2'
    expect(detectarCifra(texto)).toBe(true)
  })
})
