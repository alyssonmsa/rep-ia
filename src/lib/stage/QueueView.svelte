<script lang="ts">
  import type { Musica } from '../../types'

  let { musicas, onSelect }: { musicas: Musica[]; onSelect: (id: string) => void } = $props()
</script>

<div class="queue">
  <h1 class="queue__title">Repertório</h1>
  <ul class="queue__list">
    {#each musicas as musica (musica.id)}
      <li>
        <button class="queue__item" onclick={() => onSelect(musica.id)}>
          <span>{musica.titulo}</span>
          <span class="queue__chevron" aria-hidden="true">›</span>
        </button>
      </li>
    {/each}
  </ul>
</div>

<style>
  .queue {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 24px 16px;
  }

  .queue__title {
    font-size: 20px;
    font-weight: 600;
    color: var(--texto-fraco);
    margin: 0 0 16px 8px;
  }

  .queue__list {
    list-style: none;
    margin: 0;
    padding: 0;
    overflow-y: auto;
    flex: 1;
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
    color: var(--texto);
  }

  .queue__item:active {
    background: var(--superficie);
  }

  .queue__chevron {
    color: var(--acento);
    font-size: 24px;
  }
</style>
