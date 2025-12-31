/**
 * Utilitários para gerenciar OAuth flows
 */

export interface OAuthParams {
  clientId: string
  redirectUri: string
  scope: string
  responseType?: string
  state?: string
}

/**
 * Gera URL de autorização OAuth
 */
export const generateOAuthUrl = (authUrl: string, params: OAuthParams): string => {
  const url = new URL(authUrl)
  url.searchParams.set('client_id', params.clientId)
  url.searchParams.set('redirect_uri', params.redirectUri)
  url.searchParams.set('scope', params.scope)
  url.searchParams.set('response_type', params.responseType || 'code')
  if (params.state) {
    url.searchParams.set('state', params.state)
  }
  return url.toString()
}

/**
 * Extrai código de autorização da URL de callback
 */
export const extractAuthCode = (callbackUrl: string): string | null => {
  try {
    const url = new URL(callbackUrl)
    return url.searchParams.get('code')
  } catch {
    return null
  }
}

/**
 * Extrai estado da URL de callback (para validação CSRF)
 */
export const extractState = (callbackUrl: string): string | null => {
  try {
    const url = new URL(callbackUrl)
    return url.searchParams.get('state')
  } catch {
    return null
  }
}

/**
 * Abre popup para OAuth
 */
export const openOAuthPopup = (url: string, width: number = 600, height: number = 700): Promise<string | null> => {
  return new Promise((resolve) => {
    const left = (window.screen.width - width) / 2
    const top = (window.screen.height - height) / 2
    
    const popup = window.open(
      url,
      'OAuth',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
    )

    if (!popup) {
      resolve(null)
      return
    }

    // Listener para mensagens do popup (postMessage)
    const messageHandler = (event: MessageEvent) => {
      // Verificar origem por segurança
      if (event.origin !== window.location.origin) {
        return
      }

      if (event.data.type === 'oauth_success') {
        window.removeEventListener('message', messageHandler)
        if (!popup.closed) {
          popup.close()
        }
        resolve(event.data.code)
      } else if (event.data.type === 'oauth_error') {
        window.removeEventListener('message', messageHandler)
        if (!popup.closed) {
          popup.close()
        }
        resolve(null)
      }
    }

    window.addEventListener('message', messageHandler)

    // Verificar se popup foi fechado manualmente
    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup)
        window.removeEventListener('message', messageHandler)
        resolve(null)
      }
    }, 500)

    // Timeout após 5 minutos
    setTimeout(() => {
      if (!popup.closed) {
        popup.close()
        clearInterval(checkPopup)
        window.removeEventListener('message', messageHandler)
        resolve(null)
      }
    }, 5 * 60 * 1000)
  })
}

/**
 * Extrai token de URL (para flows que retornam token diretamente)
 */
export const extractTokenFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url)
    const hash = urlObj.hash.substring(1)
    const params = new URLSearchParams(hash)
    return params.get('access_token')
  } catch {
    return null
  }
}

/**
 * Gera estado aleatório para proteção CSRF
 */
export const generateState = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

