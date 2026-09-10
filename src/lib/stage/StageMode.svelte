<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import QueueView from './QueueView.svelte'
  import LyricsView from './LyricsView.svelte'
  import { musicasFixture } from '../fixtures/songs'
  import { createWakeLockController } from '../wakelock'

  let view = $state<'fila' | 'letra'>('fila')
  let selectedId = $state<string | null>(null)

  const musicaSelecionada = $derived(musicasFixture.find((m) => m.id === selectedId) ?? null)

  const wakeLock = createWakeLockController()
  let engagedOnce = false

  function openMusica(id: string) {
    selectedId = id
    view = 'letra'
  }

  function backToQueue() {
    view = 'fila'
    selectedId = null
  }

  // Tela cheia e Wake Lock exigem um gesto do usuário — dispara os dois na
  // primeira interação, sem adicionar um botão "iniciar" separado
  // (prompt.md §4, §9: nenhum botão supérfluo na interface).
  async function engageOnFirstTap() {
    if (engagedOnce) return
    engagedOnce = true
    try {
      await document.documentElement.requestFullscreen?.()
    } catch {
      // iOS Safari não suporta a Fullscreen API. Isso é esperado — a
      // solução real é instalar o PWA (Fatia 4), não um erro a tratar aqui.
    }
    void wakeLock.start()
  }

  onMount(() => {
    document.addEventListener('pointerdown', engageOnFirstTap, { once: true })
  })

  onDestroy(() => {
    document.removeEventListener('pointerdown', engageOnFirstTap)
    wakeLock.stop()
  })
</script>

<div class="stage">
  {#if !wakeLock.supported}
    <div class="stage__warning" role="alert">
      Este navegador não sabe manter a tela ligada sozinho. Desative o
      bloqueio automático de tela nas configurações do aparelho antes de
      subir ao palco.
    </div>
  {/if}

  <div class="stage__body">
    {#if view === 'fila'}
      <QueueView musicas={musicasFixture} onSelect={openMusica} />
    {:else if musicaSelecionada}
      <LyricsView musica={musicaSelecionada} onBack={backToQueue} />
    {/if}
  </div>
</div>

<style>
  .stage {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .stage__body {
    flex: 1;
    min-height: 0;
  }

  .stage__warning {
    flex: 0 0 auto;
    padding: 10px 16px;
    background: var(--superficie-alta);
    color: var(--acento);
    font-size: 14px;
    border-bottom: 1px solid var(--borda);
  }
</style>
