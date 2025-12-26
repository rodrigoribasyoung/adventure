/**
 * Registra o Service Worker para PWA
 */
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registrado com sucesso:', registration.scope)

          // Verificar atualizações periodicamente
          setInterval(() => {
            registration.update()
          }, 60 * 60 * 1000) // A cada 1 hora

          // Detectar quando uma nova versão está disponível
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Nova versão disponível
                  console.log('[PWA] Nova versão disponível!')
                  // Aqui você pode mostrar uma notificação ao usuário
                  if (confirm('Nova versão disponível! Deseja atualizar?')) {
                    window.location.reload()
                  }
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error('[PWA] Erro ao registrar Service Worker:', error)
        })
    })
  }
}

/**
 * Solicita permissão e instala o PWA
 */
export const installPWA = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready
      
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        // Mostrar prompt de instalação (se disponível)
        return true
      }
      
      return false
    } catch (error) {
      console.error('[PWA] Erro ao instalar:', error)
      return false
    }
  }
  return false
}

