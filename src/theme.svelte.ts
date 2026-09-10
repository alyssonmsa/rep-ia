import { untrack } from 'svelte'

export type Tema = 'escuro' | 'claro' | 'classico'

const CHAVE_LOCALSTORAGE = 'prompter:tema'

function lerTemaSalvo(): Tema {
  try {
    const salvo = localStorage.getItem(CHAVE_LOCALSTORAGE)
    if (salvo === 'escuro' || salvo === 'claro' || salvo === 'classico') return salvo
  } catch {
    // localStorage indisponível (ex.: modo privado) — usa o padrão.
  }
  return 'escuro'
}

// Preferência global de exibição do aparelho (prompt.md §9), não dado do
// usuário — fica em localStorage, não no IndexedDB/backup.
let tema = $state<Tema>(lerTemaSalvo())
document.documentElement.setAttribute('data-tema', untrack(() => tema))

function definir(valor: Tema) {
  tema = valor
  document.documentElement.setAttribute('data-tema', valor)
  try {
    localStorage.setItem(CHAVE_LOCALSTORAGE, valor)
  } catch {
    // sem persistência disponível — só não sobrevive ao reload.
  }
}

export const temaStore = {
  get atual() {
    return tema
  },
  definir,
}
