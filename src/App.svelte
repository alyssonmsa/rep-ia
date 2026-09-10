<script lang="ts">
  import { onMount } from 'svelte'
  import AcervoScreen from './lib/acervo/AcervoScreen.svelte'
  import MusicaForm from './lib/acervo/MusicaForm.svelte'
  import SetlistsScreen from './lib/setlist/SetlistsScreen.svelte'
  import SetlistDetail from './lib/setlist/SetlistDetail.svelte'
  import StageMode from './lib/stage/StageMode.svelte'
  import { musicasStore } from './lib/data/musicasStore.svelte'
  import { setlistsStore } from './lib/data/setlistsStore.svelte'

  type Tela =
    | { nome: 'acervo' }
    | { nome: 'musica-form'; musicaId: string | null }
    | { nome: 'setlists' }
    | { nome: 'setlist-detail'; setlistId: string }
    | { nome: 'palco'; setlistId: string }

  let tela = $state<Tela>({ nome: 'acervo' })
  const aba = $derived(tela.nome === 'musica-form' ? 'acervo' : tela.nome === 'setlist-detail' ? 'setlists' : tela.nome)

  onMount(() => {
    void musicasStore.load()
    void setlistsStore.load()
  })
</script>

{#if tela.nome === 'palco'}
  {@const setlistIdAtual = tela.setlistId}
  <StageMode setlistId={setlistIdAtual} onExit={() => (tela = { nome: 'setlist-detail', setlistId: setlistIdAtual })} />
{:else}
  <div class="shell">
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
          onNovaMusica={() => (tela = { nome: 'musica-form', musicaId: null })}
        />
      {:else if tela.nome === 'musica-form'}
        <MusicaForm musicaId={tela.musicaId} onDone={() => (tela = { nome: 'acervo' })} />
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
