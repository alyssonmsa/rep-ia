<script lang="ts">
  import { musicasStore } from '../data/musicasStore.svelte'
  import { normalizarBusca } from '../data/normalize'

  let {
    onOpenMusica,
    onColarLetra,
    onArquivoTexto,
    onExportar,
  }: {
    onOpenMusica: (id: string) => void
    onColarLetra: () => void
    onArquivoTexto: (texto: string) => void
    onExportar: () => void
  } = $props()

  let busca = $state('')
  let inputArquivo: HTMLInputElement | undefined = $state()

  const musicasFiltradas = $derived.by(() => {
    const termo = normalizarBusca(busca)
    const lista = termo
      ? musicasStore.list.filter((m) => normalizarBusca(m.titulo).includes(termo))
      : musicasStore.list
    return [...lista].sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR', { sensitivity: 'base' }))
  })

  async function handleArquivoSelecionado(event: Event) {
    const input = event.currentTarget as HTMLInputElement
    const arquivo = input.files?.[0]
    input.value = ''
    if (!arquivo) return
    const texto = await arquivo.text()
    onArquivoTexto(texto)
  }
</script>

<div class="acervo">
  <div class="acervo__header">
    <input
      class="acervo__busca"
      type="search"
      placeholder="Buscar música…"
      bind:value={busca}
      aria-label="Buscar música"
    />
    <div class="acervo__acoes">
      <button class="acervo__acao" onclick={onColarLetra}>Colar letra</button>
      <button class="acervo__acao" onclick={() => inputArquivo?.click()}>Importar arquivo</button>
      {#if musicasStore.list.length > 0}
        <button class="acervo__acao" onclick={onExportar}>Exportar</button>
      {/if}
    </div>
    <input
      bind:this={inputArquivo}
      type="file"
      accept=".txt,text/plain"
      class="acervo__input-arquivo"
      onchange={handleArquivoSelecionado}
    />
  </div>

  {#if musicasStore.list.length === 0}
    <div class="acervo__vazio">
      <p>Você ainda não tem nenhuma música no acervo.</p>
      <button class="acervo__acao" onclick={onColarLetra}>Colar a primeira letra</button>
    </div>
  {:else if musicasFiltradas.length === 0}
    <p class="acervo__sem-resultado">Nenhuma música encontrada pra "{busca}".</p>
  {:else}
    <ul class="acervo__lista">
      {#each musicasFiltradas as musica (musica.id)}
        <li>
          <button class="acervo__item" onclick={() => onOpenMusica(musica.id)}>
            {musica.titulo}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .acervo {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 16px;
    gap: 16px;
  }

  .acervo__header {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 0 0 auto;
  }

  .acervo__busca {
    min-height: 44px;
    padding: 0 12px;
    border-radius: 8px;
    border: 1px solid var(--borda);
    background: var(--superficie);
    color: var(--texto);
    font-size: 16px;
  }

  .acervo__acoes {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .acervo__acao {
    min-height: 44px;
    padding: 0 14px;
    border-radius: 8px;
    border: 1px solid var(--acento);
    background: none;
    color: var(--acento);
    font-size: 15px;
    white-space: nowrap;
  }

  .acervo__acao:active {
    background: var(--superficie-alta);
  }

  .acervo__input-arquivo {
    display: none;
  }

  .acervo__vazio {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    color: var(--texto-fraco);
    text-align: center;
  }

  .acervo__sem-resultado {
    color: var(--texto-fraco);
  }

  .acervo__lista {
    list-style: none;
    margin: 0;
    padding: 0;
    overflow-y: auto;
    flex: 1;
  }

  .acervo__item {
    width: 100%;
    min-height: 56px;
    display: flex;
    align-items: center;
    background: none;
    border: none;
    border-bottom: 1px solid var(--borda);
    padding: 0 8px;
    font-size: 18px;
    text-align: left;
    color: var(--texto);
  }

  .acervo__item:active {
    background: var(--superficie);
  }
</style>
