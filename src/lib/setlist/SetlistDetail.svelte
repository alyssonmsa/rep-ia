<script lang="ts">
  import { dndzone, type DndEvent } from 'svelte-dnd-action'
  import { musicasStore } from '../data/musicasStore.svelte'
  import { setlistsStore } from '../data/setlistsStore.svelte'
  import { normalizarBusca } from '../data/normalize'
  import type { ItemSetlist } from '../../types'

  let {
    setlistId,
    onBack,
    onAbrirPalco,
  }: { setlistId: string; onBack: () => void; onAbrirPalco: (id: string) => void } = $props()

  const setlist = $derived(setlistsStore.list.find((s) => s.id === setlistId))

  let itensOrdenados = $state<ItemSetlist[]>([])
  $effect(() => {
    itensOrdenados = setlist ? [...setlist.itens].sort((a, b) => a.ordem - b.ordem) : []
  })

  let editandoNome = $state(false)
  let nomeDraft = $state('')

  function iniciarEdicaoNome() {
    nomeDraft = setlist?.nome ?? ''
    editandoNome = true
  }

  async function salvarNome() {
    const nome = nomeDraft.trim()
    if (nome && setlist) await setlistsStore.rename(setlist.id, nome)
    editandoNome = false
  }

  function handleDndConsider(e: CustomEvent<DndEvent<ItemSetlist>>) {
    itensOrdenados = e.detail.items
  }

  async function handleDndFinalize(e: CustomEvent<DndEvent<ItemSetlist>>) {
    itensOrdenados = e.detail.items
    await setlistsStore.reorderItems(setlistId, itensOrdenados.map((i) => i.id))
  }

  async function removerItem(itemId: string) {
    await setlistsStore.removeItem(setlistId, itemId)
  }

  // --- adicionar item (autocomplete: prompt.md §8.4) ---
  let buscaItem = $state('')

  const resultadosBusca = $derived.by(() => {
    const termo = normalizarBusca(buscaItem)
    if (!termo) return []
    return musicasStore.list.filter((m) => normalizarBusca(m.titulo).includes(termo)).slice(0, 6)
  })

  async function adicionarComoTexto() {
    const texto = buscaItem.trim()
    if (!texto) return
    await setlistsStore.addItem(setlistId, { texto, musicaId: null, tipo: 'musica' })
    buscaItem = ''
  }

  async function adicionarVinculada(musicaId: string, titulo: string) {
    await setlistsStore.addItem(setlistId, { texto: titulo, musicaId, tipo: 'musica' })
    buscaItem = ''
  }

  // --- adicionar marcador ---
  let marcadorAberto = $state(false)
  let marcadorTexto = $state('')

  async function adicionarMarcador() {
    const texto = marcadorTexto.trim()
    if (!texto) return
    await setlistsStore.addItem(setlistId, { texto, musicaId: null, tipo: 'marcador' })
    marcadorTexto = ''
    marcadorAberto = false
  }
</script>

{#if setlist}
  <div class="detail">
    <div class="detail__topbar">
      <button class="detail__voltar" onclick={onBack}>‹ Setlists</button>
      {#if editandoNome}
        <input
          class="detail__nome-input"
          bind:value={nomeDraft}
          onblur={salvarNome}
          onkeydown={(e) => e.key === 'Enter' && salvarNome()}
        />
      {:else}
        <button class="detail__nome" onclick={iniciarEdicaoNome}>{setlist.nome}</button>
      {/if}
      <button
        class="detail__palco"
        onclick={() => onAbrirPalco(setlistId)}
        disabled={itensOrdenados.length === 0}
      >
        Abrir no palco
      </button>
    </div>

    {#if itensOrdenados.length === 0}
      <p class="detail__vazio">Adicione músicas ou marcadores abaixo pra montar a fila do show.</p>
    {:else}
      <ul
        class="detail__itens"
        use:dndzone={{ items: itensOrdenados, dragDisabled: false, flipDurationMs: 150 }}
        onconsider={handleDndConsider}
        onfinalize={handleDndFinalize}
      >
        {#each itensOrdenados as item (item.id)}
          <li class="detail__item" class:detail__item--marcador={item.tipo === 'marcador'}>
            <span class="detail__item-texto">{item.texto}</span>
            <button class="detail__item-remover" onclick={() => removerItem(item.id)} aria-label="Remover item">
              ×
            </button>
          </li>
        {/each}
      </ul>
    {/if}

    <div class="detail__adicionar">
      <input
        class="detail__busca"
        type="text"
        placeholder="Adicionar música…"
        bind:value={buscaItem}
        onkeydown={(e) => e.key === 'Enter' && adicionarComoTexto()}
      />
      {#if buscaItem.trim()}
        <ul class="detail__sugestoes">
          <li>
            <button class="detail__sugestao" onclick={adicionarComoTexto}>
              Usar "{buscaItem.trim()}"
            </button>
          </li>
          {#each resultadosBusca as musica (musica.id)}
            <li>
              <button class="detail__sugestao" onclick={() => adicionarVinculada(musica.id, musica.titulo)}>
                {musica.titulo}
              </button>
            </li>
          {/each}
        </ul>
      {/if}

      {#if marcadorAberto}
        <div class="detail__marcador-form">
          <input
            class="detail__busca"
            type="text"
            placeholder="Nome do marcador (ex.: INTERVALO)"
            bind:value={marcadorTexto}
            onkeydown={(e) => e.key === 'Enter' && adicionarMarcador()}
          />
          <button class="detail__marcador-confirmar" onclick={adicionarMarcador}>Adicionar</button>
        </div>
      {:else}
        <button class="detail__novo-marcador" onclick={() => (marcadorAberto = true)}>+ Marcador</button>
      {/if}
    </div>
  </div>
{/if}

<style>
  .detail {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .detail__topbar {
    flex: 0 0 auto;
    min-height: 56px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 8px;
    border-bottom: 1px solid var(--borda);
  }

  .detail__voltar {
    background: none;
    border: none;
    color: var(--texto-fraco);
    font-size: 15px;
    min-height: 44px;
    padding: 0 8px;
  }

  .detail__nome,
  .detail__nome-input {
    flex: 1;
    min-width: 0;
    font-size: 17px;
    font-weight: 600;
  }

  .detail__nome {
    background: none;
    border: none;
    color: var(--texto);
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .detail__nome-input {
    background: var(--superficie);
    border: 1px solid var(--acento);
    border-radius: 6px;
    color: var(--texto);
    padding: 6px 8px;
    font-family: inherit;
  }

  .detail__palco {
    flex: 0 0 auto;
    min-height: 44px;
    padding: 0 12px;
    border-radius: 8px;
    border: 1px solid var(--acento);
    background: none;
    color: var(--acento);
    font-size: 14px;
    white-space: nowrap;
  }

  .detail__palco:disabled {
    border-color: var(--borda);
    color: var(--texto-fraco);
  }

  .detail__vazio {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 0 32px;
    color: var(--texto-fraco);
  }

  .detail__itens {
    flex: 1;
    overflow-y: auto;
    list-style: none;
    margin: 0;
    padding: 8px;
  }

  .detail__item {
    min-height: 56px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 12px;
    margin-bottom: 4px;
    background: var(--superficie);
    border-radius: 8px;
    font-size: 17px;
  }

  .detail__item--marcador {
    min-height: 40px;
    margin-top: 12px;
    background: none;
    border-top: 1px solid var(--borda);
    font-size: 14px;
    color: var(--texto-fraco);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .detail__item-texto {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .detail__item-remover {
    background: none;
    border: none;
    color: var(--texto-fraco);
    font-size: 20px;
    min-width: 32px;
    min-height: 32px;
  }

  .detail__adicionar {
    flex: 0 0 auto;
    padding: 12px;
    border-top: 1px solid var(--borda);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .detail__busca {
    min-height: 44px;
    padding: 0 12px;
    border-radius: 8px;
    border: 1px solid var(--borda);
    background: var(--superficie);
    color: var(--texto);
    font-size: 16px;
  }

  .detail__sugestoes {
    list-style: none;
    margin: 0;
    padding: 0;
    max-height: 240px;
    overflow-y: auto;
    border: 1px solid var(--borda);
    border-radius: 8px;
  }

  .detail__sugestao {
    width: 100%;
    min-height: 44px;
    display: flex;
    align-items: center;
    background: var(--superficie-alta);
    border: none;
    border-bottom: 1px solid var(--borda);
    color: var(--texto);
    text-align: left;
    padding: 0 12px;
    font-size: 15px;
  }

  .detail__sugestoes li:last-child .detail__sugestao {
    border-bottom: none;
  }

  .detail__novo-marcador {
    align-self: flex-start;
    min-height: 44px;
    padding: 0 12px;
    background: none;
    border: 1px dashed var(--borda);
    border-radius: 8px;
    color: var(--texto-fraco);
    font-size: 14px;
  }

  .detail__marcador-form {
    display: flex;
    gap: 8px;
  }

  .detail__marcador-form .detail__busca {
    flex: 1;
  }

  .detail__marcador-confirmar {
    min-height: 44px;
    padding: 0 14px;
    border-radius: 8px;
    border: 1px solid var(--acento);
    background: none;
    color: var(--acento);
  }
</style>
