// Captura o evento beforeinstallprompt cedo (só dispara uma vez, e só se o
// listener já estiver registrado quando o navegador decidir disparar).
// Android/Chrome usam isso; iOS Safari não tem esse evento — o onboarding
// trata os dois casos separadamente.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let eventoCapturado: BeforeInstallPromptEvent | null = $state(null)

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault()
  eventoCapturado = event as BeforeInstallPromptEvent
})

window.addEventListener('appinstalled', () => {
  eventoCapturado = null
})

async function solicitar() {
  if (!eventoCapturado) return
  await eventoCapturado.prompt()
  eventoCapturado = null
}

export const installPromptStore = {
  get disponivel() {
    return eventoCapturado !== null
  },
  solicitar,
}

export function estaInstalado(): boolean {
  const standalone = window.matchMedia('(display-mode: standalone)').matches
  const iosStandalone = (navigator as unknown as { standalone?: boolean }).standalone === true
  return standalone || iosStandalone
}

export function ehIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}
