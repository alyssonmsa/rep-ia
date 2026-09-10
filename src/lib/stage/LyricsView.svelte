<script lang="ts">
  import { tick } from 'svelte'
  import type { Musica } from '../../types'
  import { splitIntoVerses } from './verses'
  import { encontrarLinhaMaisLonga, medirLarguraTexto, tetoFontePorLargura } from '../cifra/zoom'
  import { temaStore } from '../../theme.svelte'
  import PainelAjustes from './PainelAjustes.svelte'

  let { musica, onBack, onAbrirBusca }: { musica: Musica; onBack: () => void; onAbrirBusca: () => void } =
    $props()

  // Escala do §9 do prompt.md. No tema clássico o padrão começa 2 degraus
  // acima (fonte "dois passos maior" — §9).
  const FONT_SCALE = [28, 34, 40, 48, 58, 70, 84]
  const indicePadrao = temaStore.atual === 'classico' ? 5 : 3
  let fontIndex = $state(indicePadrao)

  const verses = $derived(splitIntoVerses(musica.letra))
  let startIndex = $state(0)
  let visibleVerses = $state<string[]>([])

  let rootEl: HTMLDivElement | undefined = $state()
  let contentEl: HTMLDivElement | undefined = $state()

  // Teto de zoom em cifra (prompt.md §7): maior fonte em que a linha mais
  // longa da letra inteira cabe na largura disponível, medida com a fonte
  // monoespaçada de verdade.
  const PADDING_HORIZONTAL_CONTEUDO = 48 // deve bater com .lyrics__content { padding: ... 24px }
  let teto = $state(Infinity)

  function recalcularTeto() {
    if (!musica.cifrada || !contentEl) {
      teto = Infinity
      return
    }
    const linha = encontrarLinhaMaisLonga(musica.letra)
    const REFERENCIA = 100
    const largura = medirLarguraTexto(linha, REFERENCIA)
    const disponivel = contentEl.clientWidth - PADDING_HORIZONTAL_CONTEUDO
    teto = tetoFontePorLargura(largura, REFERENCIA, disponivel)
  }

  function maiorIndicePermitido(tetoAtual: number): number {
    for (let i = FONT_SCALE.length - 1; i >= 0; i--) {
      if (FONT_SCALE[i] <= tetoAtual) return i
    }
    return 0
  }

  const indiceMaximoPermitido = $derived(maiorIndicePermitido(teto))
  const avisoZoomLimitado = $derived(musica.cifrada && teto < FONT_SCALE[0])

  $effect(() => {
    if (fontIndex > indiceMaximoPermitido) fontIndex = indiceMaximoPermitido
  })

  // Preenche a tela com o máximo de estrofes consecutivas que couberem no
  // tamanho de fonte atual (prompt.md §8.5: "avançar mostra a próxima
  // estrofe, ou quantas couberem na tela"). Sempre mostra pelo menos uma,
  // mesmo que ela sozinha já estoure a altura disponível.
  async function recompute() {
    recalcularTeto()

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
    fontIndex = Math.min(indiceMaximoPermitido, fontIndex + 1)
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

  let painelAberto = $state(false)
</script>

<!-- Navegação por toque é a interação primária aqui (prompt.md §8.5: zonas de
     toque grandes, sem botão visível). Suporte a teclado/pedal chega na
     Fatia 5 como um listener global de keydown, não como handlers locais
     por elemento — por isso não é adicionado aqui ainda. -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="lyrics" bind:this={rootEl} onclick={handleTap}>
  <div class="lyrics__topbar">
    <button class="lyrics__voltar" onclick={(e) => { e.stopPropagation(); onBack() }}>
      <span aria-hidden="true">‹</span>
      <span class="lyrics__title">{musica.titulo}</span>
    </button>
    <button class="lyrics__buscar" onclick={(e) => { e.stopPropagation(); onAbrirBusca() }}>Buscar</button>
  </div>

  {#if avisoZoomLimitado}
    <p class="lyrics__aviso-zoom">Cifra apertada nessa tela — vire o aparelho pra melhorar a leitura.</p>
  {/if}

  <div
    class="lyrics__content"
    class:lyrics__content--cifra={musica.cifrada}
    bind:this={contentEl}
    style="font-size: {FONT_SCALE[fontIndex]}px"
  >
    {#each visibleVerses as verse (verse)}
      <p class="lyrics__verse">{verse}</p>
    {/each}
  </div>

  <button
    class="lyrics__ajustes"
    onclick={(e) => { e.stopPropagation(); painelAberto = true }}
    aria-label="Ajustes de exibição"
  >
    ⚙
  </button>

  {#if painelAberto}
    <div onclick={(e) => e.stopPropagation()}>
      <PainelAjustes
        {fontIndex}
        fontMaxIndex={indiceMaximoPermitido}
        onAumentarFonte={increaseFont}
        onDiminuirFonte={decreaseFont}
        onFechar={() => (painelAberto = false)}
      />
    </div>
  {/if}
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
    padding: 0 8px;
    border-bottom: 1px solid var(--borda);
  }

  .lyrics__voltar {
    flex: 1;
    min-width: 0;
    min-height: 44px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 8px;
    background: none;
    border: none;
    color: var(--texto-fraco);
    font-family: var(--fonte-interface);
    font-size: 16px;
    text-align: left;
  }

  .lyrics__buscar {
    flex: 0 0 auto;
    min-height: 44px;
    padding: 0 12px;
    background: none;
    border: none;
    color: var(--acento);
    font-size: 15px;
  }

  .lyrics__title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .lyrics__aviso-zoom {
    flex: 0 0 auto;
    margin: 0;
    padding: 6px 16px;
    background: var(--superficie-alta);
    color: var(--acento);
    font-size: 13px;
  }

  .lyrics__content {
    flex: 1;
    overflow: hidden;
    padding: 32px 24px;
    font-family: var(--fonte-letra);
    line-height: 1.5;
  }

  .lyrics__content--cifra {
    font-family: var(--fonte-cifra);
    line-height: 1.25;
  }

  .lyrics__verse {
    margin: 0 0 1.5em 0;
    white-space: pre-wrap;
  }

  .lyrics__content--cifra .lyrics__verse {
    white-space: pre;
    overflow-x: auto;
  }

  .lyrics__verse:last-child {
    margin-bottom: 0;
  }

  .lyrics__ajustes {
    position: absolute;
    right: 12px;
    bottom: 12px;
    min-width: 44px;
    min-height: 44px;
    border-radius: 8px;
    border: 1px solid var(--borda);
    background: var(--superficie-alta);
    color: var(--texto);
    font-size: 18px;
  }

  .lyrics__ajustes:active {
    background: var(--borda);
  }
</style>
