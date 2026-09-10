<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import QueueView from './QueueView.svelte'
  import LyricsView from './LyricsView.svelte'
  import QuickSearch from './QuickSearch.svelte'
  import { musicasStore } from '../data/musicasStore.svelte'
  import { setlistsStore } from '../data/setlistsStore.svelte'
  import { createWakeLockController } from '../wakelock'
  import type { Musica } from '../../types'

  let { setlistId, onExit }: { setlistId: string; onExit: () => void } = $props()

  const setlist = $derived(setlistsStore.list.find((s) => s.id === setlistId))
  const itens = $derived(setlist ? [...setlist.itens].sort((a, b) => a.ordem - b.ordem) : [])

  function resolveMusica(musicaId: string): Musica | undefined {
    return musicasStore.list.find((m) => m.id === musicaId)
  }

  let view = $state<'fila' | 'letra'>('fila')
  let currentItemId = $state<string | null>(null)
  let musicaAberta = $state<Musica | null>(null)

  function selecionarItem(itemId: string) {
    currentItemId = itemId
    const item = itens.find((i) => i.id === itemId)
    if (!item || item.tipo !== 'musica' || !item.musicaId) return
    const musica = resolveMusica(item.musicaId)
    if (!musica) return
    musicaAberta = musica
    view = 'letra'
  }

  function voltarParaFila() {
    view = 'fila'
    musicaAberta = null
  }

  // Busca rápida (prompt.md §8.5): abre a letra direto, sem passar pela
  // fila — a música achada nem precisa estar nesta setlist.
  let buscaAberta = $state(false)

  function abrirResultadoBusca(musica: Musica) {
    musicaAberta = musica
    view = 'letra'
    buscaAberta = false
  }

  const wakeLock = createWakeLockController()
  let engagedOnce = false

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
      <QueueView
        {itens}
        {currentItemId}
        {resolveMusica}
        onSelect={selecionarItem}
        {onExit}
        onAbrirBusca={() => (buscaAberta = true)}
      />
    {:else if musicaAberta}
      {#key musicaAberta.id}
        <LyricsView musica={musicaAberta} onBack={voltarParaFila} onAbrirBusca={() => (buscaAberta = true)} />
      {/key}
    {/if}

    {#if buscaAberta}
      <QuickSearch onSelecionar={abrirResultadoBusca} onFechar={() => (buscaAberta = false)} />
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
    position: relative;
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
