import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      // Previne o prompt automático do navegador
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Verifica se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    // Mostra o prompt de instalação
    deferredPrompt.prompt()

    // Espera pela escolha do usuário
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('[PWA] Usuário aceitou a instalação')
    } else {
      console.log('[PWA] Usuário rejeitou a instalação')
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Salvar preferência do usuário (opcional)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  // Verificar se o usuário já dispensou anteriormente
  useEffect(() => {
    if (localStorage.getItem('pwa-install-dismissed') === 'true') {
      setShowPrompt(false)
    }
  }, [])

  if (!showPrompt || !deferredPrompt) {
    return null
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 max-w-sm shadow-2xl border-primary-red/30">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">📱</div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">Instalar Adventure CRM</h3>
            <p className="text-sm text-white/70 mb-3">
              Instale o app para acesso rápido e uso offline
            </p>
            <div className="flex gap-2">
              <Button
                variant="primary-red"
                size="sm"
                onClick={handleInstall}
                className="flex-1"
              >
                Instalar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
              >
                Agora não
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

