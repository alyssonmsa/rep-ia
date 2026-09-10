<script lang="ts">
  import { musicasStore } from '../data/musicasStore.svelte'
  import { normalizarBusca } from '../data/normalize'
  import type { Musica } from '../../types'

  let { onSelecionar, onFechar }: { onSelecionar: (musica: Musica) => void; onFechar: () => void } = $props()

  let busca = $state('')
  let inputEl: HTMLInputElement | undefined = $state()

  $effect(() => {
    inputEl?.focus()
  })

  // Busca rápida (prompt.md §8.5): no máximo 3 letras já trazem resultado,
  // um toque abre. Sem acento, por trecho no meio da palavra.
  const resultados = $derived.by(() => {
    const termo = normalizarBusca(busca)
    if (!termo) return []
    return musicasStore.list.filter((m) => normalizarBusca(m.titulo).includes(termo)).slice(0, 8)
  })
</script>

<div class="busca" role="dialog" aria-modal="true" aria-label="Busca rápida">
  <div class="busca__topo">
    <input
      bind:this={inputEl}
      bind:value={busca}
      class="busca__campo"
      type="search"
      placeholder="Buscar música…"
      aria-label="Buscar música"
    />
    <button class="busca__cancelar" onclick={onFechar}>Cancelar</button>
  </div>

  {#if busca.trim() && resultados.length === 0}
    <p class="busca__vazio">Nada encontrado.</p>
  {:else}
    <ul class="busca__resultados">
      {#each resultados as musica (musica.id)}
        <li>
          <button class="busca__item" onclick={() => onSelecionar(musica)}>{musica.titulo}</button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .busca {
    position: absolute;
    inset: 0;
    z-index: 20;
    background: var(--fundo);
    display: flex;
    flex-direction: column;
  }

  .busca__topo {
    flex: 0 0 auto;
    min-height: 56px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--borda);
  }

  .busca__campo {
    flex: 1;
    min-height: 44px;
    padding: 0 12px;
    border-radius: 8px;
    border: 1px solid var(--borda);
    background: var(--superficie);
    color: var(--texto);
    font-size: 20px;
  }

  .busca__cancelar {
    min-height: 44px;
    padding: 0 12px;
    background: none;
    border: none;
    color: var(--texto-fraco);
    font-size: 16px;
  }

  .busca__vazio {
    padding: 24px;
    text-align: center;
    color: var(--texto-fraco);
  }

  .busca__resultados {
    flex: 1;
    overflow-y: auto;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .busca__item {
    width: 100%;
    min-height: 64px;
    display: flex;
    align-items: center;
    background: none;
    border: none;
    border-bottom: 1px solid var(--borda);
    padding: 0 16px;
    font-size: 24px;
    text-align: left;
    color: var(--texto);
  }

  .busca__item:active {
    background: var(--superficie);
  }
</style>
