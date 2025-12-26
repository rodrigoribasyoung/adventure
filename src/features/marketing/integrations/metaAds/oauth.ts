/**
 * OAuth flow para Meta Ads (Facebook Ads)
 */

export const META_ADS_OAUTH_CONFIG = {
  authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
  tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
  // Estas variáveis devem vir de variáveis de ambiente ou configuração
  clientId: import.meta.env.VITE_META_ADS_CLIENT_ID || '',
  redirectUri: `${window.location.origin}/auth/meta-ads/callback`,
  scope: 'ads_read ads_management business_management',
}

/**
 * Gera URL de autorização Meta Ads
 */
export const generateMetaAdsAuthUrl = (state?: string): string => {
  const params = new URLSearchParams({
    client_id: META_ADS_OAUTH_CONFIG.clientId,
    redirect_uri: META_ADS_OAUTH_CONFIG.redirectUri,
    scope: META_ADS_OAUTH_CONFIG.scope,
    response_type: 'code',
  })
  
  if (state) {
    params.set('state', state)
  }
  
  return `${META_ADS_OAUTH_CONFIG.authUrl}?${params.toString()}`
}

/**
 * Troca código de autorização por access token
 */
export const exchangeCodeForToken = async (code: string): Promise<{
  access_token: string
  token_type: string
  expires_in?: number
}> => {
  const params = new URLSearchParams({
    client_id: META_ADS_OAUTH_CONFIG.clientId,
    client_secret: import.meta.env.VITE_META_ADS_CLIENT_SECRET || '', // Em produção, fazer no backend
    redirect_uri: META_ADS_OAUTH_CONFIG.redirectUri,
    code,
  })

  const response = await fetch(`${META_ADS_OAUTH_CONFIG.tokenUrl}?${params.toString()}`, {
    method: 'GET',
  })

  if (!response.ok) {
    throw new Error('Erro ao obter access token')
  }

  return response.json()
}

