<script lang="ts">
  import { onMount } from 'svelte'
  import AcervoScreen from './lib/acervo/AcervoScreen.svelte'
  import MusicaForm from './lib/acervo/MusicaForm.svelte'
  import ColarLetra from './lib/acervo/ColarLetra.svelte'
  import RevisaoImportacao from './lib/acervo/RevisaoImportacao.svelte'
  import LegacyFallback from './lib/acervo/LegacyFallback.svelte'
  import SetlistsScreen from './lib/setlist/SetlistsScreen.svelte'
  import SetlistDetail from './lib/setlist/SetlistDetail.svelte'
  import StageMode from './lib/stage/StageMode.svelte'
  import { musicasStore } from './lib/data/musicasStore.svelte'
  import { setlistsStore } from './lib/data/setlistsStore.svelte'
  import { lotesStore } from './lib/data/lotesStore.svelte'
  import { iniciarImportacao } from './lib/import/iniciarImportacao'
  import { gerarJsonBackup, gerarTxtCanonico } from './lib/parser/exportar'
  import { baixarArquivo } from './lib/download'
  import type { BlocoParseado } from './lib/parser/parseBlock'

  type Tela =
    | { nome: 'acervo' }
    | { nome: 'musica-form'; musicaId: string }
    | { nome: 'colar' }
    | { nome: 'revisao'; blocos: BlocoParseado[] }
    | { nome: 'legado'; textoOriginal: string; origem: 'colar' | 'arquivo' }
    | { nome: 'setlists' }
    | { nome: 'setlist-detail'; setlistId: string }
    | { nome: 'palco'; setlistId: string }

  const TELAS_DO_ACERVO = new Set(['acervo', 'musica-form', 'colar', 'revisao', 'legado'])

  let tela = $state<Tela>({ nome: 'acervo' })
  const aba = $derived(TELAS_DO_ACERVO.has(tela.nome) ? 'acervo' : 'setlists')

  let ultimaImportacao = $state<{ loteId: string; quantidade: number } | null>(null)
  let timeoutImportacao: ReturnType<typeof setTimeout> | undefined

  onMount(() => {
    void musicasStore.load()
    void setlistsStore.load()
    void lotesStore.load()
  })

  function irParaResultado(resultado: ReturnType<typeof iniciarImportacao>, origemLegado: 'colar' | 'arquivo') {
    if (resultado.tipo === 'legado') {
      tela = { nome: 'legado', textoOriginal: resultado.textoOriginal, origem: origemLegado }
    } else if (resultado.tipo === 'revisao') {
      tela = { nome: 'revisao', blocos: resultado.blocos }
    }
    // 'vazio' e 'bloco-unico' não chegam aqui (arquivo força revisão, colar trata os dois na hora)
  }

  function handleArquivoTexto(texto: string) {
    irParaResultado(iniciarImportacao(texto, { forcarRevisao: true }), 'arquivo')
  }

  function handleLegadoContinuar(textoEditado: string, origem: 'colar' | 'arquivo') {
    irParaResultado(iniciarImportacao(textoEditado, { forcarRevisao: origem === 'arquivo' }), origem)
  }

  function notificarImportacao(loteId: string, quantidade: number) {
    tela = { nome: 'acervo' }
    if (quantidade === 0) return
    ultimaImportacao = { loteId, quantidade }
    clearTimeout(timeoutImportacao)
    timeoutImportacao = setTimeout(() => {
      ultimaImportacao = null
    }, 8000)
  }

  async function desfazerImportacao() {
    const atual = ultimaImportacao
    if (!atual) return
    const lote = lotesStore.list.find((l) => l.id === atual.loteId)
    if (lote) {
      for (const id of lote.musicaIds) {
        await setlistsStore.unlinkMusica(id)
        await musicasStore.remove(id)
      }
      await lotesStore.remove(lote.id)
    }
    clearTimeout(timeoutImportacao)
    ultimaImportacao = null
  }

  function exportar() {
    const hoje = new Date().toISOString().slice(0, 10)
    baixarArquivo(gerarTxtCanonico(musicasStore.list), `repertorio-${hoje}.txt`, 'text/plain')
    baixarArquivo(
      gerarJsonBackup(musicasStore.list, setlistsStore.list, lotesStore.list),
      `backup-${hoje}.json`,
      'application/json',
    )
  }
</script>

{#if tela.nome === 'palco'}
  {@const setlistIdAtual = tela.setlistId}
  <StageMode setlistId={setlistIdAtual} onExit={() => (tela = { nome: 'setlist-detail', setlistId: setlistIdAtual })} />
{:else}
  <div class="shell">
    {#if ultimaImportacao}
      <div class="shell__aviso" role="status">
        <span>
          {ultimaImportacao.quantidade} música{ultimaImportacao.quantidade === 1 ? '' : 's'} importada{ultimaImportacao.quantidade === 1 ? '' : 's'}
        </span>
        <button onclick={desfazerImportacao}>Desfazer</button>
      </div>
    {/if}

    <nav class="shell__tabs">
      <button class:shell__tab--ativa={aba === 'acervo'} class="shell__tab" onclick={() => (tela = { nome: 'acervo' })}>
        Acervo
      </button>
      <button class:shell__tab--ativa={aba === 'setlists'} class="shell__tab" onclick={() => (tela = { nome: 'setlists' })}>
        Setlists
      </button>
    </nav>

    <div class="shell__body">
      {#if tela.nome === 'acervo'}
        <AcervoScreen
          onOpenMusica={(id) => (tela = { nome: 'musica-form', musicaId: id })}
          onColarLetra={() => (tela = { nome: 'colar' })}
          onArquivoTexto={handleArquivoTexto}
          onExportar={exportar}
        />
      {:else if tela.nome === 'musica-form'}
        <MusicaForm musicaId={tela.musicaId} onDone={() => (tela = { nome: 'acervo' })} />
      {:else if tela.nome === 'colar'}
        <ColarLetra
          onCancelar={() => (tela = { nome: 'acervo' })}
          onSalvo={() => (tela = { nome: 'acervo' })}
          onRevisao={(blocos) => (tela = { nome: 'revisao', blocos })}
          onLegado={(textoOriginal) => (tela = { nome: 'legado', textoOriginal, origem: 'colar' })}
        />
      {:else if tela.nome === 'revisao'}
        <RevisaoImportacao blocos={tela.blocos} onCancelar={() => (tela = { nome: 'acervo' })} onImportado={notificarImportacao} />
      {:else if tela.nome === 'legado'}
        {@const origemAtual = tela.origem}
        <LegacyFallback
          textoOriginal={tela.textoOriginal}
          onCancelar={() => (tela = { nome: 'acervo' })}
          onContinuar={(texto) => handleLegadoContinuar(texto, origemAtual)}
        />
      {:else if tela.nome === 'setlists'}
        <SetlistsScreen onOpenSetlist={(id) => (tela = { nome: 'setlist-detail', setlistId: id })} />
      {:else if tela.nome === 'setlist-detail'}
        <SetlistDetail
          setlistId={tela.setlistId}
          onBack={() => (tela = { nome: 'setlists' })}
          onAbrirPalco={(id) => (tela = { nome: 'palco', setlistId: id })}
        />
      {/if}
    </div>
  </div>
{/if}

<style>
  .shell {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .shell__aviso {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 16px;
    background: var(--superficie-alta);
    color: var(--texto);
    font-size: 14px;
    border-bottom: 1px solid var(--borda);
  }

  .shell__aviso button {
    background: none;
    border: none;
    color: var(--acento);
    font-weight: 600;
    font-size: 14px;
  }

  .shell__tabs {
    flex: 0 0 auto;
    display: flex;
    border-bottom: 1px solid var(--borda);
  }

  .shell__tab {
    flex: 1;
    min-height: 48px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--texto-fraco);
    font-size: 15px;
    font-weight: 600;
  }

  .shell__tab--ativa {
    color: var(--texto);
    border-bottom-color: var(--acento);
  }

  .shell__body {
    flex: 1;
    min-height: 0;
  }
</style>
