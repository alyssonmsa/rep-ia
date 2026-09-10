<script lang="ts">
  import type { ItemSetlist, Musica } from '../../types'

  let {
    itens,
    currentItemId,
    resolveMusica,
    onSelect,
    onExit,
  }: {
    itens: ItemSetlist[]
    currentItemId: string | null
    resolveMusica: (musicaId: string) => Musica | undefined
    onSelect: (itemId: string) => void
    onExit: () => void
  } = $props()

  function temLetra(item: ItemSetlist): boolean {
    return item.tipo === 'musica' && item.musicaId !== null && resolveMusica(item.musicaId) !== undefined
  }
</script>

<div class="queue">
  <div class="queue__header">
    <button class="queue__sair" onclick={onExit}>‹ Sair</button>
    <h1 class="queue__title">Repertório</h1>
  </div>

  {#if itens.length === 0}
    <p class="queue__vazio">Essa setlist ainda não tem itens.</p>
  {:else}
    <ul class="queue__list">
      {#each itens as item (item.id)}
        {#if item.tipo === 'marcador'}
          <li class="queue__marcador">{item.texto}</li>
        {:else}
          <li>
            <button
              class="queue__item"
              class:queue__item--disponivel={temLetra(item)}
              class:queue__item--atual={currentItemId === item.id}
              onclick={() => onSelect(item.id)}
            >
              <span>{item.texto}</span>
              {#if temLetra(item)}
                <span class="queue__chevron" aria-hidden="true">›</span>
              {/if}
            </button>
          </li>
        {/if}
      {/each}
    </ul>
  {/if}
</div>

<style>
  .queue {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 24px 16px;
  }

  .queue__header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .queue__sair {
    background: none;
    border: none;
    color: var(--texto-fraco);
    font-size: 14px;
    min-height: 32px;
    padding: 0 4px;
  }

  .queue__title {
    font-size: 20px;
    font-weight: 600;
    color: var(--texto-fraco);
    margin: 0;
  }

  .queue__vazio {
    color: var(--texto-fraco);
    text-align: center;
    margin-top: 48px;
  }

  .queue__list {
    list-style: none;
    margin: 0;
    padding: 0;
    overflow-y: auto;
    flex: 1;
  }

  .queue__marcador {
    min-height: 40px;
    display: flex;
    align-items: center;
    margin-top: 12px;
    padding: 0 8px;
    border-top: 1px solid var(--borda);
    color: var(--texto-fraco);
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .queue__item {
    width: 100%;
    min-height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    background: none;
    border: none;
    border-bottom: 1px solid var(--borda);
    padding: 0 8px;
    font-size: 20px;
    text-align: left;
    color: var(--texto-fraco);
  }

  .queue__item--disponivel {
    color: var(--texto);
  }

  .queue__item--atual {
    background: var(--superficie);
  }

  .queue__item:active {
    background: var(--superficie);
  }

  .queue__chevron {
    color: var(--acento);
    font-size: 24px;
  }
</style>
