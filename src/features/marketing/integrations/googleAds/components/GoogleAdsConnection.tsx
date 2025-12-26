import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { OAuthButton } from '@/features/integrations/components/OAuthButton'
import { useIntegrations } from '@/features/integrations/hooks/useIntegrations'
import { generateGoogleAdsAuthUrl, exchangeCodeForToken, GOOGLE_ADS_OAUTH_CONFIG } from '../oauth'
import { prepareConnectionForStorage } from '@/lib/integrations/storage'
import { Timestamp } from 'firebase/firestore'

interface GoogleAdsConnectionProps {
  onConnected?: () => void
}

export const GoogleAdsConnection = ({ onConnected }: GoogleAdsConnectionProps) => {
  const { connections, createConnection, deleteConnection } = useIntegrations('google_ads')
  const [connecting, setConnecting] = useState(false)

  const connection = connections[0]

  const handleConnect = async (code: string) => {
    try {
      setConnecting(true)
      
      // Trocar código por token
      const tokenData = await exchangeCodeForToken(code)
      
      // Buscar informações da conta (simplificado - em produção, buscar dados reais)
      const accountId = 'me' // Simplificado - em produção, buscar accountId real
      const accountName = 'Minha Conta Google Ads' // Simplificado
      
      // Criar conexão
      const connectionData = prepareConnectionForStorage({
        provider: 'google_ads',
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: tokenData.expires_in 
          ? Timestamp.fromMillis(Date.now() + tokenData.expires_in * 1000)
          : undefined,
        connectedAt: Timestamp.now(),
        accountId,
        accountName,
        userId: '', // Será preenchido no hook
        metadata: {},
      })
      
      await createConnection(connectionData)
      onConnected?.()
    } catch (error: any) {
      console.error('Erro ao conectar Google Ads:', error)
      throw error
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (connection) {
      try {
        await deleteConnection(connection.id)
      } catch (error: any) {
        console.error('Erro ao desconectar Google Ads:', error)
        throw error
      }
    }
  }

  if (connection) {
    return (
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Google Ads Conectado</h3>
              <p className="text-sm text-white/70">{connection.accountName}</p>
            </div>
            <Button variant="ghost" onClick={handleDisconnect}>
              Desconectar
            </Button>
          </div>
          <p className="text-sm text-white/60">
            Conectado em {connection.connectedAt.toDate().toLocaleDateString('pt-BR')}
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="p-6">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">🔵</div>
          <h3 className="text-lg font-semibold text-white mb-1">Google Ads</h3>
          <p className="text-sm text-white/70">
            Conecte sua conta do Google Ads para acompanhar performance de campanhas
          </p>
        </div>
        <OAuthButton
          provider="google_ads"
          clientId={GOOGLE_ADS_OAUTH_CONFIG.clientId}
          redirectUri={GOOGLE_ADS_OAUTH_CONFIG.redirectUri}
          scope={GOOGLE_ADS_OAUTH_CONFIG.scope}
          authUrl={GOOGLE_ADS_OAUTH_CONFIG.authUrl}
          onSuccess={handleConnect}
          className="w-full"
        >
          Conectar Google Ads
        </OAuthButton>
      </div>
    </Card>
  )
}

