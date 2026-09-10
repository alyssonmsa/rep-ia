<script lang="ts">
  import { temaStore, type Tema } from '../../theme.svelte'

  let {
    fontIndex,
    fontMaxIndex,
    onAumentarFonte,
    onDiminuirFonte,
    onFechar,
    modoAutoscroll,
    onAlternarAutoscroll,
    velocidadeIndex,
    velocidadeMaxIndex,
    onAumentarVelocidade,
    onDiminuirVelocidade,
  }: {
    fontIndex: number
    fontMaxIndex: number
    onAumentarFonte: () => void
    onDiminuirFonte: () => void
    onFechar: () => void
    modoAutoscroll: boolean
    onAlternarAutoscroll: () => void
    velocidadeIndex: number
    velocidadeMaxIndex: number
    onAumentarVelocidade: () => void
    onDiminuirVelocidade: () => void
  } = $props()

  const TEMAS: { valor: Tema; rotulo: string }[] = [
    { valor: 'escuro', rotulo: 'Escuro' },
    { valor: 'claro', rotulo: 'Claro' },
    { valor: 'classico', rotulo: 'Clássico' },
  ]
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="painel__fundo" onclick={onFechar}></div>

<div class="painel" role="dialog" aria-label="Ajustes de exibição">
  <div class="painel__secao">
    <span class="painel__rotulo">Tamanho da fonte</span>
    <div class="painel__botoes">
      <button onclick={onDiminuirFonte} disabled={fontIndex <= 0} aria-label="Diminuir fonte">A-</button>
      <button onclick={onAumentarFonte} disabled={fontIndex >= fontMaxIndex} aria-label="Aumentar fonte">A+</button>
    </div>
  </div>

  <div class="painel__secao">
    <span class="painel__rotulo">Tema</span>
    <div class="painel__botoes">
      {#each TEMAS as t (t.valor)}
        <button
          class="painel__tema"
          class:painel__tema--ativo={temaStore.atual === t.valor}
          onclick={() => temaStore.definir(t.valor)}
        >
          {t.rotulo}
        </button>
      {/each}
    </div>
  </div>

  <div class="painel__secao">
    <span class="painel__rotulo">Navegação</span>
    <div class="painel__botoes">
      <button class:painel__tema--ativo={!modoAutoscroll} onclick={() => modoAutoscroll && onAlternarAutoscroll()}>
        Estrofe
      </button>
      <button class:painel__tema--ativo={modoAutoscroll} onclick={() => !modoAutoscroll && onAlternarAutoscroll()}>
        Autoscroll
      </button>
    </div>
  </div>

  {#if modoAutoscroll}
    <div class="painel__secao">
      <span class="painel__rotulo">Velocidade</span>
      <div class="painel__botoes">
        <button onclick={onDiminuirVelocidade} disabled={velocidadeIndex <= 0} aria-label="Diminuir velocidade">
          −
        </button>
        <button
          onclick={onAumentarVelocidade}
          disabled={velocidadeIndex >= velocidadeMaxIndex}
          aria-label="Aumentar velocidade"
        >
          +
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .painel__fundo {
    position: absolute;
    inset: 0;
    z-index: 25;
    background: rgba(0, 0, 0, 0.4);
  }

  .painel {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 26;
    background: var(--superficie);
    border-top: 1px solid var(--borda);
    border-radius: 16px 16px 0 0;
    padding: 20px 16px calc(20px + env(safe-area-inset-bottom, 0px));
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .painel__secao {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .painel__rotulo {
    color: var(--texto-fraco);
    font-size: 14px;
  }

  .painel__botoes {
    display: flex;
    gap: 8px;
  }

  .painel__botoes button {
    min-width: 44px;
    min-height: 44px;
    padding: 0 12px;
    border-radius: 8px;
    border: 1px solid var(--borda);
    background: var(--superficie-alta);
    color: var(--texto);
    font-size: 15px;
  }

  .painel__botoes button:disabled {
    color: var(--texto-fraco);
    opacity: 0.6;
  }

  .painel__tema--ativo {
    border-color: var(--acento);
    color: var(--acento);
  }
</style>
