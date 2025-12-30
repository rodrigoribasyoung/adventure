import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { AnimatedBackground } from '@/components/common/AnimatedBackground'
import { PulsingLogo } from '@/components/common/PulsingLogo'
import { LoadingBar } from '@/components/common/LoadingBar'
import { Button } from '@/components/ui/Button'
import { soundEffects } from '@/lib/utils/soundEffects'

const WelcomePage = () => {
  const { currentUser, signIn, loading } = useAuth()
  const navigate = useNavigate()
  const [showLoadingBar, setShowLoadingBar] = useState(false)

  useEffect(() => {
    if (currentUser && !loading) {
      // Pegar a rota de destino salva ou usar a home
      const redirectPath = sessionStorage.getItem('loginRedirect') || '/'
      sessionStorage.removeItem('loginRedirect')
      navigate(redirectPath)
    }
  }, [currentUser, loading, navigate])

  const handleLogin = async () => {
    try {
      soundEffects.click()
      setShowLoadingBar(true)
      soundEffects.transition()
      await signIn()
      soundEffects.success()
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      soundEffects.error()
      setShowLoadingBar(false)
    }
  }

  const handleLoadingComplete = () => {
    // O redirecionamento será feito pelo useEffect quando currentUser mudar
  }

  return (
    <div className="min-h-screen bg-black flex relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Apresentação à esquerda */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative z-10">
        <div className="max-w-lg">
          <div className="mb-8">
            <PulsingLogo />
          </div>
          <h1 
            className="text-5xl font-light text-white mb-6 tracking-tight leading-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Movimentos ousados. Crescimento inteligente.
          </h1>
          <p 
            className="text-white/70 text-lg font-light tracking-wide leading-relaxed"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Seu laboratório de aventuras calculadas. Gerencie vendas, contatos e negociações com inteligência e precisão.
          </p>
        </div>
      </div>

      {/* Login à direita */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="text-center mb-8 lg:hidden">
            <div className="mb-6 flex justify-center">
              <PulsingLogo />
            </div>
            <h1 
              className="text-3xl font-light text-white mb-2 tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Movimentos ousados. Crescimento inteligente.
            </h1>
          </div>
          
          <div 
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl hover:bg-white/10 transition-all duration-500"
          >
            <h2 
              className="text-2xl font-light text-white mb-2 text-center lg:text-left"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Faça login para continuar
            </h2>
            <p 
              className="text-white/60 text-sm font-light mb-6 text-center lg:text-left"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Entre com sua conta Google para acessar o sistema
            </p>
            
            {showLoadingBar ? (
              <LoadingBar onComplete={handleLoadingComplete} duration={800} />
            ) : (
              <Button
                variant="combined"
                size="lg"
                onClick={handleLogin}
                disabled={loading || showLoadingBar}
                className="w-full font-light tracking-wide"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Entrar com Google
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomePage


