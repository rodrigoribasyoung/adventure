/**
 * OAuth flow para Google Ads
 */

export const GOOGLE_ADS_OAUTH_CONFIG = {
  authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  clientId: import.meta.env.VITE_GOOGLE_ADS_CLIENT_ID || '',
  redirectUri: `${window.location.origin}/auth/google-ads/callback`,
  scope: 'https://www.googleapis.com/auth/adwords',
}

// Função removida - usando apenas credenciais globais do Adventure Labs

/**
 * Gera URL de autorização Google Ads
 */
export const generateGoogleAdsAuthUrl = (state?: string): string => {
  const params = new URLSearchParams({
    client_id: GOOGLE_ADS_OAUTH_CONFIG.clientId,
    redirect_uri: GOOGLE_ADS_OAUTH_CONFIG.redirectUri,
    scope: GOOGLE_ADS_OAUTH_CONFIG.scope,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
  })
  
  if (state) {
    params.set('state', state)
  }
  
  return `${GOOGLE_ADS_OAUTH_CONFIG.authUrl}?${params.toString()}`
}

/**
 * Troca código de autorização por access token e refresh token
 * Usa as credenciais OAuth do Adventure Labs (variáveis de ambiente)
 */
export const exchangeCodeForToken = async (code: string): Promise<{
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type: string
}> => {
  const params = new URLSearchParams({
    client_id: GOOGLE_ADS_OAUTH_CONFIG.clientId,
    client_secret: import.meta.env.VITE_GOOGLE_ADS_CLIENT_SECRET || '',
    redirect_uri: GOOGLE_ADS_OAUTH_CONFIG.redirectUri,
    code,
    grant_type: 'authorization_code',
  })

  const response = await fetch(GOOGLE_ADS_OAUTH_CONFIG.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    const errorMessage = error.error_description || error.error || 'Erro ao obter token'
    
    // Melhorar mensagens de erro comuns
    if (error.error === 'invalid_grant' || errorMessage.includes('invalid_grant')) {
      throw new Error('Código de autorização inválido ou expirado. Tente conectar novamente.')
    }
    
    if (errorMessage.includes('insufficient permissions') || errorMessage.includes('Missing or insufficient')) {
      throw new Error('Missing or insufficient permissions')
    }
    
    throw new Error(errorMessage)
  }

  return response.json()
}

/**
 * Atualiza access token usando refresh token
 */
export const refreshAccessToken = async (refreshToken: string): Promise<{
  access_token: string
  expires_in?: number
  token_type: string
}> => {
  const params = new URLSearchParams({
    client_id: GOOGLE_ADS_OAUTH_CONFIG.clientId,
    client_secret: import.meta.env.VITE_GOOGLE_ADS_CLIENT_SECRET || '',
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  })

  const response = await fetch(GOOGLE_ADS_OAUTH_CONFIG.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error_description || 'Erro ao atualizar token')
  }

  return response.json()
}

