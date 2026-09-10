<script lang="ts">
  import { onDestroy, onMount } from 'svelte'

  let { onVoltar }: { onVoltar: () => void } = $props()

  const TECLAS_RECONHECIDAS: Record<string, string> = {
    ArrowRight: 'seta direita (avançar)',
    ArrowLeft: 'seta esquerda (voltar)',
    ' ': 'espaço (avançar)',
  }

  let ultimaTecla = $state<string | null>(null)
  let reconhecida = $state(false)

  function handleKeydown(event: KeyboardEvent) {
    ultimaTecla = event.key === ' ' ? 'Espaço' : event.key
    reconhecida = event.key in TECLAS_RECONHECIDAS
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
</script>

<div class="teste">
  <button class="teste__voltar" onclick={onVoltar}>‹ Voltar</button>

  <div class="teste__corpo">
    <h1>Teste de pedal</h1>
    <p>
      Pise no pedal (ou aperte espaço, seta esquerda ou seta direita no teclado) pra
      confirmarmos que ele funciona com o modo palco.
    </p>

    <div class="teste__resultado" class:teste__resultado--ok={reconhecida}>
      {#if ultimaTecla === null}
        <span>Aguardando…</span>
      {:else if reconhecida}
        <span>✓ Reconhecida: {TECLAS_RECONHECIDAS[ultimaTecla === 'Espaço' ? ' ' : ultimaTecla]}</span>
      {:else}
        <span>Tecla "{ultimaTecla}" não é usada pelo modo palco.</span>
      {/if}
    </div>
  </div>
</div>

<style>
  .teste {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--fundo);
    color: var(--texto);
  }

  .teste__voltar {
    flex: 0 0 auto;
    min-height: 56px;
    padding: 0 16px;
    background: none;
    border: none;
    color: var(--texto-fraco);
    font-size: 16px;
    text-align: left;
  }

  .teste__corpo {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 24px;
    text-align: center;
  }

  .teste__corpo h1 {
    font-size: 22px;
    margin: 0;
  }

  .teste__corpo p {
    color: var(--texto-fraco);
    max-width: 40ch;
    margin: 0;
  }

  .teste__resultado {
    margin-top: 16px;
    padding: 16px 24px;
    border-radius: 12px;
    border: 1px solid var(--borda);
    background: var(--superficie);
    font-size: 18px;
  }

  .teste__resultado--ok {
    border-color: var(--sucesso);
    color: var(--sucesso);
  }
</style>
