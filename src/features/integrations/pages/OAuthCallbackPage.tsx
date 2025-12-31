import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

/**
 * Página de callback OAuth que processa o código de autorização
 * e comunica com a janela pai via postMessage
 */
export const OAuthCallbackPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const state = searchParams.get('state')

    // Se houver erro, comunicar à janela pai
    if (error) {
      const errorDescription = searchParams.get('error_description') || 'Erro na autorização'
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'oauth_error',
            error: error,
            error_description: errorDescription,
          },
          window.location.origin
        )
      }
      // Fechar popup após um breve delay
      setTimeout(() => {
        window.close()
      }, 2000)
      return
    }

    // Se houver código, comunicar à janela pai
    if (code) {
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'oauth_success',
            code: code,
            state: state,
          },
          window.location.origin
        )
      }
      // Fechar popup após comunicar
      setTimeout(() => {
        window.close()
      }, 500)
    } else {
      // Se não houver código nem erro, pode ser que a página foi acessada diretamente
      // Nesse caso, redirecionar para a página principal
      if (!window.opener) {
        navigate('/')
      } else {
        window.close()
      }
    }
  }, [searchParams, navigate])

  return (
    <div className="flex items-center justify-center min-h-screen bg-background-dark">
      <div className="text-center">
        <div className="text-white mb-4">Processando autorização...</div>
        <div className="text-white/60 text-sm">Você pode fechar esta janela</div>
      </div>
    </div>
  )
}
