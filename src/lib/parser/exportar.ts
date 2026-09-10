import type { LotesImportacao, Musica, Setlist } from '../../types'

/**
 * Formato canônico de exportação (prompt.md §6): título, uma linha em
 * branco, o corpo intacto, `/END` sozinho na linha. Round-tripa
 * exatamente por `processarTexto` — ver tests/roundtrip.test.ts.
 */
export function gerarTxtCanonico(musicas: Musica[]): string {
  const blocos = musicas.map((musica) => `${musica.titulo}\n\n${musica.letra}\n/END`)
  return blocos.length > 0 ? `${blocos.join('\n\n')}\n` : ''
}

export type BackupJson = {
  versao: 1
  exportadoEm: number
  musicas: Musica[]
  setlists: Setlist[]
  lotesImportacao: LotesImportacao[]
}

/**
 * Backup fiel (prompt.md §6): inclui `cifrada`, setlists e ids — tudo que
 * o `.txt` de intercâmbio não carrega.
 */
export function gerarJsonBackup(musicas: Musica[], setlists: Setlist[], lotes: LotesImportacao[]): string {
  const backup: BackupJson = {
    versao: 1,
    exportadoEm: Date.now(),
    musicas,
    setlists,
    lotesImportacao: lotes,
  }
  return JSON.stringify(backup, null, 2)
}
