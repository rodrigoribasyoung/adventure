import { Card } from '@/components/ui/Card'
import { useGoogleAds } from '../hooks/useGoogleAds'
import { formatCurrency } from '@/lib/utils/formatCurrency'

interface GoogleAdsDashboardProps {
  customerId?: string
}

export const GoogleAdsDashboard = ({ customerId }: GoogleAdsDashboardProps) => {
  const { campaigns, metrics, loading, error } = useGoogleAds(customerId)

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <div className="p-6 animate-pulse">
              <div className="h-6 bg-white/10 rounded mb-4 w-1/3" />
              <div className="h-4 bg-white/5 rounded w-1/2" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <div className="p-6 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </Card>
    )
  }

  const totalMetrics = Object.values(metrics).reduce(
    (acc, metric) => ({
      impressions: acc.impressions + metric.impressions,
      clicks: acc.clicks + metric.clicks,
      cost: acc.cost + metric.cost,
      conversions: (acc.conversions || 0) + (metric.conversions || 0),
    }),
    { impressions: 0, clicks: 0, cost: 0, conversions: 0 }
  )

  const averageCpc = totalMetrics.clicks > 0 ? totalMetrics.cost / totalMetrics.clicks : 0
  const ctr = totalMetrics.impressions > 0 ? (totalMetrics.clicks / totalMetrics.impressions) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <p className="text-sm text-white/70 mb-1">Gasto Total</p>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(totalMetrics.cost / 1000000)} {/* Converter de micros */}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-white/70 mb-1">Impressões</p>
            <p className="text-2xl font-bold text-white">{totalMetrics.impressions.toLocaleString('pt-BR')}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-white/70 mb-1">Cliques</p>
            <p className="text-2xl font-bold text-white">{totalMetrics.clicks.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-white/60 mt-1">CTR: {ctr.toFixed(2)}%</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-white/70 mb-1">CPC Médio</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(averageCpc / 1000000)}</p>
          </div>
        </Card>
      </div>

      {/* Lista de campanhas */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Campanhas</h3>
          {campaigns.length === 0 ? (
            <p className="text-white/70 text-center py-8">Nenhuma campanha encontrada</p>
          ) : (
            <div className="space-y-3">
              {campaigns.map((campaign) => {
                const campaignMetrics = metrics[campaign.id] || {
                  impressions: 0,
                  clicks: 0,
                  cost: 0,
                  conversions: 0,
                }
                const campaignCtr =
                  campaignMetrics.impressions > 0
                    ? (campaignMetrics.clicks / campaignMetrics.impressions) * 100
                    : 0

                return (
                  <div
                    key={campaign.id}
                    className="p-4 bg-white/5 border border-white/10 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-white">{campaign.name}</h4>
                        <p className="text-sm text-white/60">{campaign.status}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">
                          {formatCurrency(campaignMetrics.cost / 1000000)}
                        </p>
                        <p className="text-xs text-white/60">
                          {campaignMetrics.clicks} cliques • CTR: {campaignCtr.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

