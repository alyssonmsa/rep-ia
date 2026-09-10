<script lang="ts">
  import { estaInstalado, ehIOS, installPromptStore } from '../pwa/installPrompt.svelte'
  import PedalTest from './PedalTest.svelte'

  let {
    onColarLetra,
    onArquivoTexto,
    onPular,
  }: {
    onColarLetra: () => void
    onArquivoTexto: (texto: string) => void
    onPular: () => void
  } = $props()

  let telaPedal = $state(false)
  let inputArquivo: HTMLInputElement | undefined = $state()

  const instalado = estaInstalado()
  const iOS = ehIOS()

  async function handleArquivoSelecionado(event: Event) {
    const input = event.currentTarget as HTMLInputElement
    const arquivo = input.files?.[0]
    input.value = ''
    if (!arquivo) return
    onArquivoTexto(await arquivo.text())
  }
</script>

{#if telaPedal}
  <PedalTest onVoltar={() => (telaPedal = false)} />
{:else}
  <div class="onboarding">
    <div class="onboarding__corpo">
      <h1 class="onboarding__titulo">Prompter</h1>
      <p class="onboarding__frase">
        Transforma qualquer celular ou tablet em painel de palco legível e controlável sem as
        mãos, funcionando offline, sem instalar app de loja.
      </p>

      {#if !instalado}
        <div class="onboarding__instalar">
          {#if iOS}
            <p class="onboarding__instalar-titulo">Instale na tela de início</p>
            <p class="onboarding__instalar-texto">
              No Safari, toque em <strong>Compartilhar</strong> e depois em
              <strong>Adicionar à Tela de Início</strong>. Isso é o que deixa o app em tela cheia
              no seu iPhone e evita que o navegador apague os dados depois de um tempo sem uso.
            </p>
          {:else if installPromptStore.disponivel}
            <p class="onboarding__instalar-titulo">Instale na tela de início</p>
            <p class="onboarding__instalar-texto">
              Sem instalar de loja nenhuma — o app fica no seu aparelho, funciona offline, e abre
              em tela cheia.
            </p>
            <button class="onboarding__botao" onclick={() => installPromptStore.solicitar()}>
              Instalar agora
            </button>
          {:else}
            <p class="onboarding__instalar-titulo">Instale na tela de início</p>
            <p class="onboarding__instalar-texto">
              Use o menu do seu navegador e procure "Instalar app" ou "Adicionar à tela de
              início" — assim o app abre em tela cheia e funciona offline.
            </p>
          {/if}
        </div>
      {/if}

      <button class="onboarding__link" onclick={() => (telaPedal = true)}>Testar pedal de virar página</button>
    </div>

    <div class="onboarding__rodape">
      <button class="onboarding__cta onboarding__cta--principal" onclick={onColarLetra}>
        Colar uma letra
      </button>
      <button class="onboarding__cta" onclick={() => inputArquivo?.click()}>Importar um arquivo</button>
      <input
        bind:this={inputArquivo}
        type="file"
        accept=".txt,text/plain"
        class="onboarding__input-arquivo"
        onchange={handleArquivoSelecionado}
      />
      <button class="onboarding__pular" onclick={onPular}>Pular</button>
    </div>
  </div>
{/if}

<style>
  .onboarding {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--fundo);
    color: var(--texto);
  }

  .onboarding__corpo {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    padding: 32px 24px;
    text-align: center;
  }

  .onboarding__titulo {
    font-size: 28px;
    margin: 0;
    color: var(--acento);
  }

  .onboarding__frase {
    max-width: 44ch;
    color: var(--texto-fraco);
    margin: 0;
    line-height: 1.5;
  }

  .onboarding__instalar {
    width: 100%;
    max-width: 44ch;
    border: 1px solid var(--borda);
    border-radius: 12px;
    background: var(--superficie);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .onboarding__instalar-titulo {
    margin: 0;
    font-weight: 600;
  }

  .onboarding__instalar-texto {
    margin: 0;
    color: var(--texto-fraco);
    font-size: 14px;
    line-height: 1.5;
  }

  .onboarding__botao {
    align-self: center;
    min-height: 44px;
    padding: 0 20px;
    border-radius: 8px;
    border: 1px solid var(--acento);
    background: none;
    color: var(--acento);
    font-weight: 600;
  }

  .onboarding__link {
    background: none;
    border: none;
    color: var(--texto-fraco);
    text-decoration: underline;
    font-size: 14px;
  }

  .onboarding__rodape {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px 24px calc(16px + env(safe-area-inset-bottom, 0px));
    border-top: 1px solid var(--borda);
  }

  .onboarding__cta {
    min-height: 48px;
    border-radius: 8px;
    border: 1px solid var(--borda);
    background: none;
    color: var(--texto);
    font-size: 16px;
  }

  .onboarding__cta--principal {
    border-color: var(--acento);
    color: var(--acento);
    font-weight: 600;
  }

  .onboarding__input-arquivo {
    display: none;
  }

  .onboarding__pular {
    margin-top: 4px;
    background: none;
    border: none;
    color: var(--texto-fraco);
    font-size: 14px;
  }
</style>
