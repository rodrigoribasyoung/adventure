import { Card } from '@/components/ui/Card'
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics'

interface GoogleAnalyticsDashboardProps {
  propertyId?: string
}

export const GoogleAnalyticsDashboard = ({ propertyId }: GoogleAnalyticsDashboardProps) => {
  const { metrics, topPages, loading, error, properties, selectedProperty, setSelectedProperty } =
    useGoogleAnalytics(propertyId)

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

  if (!metrics) {
    return (
      <Card>
        <div className="p-6 text-center">
          <p className="text-white/70">Nenhuma métrica disponível</p>
        </div>
      </Card>
    )
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}m ${secs}s`
  }

  return (
    <div className="space-y-6">
      {/* Seletor de propriedade */}
      {properties.length > 1 && (
        <Card>
          <div className="p-4">
            <label className="block text-sm font-medium text-white/90 mb-2">Propriedade</label>
            <select
              value={selectedProperty?.property || ''}
              onChange={(e) => {
                const property = properties.find(p => p.property === e.target.value)
                if (property) setSelectedProperty(property)
              }}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50"
            >
              {properties.map((prop) => (
                <option key={prop.property} value={prop.property}>
                  {prop.displayName}
                </option>
              ))}
            </select>
          </div>
        </Card>
      )}

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <p className="text-sm text-white/70 mb-1">Usuários</p>
            <p className="text-2xl font-bold text-white">{metrics.activeUsers.toLocaleString('pt-BR')}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-white/70 mb-1">Sessões</p>
            <p className="text-2xl font-bold text-white">{metrics.sessions.toLocaleString('pt-BR')}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-white/70 mb-1">Taxa de Rejeição</p>
            <p className="text-2xl font-bold text-white">{metrics.bounceRate.toFixed(2)}%</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-white/70 mb-1">Duração Média</p>
            <p className="text-2xl font-bold text-white">{formatDuration(metrics.averageSessionDuration)}</p>
          </div>
        </Card>
      </div>

      {/* Conversões */}
      {metrics.conversions > 0 && (
        <Card>
          <div className="p-4">
            <p className="text-sm text-white/70 mb-1">Conversões</p>
            <p className="text-2xl font-bold text-white">{metrics.conversions.toLocaleString('pt-BR')}</p>
          </div>
        </Card>
      )}

      {/* Páginas mais visitadas */}
      {topPages.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Páginas Mais Visitadas</h3>
            <div className="space-y-2">
              {topPages.slice(0, 10).map((page, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg"
                >
                  <p className="text-white/90 truncate flex-1">{page.pagePath}</p>
                  <p className="text-white/70 text-sm ml-4">{page.views.toLocaleString('pt-BR')} visualizações</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

