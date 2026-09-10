<script lang="ts">
  import { musicasStore } from '../data/musicasStore.svelte'
  import { iniciarImportacao } from '../import/iniciarImportacao'
  import type { BlocoParseado } from '../parser/parseBlock'

  let {
    onCancelar,
    onSalvo,
    onRevisao,
    onLegado,
  }: {
    onCancelar: () => void
    onSalvo: () => void
    onRevisao: (blocos: BlocoParseado[]) => void
    onLegado: (textoOriginal: string) => void
  } = $props()

  let texto = $state('')
  let mensagem = $state('')
  let processando = $state(false)

  async function processar() {
    mensagem = ''
    const resultado = iniciarImportacao(texto, { forcarRevisao: false })

    if (resultado.tipo === 'vazio') {
      mensagem = 'Cole uma letra antes de continuar.'
      return
    }
    if (resultado.tipo === 'legado') {
      onLegado(resultado.textoOriginal)
      return
    }
    if (resultado.tipo === 'revisao') {
      onRevisao(resultado.blocos)
      return
    }

    // bloco-unico (prompt.md §8.2): salva direto, sem passar por revisão.
    processando = true
    await musicasStore.create({ titulo: resultado.bloco.titulo, letra: resultado.bloco.letra })
    processando = false
    onSalvo()
  }
</script>

<div class="colar">
  <div class="colar__topbar">
    <button class="colar__cancelar" onclick={onCancelar}>‹ Cancelar</button>
    <span class="colar__titulo">Colar letra</span>
    <button class="colar__salvar" onclick={processar} disabled={processando}>Adicionar</button>
  </div>

  <textarea
    class="colar__campo"
    bind:value={texto}
    placeholder="Cole a letra aqui. A primeira linha é o título. Pra colar várias músicas de uma vez, separe cada uma com /END numa linha sozinha."
  ></textarea>

  {#if mensagem}
    <p class="colar__mensagem">{mensagem}</p>
  {/if}
</div>

<style>
  .colar {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .colar__topbar {
    flex: 0 0 auto;
    min-height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 0 8px;
    border-bottom: 1px solid var(--borda);
  }

  .colar__cancelar,
  .colar__salvar {
    min-height: 44px;
    padding: 0 12px;
    background: none;
    border: none;
    font-size: 16px;
  }

  .colar__cancelar {
    color: var(--texto-fraco);
  }

  .colar__salvar {
    color: var(--acento);
    font-weight: 600;
  }

  .colar__salvar:disabled {
    color: var(--texto-fraco);
  }

  .colar__titulo {
    color: var(--texto-fraco);
    font-size: 14px;
  }

  .colar__campo {
    flex: 1;
    min-height: 0;
    resize: none;
    border: none;
    background: var(--fundo);
    color: var(--texto);
    font-family: var(--fonte-letra);
    font-size: 18px;
    line-height: 1.5;
    padding: 16px;
    white-space: pre-wrap;
  }

  .colar__campo:focus {
    outline: none;
  }

  .colar__mensagem {
    flex: 0 0 auto;
    padding: 8px 16px;
    color: var(--texto-fraco);
    font-size: 14px;
  }
</style>
