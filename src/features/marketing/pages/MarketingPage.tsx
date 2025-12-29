import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MetaAdsConnection } from '../integrations/metaAds/components/MetaAdsConnection'
import { MetaAdsDashboard } from '../integrations/metaAds/components/MetaAdsDashboard'
import { GoogleAdsConnection } from '../integrations/googleAds/components/GoogleAdsConnection'
import { GoogleAdsDashboard } from '../integrations/googleAds/components/GoogleAdsDashboard'
import { GoogleAnalyticsConnection } from '../integrations/googleAnalytics/components/GoogleAnalyticsConnection'
import { GoogleAnalyticsDashboard } from '../integrations/googleAnalytics/components/GoogleAnalyticsDashboard'
import { useIntegrations } from '@/features/integrations/hooks/useIntegrations'
import { Link } from 'react-router-dom'
import { FiBarChart2 } from 'react-icons/fi'

const MarketingPage = () => {
  const { connections: metaAdsConnections } = useIntegrations('meta_ads')
  const { connections: googleAdsConnections } = useIntegrations('google_ads')
  const { connections: gaConnections } = useIntegrations('google_analytics')

  const metaAdsConnected = metaAdsConnections.length > 0
  const googleAdsConnected = googleAdsConnections.length > 0
  const gaConnected = gaConnections.length > 0

  const hasAnyConnection = metaAdsConnected || googleAdsConnected || gaConnected

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Marketing</h1>
            <p className="text-white/70">Análise e relatórios de campanhas de marketing</p>
          </div>
          <Link to="/settings/integrations">
            <Button variant="primary-red">Gerenciar Integrações</Button>
          </Link>
        </div>

        {!hasAnyConnection ? (
          <Card>
            <div className="p-12 text-center">
              <div className="mb-4 flex justify-center">
                <FiBarChart2 className="w-16 h-16 text-primary-red" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">Conecte suas contas de marketing</h2>
              <p className="text-white/70 mb-6">
                Conecte suas contas do Meta Ads, Google Ads ou Google Analytics para começar a analisar suas campanhas
              </p>
              <Link to="/settings/integrations">
                <Button variant="primary-red">Ir para Integrações</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Meta Ads */}
            {metaAdsConnected ? (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Meta Ads (Facebook Ads)</h2>
                <MetaAdsDashboard />
              </div>
            ) : (
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Meta Ads (Facebook Ads)</h2>
                  <MetaAdsConnection />
                </div>
              </Card>
            )}

            {/* Google Ads */}
            {googleAdsConnected ? (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Google Ads</h2>
                <GoogleAdsDashboard />
              </div>
            ) : (
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Google Ads</h2>
                  <GoogleAdsConnection />
                </div>
              </Card>
            )}

            {/* Google Analytics */}
            {gaConnected ? (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Google Analytics</h2>
                <GoogleAnalyticsDashboard />
              </div>
            ) : (
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Google Analytics</h2>
                  <GoogleAnalyticsConnection />
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </Container>
  )
}

export default MarketingPage

