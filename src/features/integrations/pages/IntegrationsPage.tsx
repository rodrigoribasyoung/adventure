import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { IntegrationCard } from '../components/IntegrationCard'
import { useIntegrations } from '../hooks/useIntegrations'
import { IntegrationConfig, IntegrationProvider } from '../types'
import { Toast } from '@/components/ui/Toast'
import { MetaAdsConnection } from '@/features/marketing/integrations/metaAds/components/MetaAdsConnection'
import { GoogleAdsConnection } from '@/features/marketing/integrations/googleAds/components/GoogleAdsConnection'
import { GoogleAnalyticsConnection } from '@/features/marketing/integrations/googleAnalytics/components/GoogleAnalyticsConnection'

const IntegrationsPage = () => {
  const { connections, loading } = useIntegrations()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  })

  const integrationConfigs: IntegrationConfig[] = [
    {
      provider: 'meta_ads',
      name: 'Meta Ads (Facebook Ads)',
      description: 'Conecte sua conta do Facebook Ads para analisar campanhas e métricas',
      icon: '📘',
      oauthUrl: '',
      requiredScopes: ['ads_read', 'ads_management'],
      isConnected: connections.some(c => c.provider === 'meta_ads'),
      connection: connections.find(c => c.provider === 'meta_ads'),
    },
    {
      provider: 'google_ads',
      name: 'Google Ads',
      description: 'Conecte sua conta do Google Ads para acompanhar performance de campanhas',
      icon: '🔵',
      oauthUrl: '',
      requiredScopes: ['https://www.googleapis.com/auth/adwords'],
      isConnected: connections.some(c => c.provider === 'google_ads'),
      connection: connections.find(c => c.provider === 'google_ads'),
    },
    {
      provider: 'google_analytics',
      name: 'Google Analytics',
      description: 'Conecte sua conta do Google Analytics para visualizar dados de tráfego',
      icon: '📊',
      oauthUrl: '',
      requiredScopes: ['https://www.googleapis.com/auth/analytics.readonly'],
      isConnected: connections.some(c => c.provider === 'google_analytics'),
      connection: connections.find(c => c.provider === 'google_analytics'),
    },
  ]

  const handleConnect = (provider: IntegrationProvider) => {
    // Esta função não é mais usada, cada componente de conexão gerencia seu próprio OAuth
    // Mantida para compatibilidade com IntegrationCard se necessário
  }

  return (
    <Container>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Integrações</h1>
          <p className="text-white/70">Conecte suas contas de marketing para análise e relatórios</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Meta Ads */}
          <div>
            <MetaAdsConnection
              onConnected={() => {
                setToast({ message: 'Meta Ads conectado com sucesso!', type: 'success', visible: true })
              }}
            />
          </div>

          {/* Google Ads */}
          <div>
            <GoogleAdsConnection
              onConnected={() => {
                setToast({ message: 'Google Ads conectado com sucesso!', type: 'success', visible: true })
              }}
            />
          </div>

          {/* Google Analytics */}
          <div>
            <GoogleAnalyticsConnection
              onConnected={() => {
                setToast({ message: 'Google Analytics conectado com sucesso!', type: 'success', visible: true })
              }}
            />
          </div>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </Container>
  )
}

export default IntegrationsPage

