<script lang="ts">
  import { musicasStore } from '../data/musicasStore.svelte'
  import { lotesStore } from '../data/lotesStore.svelte'
  import { planejarImportacao, type PoliticaDuplicata } from '../import/duplicatas'
  import { detectarCifra } from '../cifra/detectarCifra'
  import type { BlocoParseado } from '../parser/parseBlock'

  let {
    blocos,
    onCancelar,
    onImportado,
  }: {
    blocos: BlocoParseado[]
    onCancelar: () => void
    onImportado: (loteId: string, quantidadeCriada: number) => void
  } = $props()

  let politica = $state<PoliticaDuplicata>('pular')
  let confirmando = $state(false)

  const plano = $derived(planejarImportacao(blocos, musicasStore.list, politica))
  const totalDuplicatas = $derived(plano.substituir.length + plano.pulados.length)

  function primeirasLinhas(letra: string): string {
    const linha = letra.split('\n').find((l) => l.trim() !== '')
    return linha ?? ''
  }

  function situacaoDoBloco(bloco: BlocoParseado): 'nova' | 'substituir' | 'pular' {
    if (plano.substituir.some((s) => s.bloco === bloco)) return 'substituir'
    if (plano.pulados.includes(bloco)) return 'pular'
    return 'nova'
  }

  async function confirmar() {
    confirmando = true
    const idsCriados: string[] = []

    for (const bloco of plano.criar) {
      const musica = await musicasStore.create({ titulo: bloco.titulo, letra: bloco.letra })
      idsCriados.push(musica.id)
    }
    for (const { musicaId, bloco } of plano.substituir) {
      // Reimportação redeteca cifrada (prompt.md §6: o flag corrigido
      // manualmente se perde no round-trip do .txt de propósito).
      await musicasStore.update(musicaId, {
        titulo: bloco.titulo,
        letra: bloco.letra,
        cifrada: detectarCifra(bloco.letra),
      })
    }

    confirmando = false

    if (idsCriados.length > 0) {
      const lote = await lotesStore.create(idsCriados)
      onImportado(lote.id, idsCriados.length)
    } else {
      onImportado('', 0)
    }
  }
</script>

<div class="revisao">
  <div class="revisao__topbar">
    <button class="revisao__cancelar" onclick={onCancelar}>‹ Cancelar</button>
    <span class="revisao__contagem">{blocos.length} música{blocos.length === 1 ? '' : 's'} encontrada{blocos.length === 1 ? '' : 's'}</span>
    <button class="revisao__confirmar" onclick={confirmar} disabled={confirmando}>Confirmar</button>
  </div>

  {#if totalDuplicatas > 0}
    <div class="revisao__politica">
      <span>{totalDuplicatas} já existem no acervo (mesmo título). O que fazer com elas?</span>
      <div class="revisao__opcoes">
        <label>
          <input type="radio" name="politica" value="pular" bind:group={politica} />
          Pular os repetidos
        </label>
        <label>
          <input type="radio" name="politica" value="substituir" bind:group={politica} />
          Substituir
        </label>
        <label>
          <input type="radio" name="politica" value="importar-mesmo-assim" bind:group={politica} />
          Importar mesmo assim
        </label>
      </div>
    </div>
  {/if}

  <ul class="revisao__lista">
    {#each blocos as bloco (bloco)}
      {@const situacao = situacaoDoBloco(bloco)}
      <li class="revisao__item">
        <div class="revisao__item-cabecalho">
          <span class="revisao__item-titulo">{bloco.titulo || '(sem título)'}</span>
          {#if situacao === 'substituir'}
            <span class="revisao__badge">será substituída</span>
          {:else if situacao === 'pular'}
            <span class="revisao__badge">será pulada</span>
          {/if}
        </div>
        {#if bloco.letra.trim() === ''}
          <p class="revisao__aviso">Sem letra — vai ser criada assim mesmo, edite depois.</p>
        {:else}
          <p class="revisao__preview">{primeirasLinhas(bloco.letra)}</p>
        {/if}
      </li>
    {/each}
  </ul>
</div>

<style>
  .revisao {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .revisao__topbar {
    flex: 0 0 auto;
    min-height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 0 8px;
    border-bottom: 1px solid var(--borda);
  }

  .revisao__cancelar,
  .revisao__confirmar {
    min-height: 44px;
    padding: 0 12px;
    background: none;
    border: none;
    font-size: 16px;
  }

  .revisao__cancelar {
    color: var(--texto-fraco);
  }

  .revisao__confirmar {
    color: var(--acento);
    font-weight: 600;
  }

  .revisao__confirmar:disabled {
    color: var(--texto-fraco);
  }

  .revisao__contagem {
    color: var(--texto-fraco);
    font-size: 14px;
  }

  .revisao__politica {
    flex: 0 0 auto;
    padding: 12px 16px;
    border-bottom: 1px solid var(--borda);
    background: var(--superficie);
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 14px;
    color: var(--texto-fraco);
  }

  .revisao__opcoes {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    color: var(--texto);
  }

  .revisao__opcoes label {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .revisao__lista {
    flex: 1;
    overflow-y: auto;
    list-style: none;
    margin: 0;
    padding: 8px 16px;
  }

  .revisao__item {
    padding: 12px 0;
    border-bottom: 1px solid var(--borda);
  }

  .revisao__item-cabecalho {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .revisao__item-titulo {
    font-size: 17px;
    font-weight: 600;
  }

  .revisao__badge {
    flex: 0 0 auto;
    font-size: 12px;
    color: var(--texto-fraco);
    border: 1px solid var(--borda);
    border-radius: 999px;
    padding: 2px 8px;
  }

  .revisao__preview,
  .revisao__aviso {
    margin: 4px 0 0;
    font-size: 14px;
    color: var(--texto-fraco);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .revisao__aviso {
    color: var(--acento);
  }
</style>
