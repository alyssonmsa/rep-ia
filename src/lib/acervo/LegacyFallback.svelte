<script lang="ts">
  import { untrack } from 'svelte'

  let {
    textoOriginal,
    onCancelar,
    onContinuar,
  }: {
    textoOriginal: string
    onCancelar: () => void
    onContinuar: (textoEditado: string) => void
  } = $props()

  // Seed único: o campo não deve se resincronizar se `textoOriginal` mudar
  // (não muda de fato aqui, mas a intenção de "só na primeira vez" fica
  // explícita e evita o aviso do compilador sobre uso não-reativo).
  let texto = $state(untrack(() => textoOriginal))
  let campoEl: HTMLTextAreaElement | undefined = $state()

  function inserirEnd() {
    if (!campoEl) return
    const posicao = campoEl.selectionStart ?? texto.length
    const antes = texto.slice(0, posicao)
    const depois = texto.slice(posicao)
    const quebraAntes = antes === '' || antes.endsWith('\n') ? '' : '\n'
    const quebraDepois = depois === '' || depois.startsWith('\n') ? '' : '\n'
    const insercao = `${quebraAntes}/END\n${quebraDepois}`

    texto = antes + insercao + depois
    const novaPosicao = (antes + insercao).length

    requestAnimationFrame(() => {
      campoEl?.focus()
      campoEl?.setSelectionRange(novaPosicao, novaPosicao)
    })
  }
</script>

<div class="legado">
  <div class="legado__topbar">
    <button class="legado__cancelar" onclick={onCancelar}>‹ Cancelar</button>
    <span class="legado__titulo">Arquivo sem marcações</span>
    <button class="legado__continuar" onclick={() => onContinuar(texto)}>Continuar</button>
  </div>

  <p class="legado__instrucao">
    Este arquivo não tem marcações de fim de música. Coloque <code>/END</code> numa linha sozinha
    ao terminar cada letra, ou use o botão abaixo pra inserir no lugar onde o cursor estiver.
  </p>

  <div class="legado__acoes">
    <button class="legado__inserir" onclick={inserirEnd}>Inserir /END no cursor</button>
  </div>

  <textarea class="legado__campo" bind:this={campoEl} bind:value={texto}></textarea>
</div>

<style>
  .legado {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .legado__topbar {
    flex: 0 0 auto;
    min-height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 0 8px;
    border-bottom: 1px solid var(--borda);
  }

  .legado__cancelar,
  .legado__continuar {
    min-height: 44px;
    padding: 0 12px;
    background: none;
    border: none;
    font-size: 16px;
  }

  .legado__cancelar {
    color: var(--texto-fraco);
  }

  .legado__continuar {
    color: var(--acento);
    font-weight: 600;
  }

  .legado__titulo {
    color: var(--texto-fraco);
    font-size: 14px;
  }

  .legado__instrucao {
    flex: 0 0 auto;
    margin: 0;
    padding: 12px 16px;
    color: var(--texto-fraco);
    font-size: 14px;
    border-bottom: 1px solid var(--borda);
  }

  .legado__instrucao code {
    color: var(--texto);
    background: var(--superficie);
    padding: 1px 5px;
    border-radius: 4px;
  }

  .legado__acoes {
    flex: 0 0 auto;
    padding: 8px 16px;
    border-bottom: 1px solid var(--borda);
  }

  .legado__inserir {
    min-height: 44px;
    padding: 0 14px;
    border-radius: 8px;
    border: 1px solid var(--acento);
    background: none;
    color: var(--acento);
    font-size: 15px;
  }

  .legado__campo {
    flex: 1;
    min-height: 0;
    resize: none;
    border: none;
    background: var(--fundo);
    color: var(--texto);
    font-family: var(--fonte-letra);
    font-size: 16px;
    line-height: 1.5;
    padding: 16px;
    white-space: pre-wrap;
  }

  .legado__campo:focus {
    outline: none;
  }
</style>
