import { useState, useEffect } from 'react'
import { useIntegrations } from '@/features/integrations/hooks/useIntegrations'
import { prepareConnectionForUse } from '@/lib/integrations/storage'
import { getCampaigns, getCampaignMetrics, GoogleAdsCampaign, GoogleAdsMetrics } from '../api'
import { refreshAccessToken } from '../oauth'
import { format, subDays } from 'date-fns'

export const useGoogleAds = (customerId?: string) => {
  const { connections } = useIntegrations('google_ads')
  const [campaigns, setCampaigns] = useState<GoogleAdsCampaign[]>([])
  const [metrics, setMetrics] = useState<Record<string, GoogleAdsMetrics>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connection = connections[0]

  const fetchData = async (startDate?: string, endDate?: string) => {
    if (!connection) {
      setError('Google Ads não está conectado')
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

      const defaultStartDate = startDate || format(subDays(new Date(), 30), 'yyyy-MM-dd')
      const defaultEndDate = endDate || format(new Date(), 'yyyy-MM-dd')

      const customer = customerId || connection.accountId

      // Buscar campanhas
      const campaignsData = await getCampaigns(accessToken, customer, defaultStartDate, defaultEndDate)
      setCampaigns(campaignsData)

      // Buscar métricas para todas as campanhas
      if (campaignsData.length > 0) {
        const campaignIds = campaignsData.map(c => c.id)
        const metricsData = await getCampaignMetrics(
          accessToken,
          customer,
          campaignIds,
          defaultStartDate,
          defaultEndDate
        )
        setMetrics(metricsData)
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar dados do Google Ads')
      console.error('Erro ao buscar dados do Google Ads:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (connection) {
      fetchData()
    }
  }, [connection, customerId])

  return {
    connection,
    campaigns,
    metrics,
    loading,
    error,
    refresh: fetchData,
  }
}

