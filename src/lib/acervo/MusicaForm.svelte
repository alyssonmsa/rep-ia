<script lang="ts">
  import { untrack } from 'svelte'
  import { musicasStore } from '../data/musicasStore.svelte'
  import { setlistsStore } from '../data/setlistsStore.svelte'

  let { musicaId, onDone }: { musicaId: string; onDone: () => void } = $props()

  // Seed único no mount — o formulário não deve se resincronizar se a
  // música mudar em outro lugar enquanto o usuário está editando.
  const existente = untrack(() => musicasStore.list.find((m) => m.id === musicaId))

  let titulo = $state(existente?.titulo ?? '')
  let letra = $state(existente?.letra ?? '')

  async function salvar() {
    const tituloLimpo = titulo.trim()
    if (!tituloLimpo) return
    await musicasStore.update(musicaId, { titulo: tituloLimpo, letra })
    onDone()
  }

  async function excluir() {
    await setlistsStore.unlinkMusica(musicaId)
    await musicasStore.remove(musicaId)
    onDone()
  }
</script>

<div class="form">
  <div class="form__topbar">
    <button class="form__voltar" onclick={onDone}>‹ Cancelar</button>
    <span class="form__titulo">Editar música</span>
    <button class="form__salvar" onclick={salvar} disabled={!titulo.trim()}>Salvar</button>
  </div>

  <div class="form__campos">
    <label class="form__label" for="titulo">Título</label>
    <input id="titulo" class="form__input" type="text" bind:value={titulo} placeholder="Título da música" />

    <label class="form__label" for="letra">Letra</label>
    <textarea id="letra" class="form__textarea" bind:value={letra} placeholder="Cole ou digite a letra aqui"
    ></textarea>

    <button class="form__excluir" onclick={excluir}>Excluir música</button>
  </div>
</div>

<style>
  .form {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .form__topbar {
    flex: 0 0 auto;
    min-height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 0 8px;
    border-bottom: 1px solid var(--borda);
  }

  .form__voltar,
  .form__salvar {
    min-height: 44px;
    padding: 0 12px;
    background: none;
    border: none;
    font-size: 16px;
  }

  .form__voltar {
    color: var(--texto-fraco);
  }

  .form__salvar {
    color: var(--acento);
    font-weight: 600;
  }

  .form__salvar:disabled {
    color: var(--texto-fraco);
  }

  .form__titulo {
    color: var(--texto-fraco);
    font-size: 14px;
  }

  .form__campos {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px;
    min-height: 0;
  }

  .form__label {
    color: var(--texto-fraco);
    font-size: 14px;
  }

  .form__input,
  .form__textarea {
    border-radius: 8px;
    border: 1px solid var(--borda);
    background: var(--superficie);
    color: var(--texto);
    font-family: inherit;
    padding: 10px 12px;
    font-size: 16px;
  }

  .form__input {
    min-height: 44px;
  }

  .form__textarea {
    flex: 1;
    min-height: 0;
    resize: none;
    font-family: var(--fonte-letra);
    line-height: 1.5;
    white-space: pre-wrap;
  }

  .form__excluir {
    flex: 0 0 auto;
    min-height: 44px;
    border: 1px solid var(--borda);
    border-radius: 8px;
    background: none;
    color: var(--texto-fraco);
  }
</style>
