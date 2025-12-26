import { useState, useEffect } from 'react'
import { useIntegrations } from '@/features/integrations/hooks/useIntegrations'
import { getAdAccounts, getCampaigns, getAccountMetrics, MetaAdsAccount, MetaAdsCampaign, MetaAdsMetrics } from '../api'
import { decryptToken } from '@/lib/integrations/storage'

export const useMetaAds = () => {
  const { connections, loading: connectionsLoading } = useIntegrations('meta_ads')
  const [accounts, setAccounts] = useState<MetaAdsAccount[]>([])
  const [campaigns, setCampaigns] = useState<MetaAdsCampaign[]>([])
  const [metrics, setMetrics] = useState<MetaAdsMetrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)

  const connection = connections[0] // Primeira conexão Meta Ads

  useEffect(() => {
    if (connection && !selectedAccountId) {
      setSelectedAccountId(connection.accountId)
    }
  }, [connection, selectedAccountId])

  const fetchAccounts = async () => {
    if (!connection) return

    try {
      setLoading(true)
      setError(null)
      const accessToken = decryptToken(connection.accessToken)
      const data = await getAdAccounts(accessToken)
      setAccounts(data)
      
      // Se não houver accountId salvo, usa a primeira conta
      if (!selectedAccountId && data.length > 0) {
        setSelectedAccountId(data[0].account_id)
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar contas')
    } finally {
      setLoading(false)
    }
  }

  const fetchCampaigns = async (accountId: string) => {
    if (!connection) return

    try {
      setLoading(true)
      setError(null)
      const accessToken = decryptToken(connection.accessToken)
      const data = await getCampaigns(accessToken, accountId)
      setCampaigns(data)
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar campanhas')
    } finally {
      setLoading(false)
    }
  }

  const fetchMetrics = async (accountId: string, startDate: string, endDate: string) => {
    if (!connection) return

    try {
      setLoading(true)
      setError(null)
      const accessToken = decryptToken(connection.accessToken)
      const data = await getAccountMetrics(accessToken, accountId, startDate, endDate)
      setMetrics(data)
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar métricas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (connection) {
      fetchAccounts()
    }
  }, [connection])

  useEffect(() => {
    if (connection && selectedAccountId) {
      fetchCampaigns(selectedAccountId)
      
      // Busca métricas dos últimos 30 dias por padrão
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      fetchMetrics(selectedAccountId, startDate, endDate)
    }
  }, [connection, selectedAccountId])

  return {
    connection,
    accounts,
    campaigns,
    metrics,
    selectedAccountId,
    setSelectedAccountId,
    loading: loading || connectionsLoading,
    error,
    refetchAccounts: fetchAccounts,
    refetchCampaigns: () => selectedAccountId && fetchCampaigns(selectedAccountId),
    refetchMetrics: (startDate: string, endDate: string) => 
      selectedAccountId && fetchMetrics(selectedAccountId, startDate, endDate),
  }
}

