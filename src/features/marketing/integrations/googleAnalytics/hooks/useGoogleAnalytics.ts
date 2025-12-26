import { useState, useEffect } from 'react'
import { useIntegrations } from '@/features/integrations/hooks/useIntegrations'
import { prepareConnectionForUse } from '@/lib/integrations/storage'
import { getProperties, getMetrics, getTopPages, GoogleAnalyticsMetrics, GoogleAnalyticsProperty } from '../api'
import { refreshAccessToken } from '../oauth'
import { format, subDays } from 'date-fns'

export const useGoogleAnalytics = (propertyId?: string) => {
  const { connections } = useIntegrations('google_analytics')
  const [properties, setProperties] = useState<GoogleAnalyticsProperty[]>([])
  const [selectedProperty, setSelectedProperty] = useState<GoogleAnalyticsProperty | null>(null)
  const [metrics, setMetrics] = useState<GoogleAnalyticsMetrics | null>(null)
  const [topPages, setTopPages] = useState<Array<{ pagePath: string; views: number }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connection = connections[0]

  const fetchProperties = async () => {
    if (!connection) {
      setError('Google Analytics não está conectado')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const decryptedConnection = prepareConnectionForUse(connection)
      let accessToken = decryptedConnection.accessToken

      // Verificar se token expirou e atualizar se necessário
      if (decryptedConnection.expiresAt && decryptedConnection.refreshToken) {
        const expiresAt = decryptedConnection.expiresAt.toMillis()
        if (Date.now() >= expiresAt - 60000) { // Renovar 1 minuto antes
          try {
            const tokenData = await refreshAccessToken(decryptedConnection.refreshToken)
            accessToken = tokenData.access_token
          } catch (refreshError) {
            console.error('Erro ao renovar token:', refreshError)
          }
        }
      }

      const propertiesData = await getProperties(accessToken)
      setProperties(propertiesData)

      if (propertiesData.length > 0 && !selectedProperty) {
        setSelectedProperty(propertiesData[0])
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar propriedades do Google Analytics')
      console.error('Erro ao buscar propriedades:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMetrics = async (propertyId: string, startDate?: string, endDate?: string) => {
    if (!connection) {
      setError('Google Analytics não está conectado')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const decryptedConnection = prepareConnectionForUse(connection)
      let accessToken = decryptedConnection.accessToken

      // Verificar se token expirou e atualizar se necessário
      if (decryptedConnection.expiresAt && decryptedConnection.refreshToken) {
        const expiresAt = decryptedConnection.expiresAt.toMillis()
        if (Date.now() >= expiresAt - 60000) {
          try {
            const tokenData = await refreshAccessToken(decryptedConnection.refreshToken)
            accessToken = tokenData.access_token
          } catch (refreshError) {
            console.error('Erro ao renovar token:', refreshError)
          }
        }
      }

      const defaultStartDate = startDate || format(subDays(new Date(), 30), 'yyyy-MM-dd')
      const defaultEndDate = endDate || format(new Date(), 'yyyy-MM-dd')

      const { metrics: metricsData } = await getMetrics(
        accessToken,
        propertyId,
        defaultStartDate,
        defaultEndDate
      )
      setMetrics(metricsData)

      // Buscar páginas mais visitadas
      const topPagesData = await getTopPages(accessToken, propertyId, defaultStartDate, defaultEndDate)
      setTopPages(topPagesData)
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar métricas do Google Analytics')
      console.error('Erro ao buscar métricas:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (connection) {
      fetchProperties()
    }
  }, [connection])

  useEffect(() => {
    if (selectedProperty) {
      fetchMetrics(selectedProperty.property)
    }
  }, [selectedProperty])

  return {
    connection,
    properties,
    selectedProperty,
    setSelectedProperty,
    metrics,
    topPages,
    loading,
    error,
    refresh: () => selectedProperty && fetchMetrics(selectedProperty.property),
  }
}

