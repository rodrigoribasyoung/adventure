import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
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
            {metrics.conversions && metrics.conversions > 0 && (
              <p className="text-xs text-white/60 mt-1">
                {metrics.conversions} conversões • CPL: {formatCurrency(metrics.spend / metrics.conversions, 'BRL')}
              </p>
            )}
          </div>
        </Card>

        <Card variant="elevated">
          <div className="p-4">
            <p className="text-sm text-white/70 mb-1">Alcance</p>
            <p className="text-2xl font-bold text-white">
              {metrics.reach?.toLocaleString('pt-BR') || 'N/A'}
            </p>
            {metrics.reach && metrics.impressions > 0 && (
              <p className="text-xs text-white/60 mt-1">
                Frequência: {(metrics.impressions / metrics.reach).toFixed(2)}x
              </p>
            )}
          </div>
        </Card>

        <Card variant="elevated">
          <div className="p-4">
            <p className="text-sm text-white/70 mb-1">Impressões</p>
            <p className="text-2xl font-bold text-white">
              {metrics.impressions.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-white/60 mt-1">CTR: {metrics.ctr.toFixed(2)}%</p>
          </div>
        </Card>

        <Card variant="elevated">
          <div className="p-4">
            <p className="text-sm text-white/70 mb-1">Cliques</p>
            <p className="text-2xl font-bold text-white">
              {metrics.clicks.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-white/60 mt-1">CPC: {formatCurrency(metrics.cpc, 'BRL')}</p>
          </div>
        </Card>
      </div>

      {/* Métricas Secundárias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="elevated">
          <div className="p-4">
            <p className="text-sm text-white/70 mb-1">CPM (Custo por 1000)</p>
            <p className="text-xl font-bold text-white">
              {formatCurrency(metrics.cpm, 'BRL')}
            </p>
          </div>
        </Card>

        <Card variant="elevated">
          <div className="p-4">
            <p className="text-sm text-white/70 mb-1">CPC Médio</p>
            <p className="text-xl font-bold text-white">
              {formatCurrency(metrics.cpc, 'BRL')}
            </p>
          </div>
        </Card>

        {metrics.conversions && metrics.conversions > 0 && (
          <Card variant="elevated">
            <div className="p-4">
              <p className="text-sm text-white/70 mb-1">Conversões</p>
              <p className="text-xl font-bold text-white">
                {metrics.conversions.toLocaleString('pt-BR')}
              </p>
              <p className="text-xs text-white/60 mt-1">
                Taxa: {((metrics.conversions / metrics.clicks) * 100).toFixed(2)}%
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Campanhas */}
      {campaigns.length > 0 && (
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Campanhas ({campaigns.length})</h3>
            <div className="space-y-3">
              {campaigns.slice(0, 10).map(campaign => {
                const statusColor = campaign.status === 'ACTIVE' 
                  ? 'text-green-400' 
                  : campaign.status === 'PAUSED' 
                  ? 'text-yellow-400' 
                  : 'text-white/60'
                
                return (
                  <div key={campaign.id} className="p-3 bg-white/5 border border-white/10 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-white font-medium">{campaign.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-xs ${statusColor}`}>
                            {campaign.status}
                          </span>
                          <span className="text-xs text-white/60">•</span>
                          <span className="text-xs text-white/60">{campaign.objective}</span>
                        </div>
                        {(campaign.daily_budget || campaign.lifetime_budget) && (
                          <p className="text-xs text-white/50 mt-1">
                            {campaign.daily_budget 
                              ? `Orçamento diário: ${formatCurrency(campaign.daily_budget, 'BRL')}`
                              : `Orçamento total: ${formatCurrency(campaign.lifetime_budget || 0, 'BRL')}`
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              {campaigns.length > 10 && (
                <p className="text-sm text-white/60 text-center pt-2">
                  Mostrando 10 de {campaigns.length} campanhas
                </p>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

