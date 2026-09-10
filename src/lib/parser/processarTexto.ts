import { normalizar } from './normalizar'
import { splitBlocks } from './splitBlocks'
import { parseBlock, type BlocoParseado } from './parseBlock'

export function processarTexto(textoBruto: string): BlocoParseado[] {
  return splitBlocks(normalizar(textoBruto)).map(parseBlock)
}
