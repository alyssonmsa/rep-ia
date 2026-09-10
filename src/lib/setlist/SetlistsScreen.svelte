<script lang="ts">
  import { setlistsStore } from '../data/setlistsStore.svelte'

  let { onOpenSetlist }: { onOpenSetlist: (id: string) => void } = $props()

  async function novaSetlist() {
    const setlist = await setlistsStore.create('Nova setlist')
    onOpenSetlist(setlist.id)
  }

  async function duplicar(id: string) {
    await setlistsStore.duplicate(id)
  }
</script>

<div class="setlists">
  <div class="setlists__header">
    <h1 class="setlists__titulo">Setlists</h1>
    <button class="setlists__nova" onclick={novaSetlist}>+ Nova setlist</button>
  </div>

  {#if setlistsStore.list.length === 0}
    <div class="setlists__vazio">
      <p>Nenhuma setlist ainda. Monte a fila do seu próximo show.</p>
    </div>
  {:else}
    <ul class="setlists__lista">
      {#each setlistsStore.list as setlist (setlist.id)}
        <li class="setlists__linha">
          <button class="setlists__item" onclick={() => onOpenSetlist(setlist.id)}>
            <span class="setlists__nome">{setlist.nome}</span>
            <span class="setlists__contagem">{setlist.itens.length} itens</span>
          </button>
          <button class="setlists__duplicar" onclick={() => duplicar(setlist.id)}>Duplicar</button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .setlists {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 16px;
    gap: 16px;
  }

  .setlists__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 0 0 auto;
  }

  .setlists__titulo {
    font-size: 20px;
    font-weight: 600;
    color: var(--texto-fraco);
    margin: 0;
  }

  .setlists__nova {
    min-height: 44px;
    padding: 0 14px;
    border-radius: 8px;
    border: 1px solid var(--acento);
    background: none;
    color: var(--acento);
    font-size: 15px;
  }

  .setlists__vazio {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--texto-fraco);
    text-align: center;
    padding: 0 32px;
  }

  .setlists__lista {
    list-style: none;
    margin: 0;
    padding: 0;
    overflow-y: auto;
    flex: 1;
  }

  .setlists__linha {
    display: flex;
    align-items: stretch;
    gap: 4px;
    border-bottom: 1px solid var(--borda);
  }

  .setlists__item {
    flex: 1;
    min-width: 0;
    min-height: 56px;
    display: flex;
    align-items: center;
    gap: 12px;
    background: none;
    border: none;
    padding: 0 8px;
    font-size: 18px;
    text-align: left;
    color: var(--texto);
  }

  .setlists__item:active {
    background: var(--superficie);
  }

  .setlists__nome {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .setlists__contagem {
    color: var(--texto-fraco);
    font-size: 14px;
  }

  .setlists__duplicar {
    flex: 0 0 auto;
    min-width: 44px;
    background: none;
    border: none;
    color: var(--acento);
    font-size: 14px;
    padding: 0 12px;
  }
</style>
