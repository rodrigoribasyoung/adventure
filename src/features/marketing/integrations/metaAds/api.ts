/**
 * API client para Meta Ads (Facebook Marketing API)
 */

export interface MetaAdsAccount {
  id: string
  name: string
  account_id: string
  currency: string
  timezone_name: string
}

export interface MetaAdsCampaign {
  id: string
  name: string
  status: string
  objective: string
  daily_budget?: number
  lifetime_budget?: number
}

export interface MetaAdsMetrics {
  impressions: number
  clicks: number
  spend: number
  reach: number
  cpm: number // Cost per 1000 impressions
  cpc: number // Cost per click
  ctr: number // Click-through rate
  conversions?: number
}

/**
 * Busca contas de anúncios do usuário
 */
export const getAdAccounts = async (accessToken: string): Promise<MetaAdsAccount[]> => {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/me/adaccounts?fields=id,name,account_id,currency,timezone_name&access_token=${accessToken}`
  )

  if (!response.ok) {
    throw new Error('Erro ao buscar contas de anúncios')
  }

  const data = await response.json()
  return data.data || []
}

/**
 * Busca campanhas de uma conta
 */
export const getCampaigns = async (accessToken: string, accountId: string): Promise<MetaAdsCampaign[]> => {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${accountId}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget&access_token=${accessToken}`
  )

  if (!response.ok) {
    throw new Error('Erro ao buscar campanhas')
  }

  const data = await response.json()
  return data.data || []
}

/**
 * Busca métricas de uma conta por período
 */
export const getAccountMetrics = async (
  accessToken: string,
  accountId: string,
  startDate: string,
  endDate: string
): Promise<MetaAdsMetrics> => {
  const fields = [
    'impressions',
    'clicks',
    'spend',
    'reach',
    'cpm',
    'cpc',
    'ctr',
    'actions',
  ].join(',')

  const response = await fetch(
    `https://graph.facebook.com/v18.0/${accountId}/insights?fields=${fields}&time_range={"since":"${startDate}","until":"${endDate}"}&access_token=${accessToken}`
  )

  if (!response.ok) {
    throw new Error('Erro ao buscar métricas')
  }

  const data = await response.json()
  
  // Agrega métricas de todos os resultados
  const aggregated = (data.data || []).reduce((acc: any, item: any) => {
    acc.impressions += parseInt(item.impressions || 0)
    acc.clicks += parseInt(item.clicks || 0)
    acc.spend += parseFloat(item.spend || 0)
    acc.reach += parseInt(item.reach || 0)
    return acc
  }, {
    impressions: 0,
    clicks: 0,
    spend: 0,
    reach: 0,
    conversions: 0,
  })

  // Calcula métricas derivadas
  aggregated.cpm = aggregated.impressions > 0 ? (aggregated.spend / aggregated.impressions) * 1000 : 0
  aggregated.cpc = aggregated.clicks > 0 ? aggregated.spend / aggregated.clicks : 0
  aggregated.ctr = aggregated.impressions > 0 ? (aggregated.clicks / aggregated.impressions) * 100 : 0

  // Extrai conversões se disponível
  if (data.data?.[0]?.actions) {
    const conversionActions = data.data[0].actions.filter((a: any) => 
      a.action_type === 'purchase' || a.action_type === 'lead'
    )
    aggregated.conversions = conversionActions.reduce((sum: number, a: any) => sum + parseInt(a.value || 0), 0)
  }

  return aggregated
}

