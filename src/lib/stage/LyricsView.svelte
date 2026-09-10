<script lang="ts">
  import { tick } from 'svelte'
  import type { Musica } from '../../types'
  import { splitIntoVerses } from './verses'

  let { musica, onBack }: { musica: Musica; onBack: () => void } = $props()

  // Escala do §9 do prompt.md. Índice 3 (48px) como ponto de partida.
  const FONT_SCALE = [28, 34, 40, 48, 58, 70, 84]
  let fontIndex = $state(3)

  const verses = $derived(splitIntoVerses(musica.letra))
  let startIndex = $state(0)
  let visibleVerses = $state<string[]>([])

  let rootEl: HTMLDivElement | undefined = $state()
  let contentEl: HTMLDivElement | undefined = $state()

  // Preenche a tela com o máximo de estrofes consecutivas que couberem no
  // tamanho de fonte atual (prompt.md §8.5: "avançar mostra a próxima
  // estrofe, ou quantas couberem na tela"). Sempre mostra pelo menos uma,
  // mesmo que ela sozinha já estoure a altura disponível.
  async function recompute() {
    if (verses.length === 0 || !contentEl) {
      visibleVerses = []
      return
    }

    let count = 1
    visibleVerses = verses.slice(startIndex, startIndex + count)
    await tick()

    while (startIndex + count < verses.length && contentEl.scrollHeight <= contentEl.clientHeight) {
      count += 1
      visibleVerses = verses.slice(startIndex, startIndex + count)
      await tick()
    }

    if (count > 1 && contentEl.scrollHeight > contentEl.clientHeight) {
      count -= 1
      visibleVerses = verses.slice(startIndex, startIndex + count)
    }
  }

  $effect(() => {
    fontIndex
    startIndex
    verses
    void recompute()
  })

  function next() {
    const shown = visibleVerses.length || 1
    if (startIndex + shown < verses.length) {
      startIndex += shown
    }
  }

  function prev() {
    startIndex = Math.max(0, startIndex - 1)
  }

  function increaseFont() {
    fontIndex = Math.min(FONT_SCALE.length - 1, fontIndex + 1)
  }

  function decreaseFont() {
    fontIndex = Math.max(0, fontIndex - 1)
  }

  function handleTap(event: MouseEvent) {
    if (!rootEl) return
    const rect = rootEl.getBoundingClientRect()
    const x = event.clientX - rect.left
    if (x < rect.width / 2) {
      prev()
    } else {
      next()
    }
  }
</script>

<!-- Navegação por toque é a interação primária aqui (prompt.md §8.5: zonas de
     toque grandes, sem botão visível). Suporte a teclado/pedal chega na
     Fatia 5 como um listener global de keydown, não como handlers locais
     por elemento — por isso não é adicionado aqui ainda. -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="lyrics" bind:this={rootEl} onclick={handleTap}>
  <button class="lyrics__topbar" onclick={(e) => { e.stopPropagation(); onBack() }}>
    <span aria-hidden="true">‹</span>
    <span class="lyrics__title">{musica.titulo}</span>
  </button>

  <div
    class="lyrics__content"
    bind:this={contentEl}
    style="font-size: {FONT_SCALE[fontIndex]}px"
  >
    {#each visibleVerses as verse (verse)}
      <p class="lyrics__verse">{verse}</p>
    {/each}
  </div>

  <div class="lyrics__font-controls">
    <button onclick={(e) => { e.stopPropagation(); decreaseFont() }} aria-label="Diminuir fonte">A-</button>
    <button onclick={(e) => { e.stopPropagation(); increaseFont() }} aria-label="Aumentar fonte">A+</button>
  </div>
</div>

<style>
  .lyrics {
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .lyrics__topbar {
    flex: 0 0 auto;
    min-height: 56px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 16px;
    background: none;
    border: none;
    border-bottom: 1px solid var(--borda);
    color: var(--texto-fraco);
    font-family: var(--fonte-interface);
    font-size: 16px;
    text-align: left;
  }

  .lyrics__title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .lyrics__content {
    flex: 1;
    overflow: hidden;
    padding: 32px 24px;
    font-family: var(--fonte-letra);
    line-height: 1.5;
  }

  .lyrics__verse {
    margin: 0 0 1.5em 0;
    white-space: pre-wrap;
  }

  .lyrics__verse:last-child {
    margin-bottom: 0;
  }

  .lyrics__font-controls {
    position: absolute;
    right: 12px;
    bottom: 12px;
    display: flex;
    gap: 8px;
  }

  .lyrics__font-controls button {
    min-width: 44px;
    min-height: 44px;
    border-radius: 8px;
    border: 1px solid var(--borda);
    background: var(--superficie-alta);
    color: var(--texto);
    font-size: 16px;
  }

  .lyrics__font-controls button:active {
    background: var(--borda);
  }
</style>
