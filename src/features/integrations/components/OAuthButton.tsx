import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { generateOAuthUrl, openOAuthPopup, generateState } from '@/lib/integrations/oauth'

interface OAuthButtonProps {
  provider: 'meta_ads' | 'google_ads' | 'google_analytics'
  clientId: string
  redirectUri: string
  scope: string
  authUrl: string
  onSuccess: (code: string) => Promise<void>
  onError?: (error: string) => void
  className?: string
  children?: React.ReactNode
}

export const OAuthButton = ({
  provider,
  clientId,
  redirectUri,
  scope,
  authUrl,
  onSuccess,
  onError,
  className,
  children,
}: OAuthButtonProps) => {
  const [connecting, setConnecting] = useState(false)

  const handleConnect = async () => {
    try {
      setConnecting(true)
      
      const state = generateState()
      sessionStorage.setItem(`oauth_state_${provider}`, state)
      
      const oauthUrl = generateOAuthUrl(authUrl, {
        clientId,
        redirectUri,
        scope,
        state,
      })

      const code = await openOAuthPopup(oauthUrl)
      
      if (code) {
        sessionStorage.removeItem(`oauth_state_${provider}`)
        await onSuccess(code)
      } else {
        onError?.('Conexão cancelada ou falhou')
      }
    } catch (error: any) {
      onError?.(error.message || 'Erro ao conectar')
    } finally {
      setConnecting(false)
    }
  }

  return (
    <Button
      variant="primary-red"
      onClick={handleConnect}
      disabled={connecting}
      className={className}
    >
      {connecting ? 'Conectando...' : children || 'Conectar'}
    </Button>
  )
}

