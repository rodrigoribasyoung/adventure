import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useMetaAds } from '../hooks/useMetaAds'
import { formatCurrency } from '@/lib/utils/formatCurrency'

export const MetaAdsDashboard = () => {
  const { accounts, campaigns, metrics, selectedAccountId, setSelectedAccountId, loading, refetchMetrics } = useMetaAds()
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])

  const handleDateChange = () => {
    if (selectedAccountId && startDate && endDate) {
      refetchMetrics(startDate, endDate)
    }
  }

  if (loading && !metrics) {
    return (
      <Card>
        <div className="p-8 text-center">
          <div className="text-white/70">Carregando dados do Meta Ads...</div>
        </div>
      </Card>
    )
  }

  if (!metrics) {
    return (
      <Card>
        <div className="p-8 text-center">
          <div className="text-white/70">Conecte sua conta do Meta Ads para ver métricas</div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <div className="p-4 space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">Filtros</h3>
          
          {accounts.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Conta
              </label>
              <select
                value={selectedAccountId || ''}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50"
              >
                {accounts.map(account => (
                  <option key={account.account_id} value={account.account_id}>
                    {account.name} ({account.account_id})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Data Início"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="Data Fim"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <Button variant="primary-red" onClick={handleDateChange}>
            Aplicar Filtros
          </Button>
        </div>
      </Card>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="elevated">
          <div className="p-4">
            <p className="text-sm text-white/70 mb-1">Gasto Total</p>
            <p className="text-2xl font-bold text-primary-red">
              {formatCurrency(metrics.spend, 'BRL')}
            </p>
          </div>
        </Card>

        <Card variant="elevated">
          <div className="p-4">
            <p className="text-sm text-white/70 mb-1">Impressões</p>
            <p className="text-2xl font-bold text-white">
              {metrics.impressions.toLocaleString('pt-BR')}
            </p>
          </div>
        </Card>

        <Card variant="elevated">
          <div className="p-4">
            <p className="text-sm text-white/70 mb-1">Cliques</p>
            <p className="text-2xl font-bold text-white">
              {metrics.clicks.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-white/60 mt-1">CTR: {metrics.ctr.toFixed(2)}%</p>
          </div>
        </Card>

        <Card variant="elevated">
          <div className="p-4">
            <p className="text-sm text-white/70 mb-1">CPC</p>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(metrics.cpc, 'BRL')}
            </p>
            <p className="text-xs text-white/60 mt-1">CPM: {formatCurrency(metrics.cpm, 'BRL')}</p>
          </div>
        </Card>
      </div>

      {/* Campanhas */}
      {campaigns.length > 0 && (
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Campanhas</h3>
            <div className="space-y-2">
              {campaigns.slice(0, 10).map(campaign => (
                <div key={campaign.id} className="flex items-center justify-between py-2 border-b border-white/10">
                  <div>
                    <p className="text-white font-medium">{campaign.name}</p>
                    <p className="text-sm text-white/70">{campaign.status} • {campaign.objective}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

