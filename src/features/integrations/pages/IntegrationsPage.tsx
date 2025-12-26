import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { Toast } from '@/components/ui/Toast'
import { MetaAdsConnection } from '@/features/marketing/integrations/metaAds/components/MetaAdsConnection'
import { GoogleAdsConnection } from '@/features/marketing/integrations/googleAds/components/GoogleAdsConnection'
import { GoogleAnalyticsConnection } from '@/features/marketing/integrations/googleAnalytics/components/GoogleAnalyticsConnection'

const IntegrationsPage = () => {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  })

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

