/**
 * Screen Wake Lock API is released automatically when the tab loses
 * visibility, so it must be re-acquired on `visibilitychange` (prompt.md §4).
 * If the API doesn't exist, callers must warn the user instead of failing
 * silently — that's exposed via `supported`.
 */
export function createWakeLockController() {
  const supported = 'wakeLock' in navigator
  let sentinel: WakeLockSentinel | null = null

  async function acquire() {
    if (!supported) return
    try {
      sentinel = await navigator.wakeLock.request('screen')
      sentinel.addEventListener('release', () => {
        sentinel = null
      })
    } catch {
      sentinel = null
    }
  }

  function release() {
    sentinel?.release()
    sentinel = null
  }

  function handleVisibilityChange() {
    if (document.visibilityState === 'visible' && sentinel === null) {
      void acquire()
    }
  }

  function start() {
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return acquire()
  }

  function stop() {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    release()
  }

  return { supported, start, stop }
}
