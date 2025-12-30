import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { AnimatedBackground } from '@/components/common/AnimatedBackground'
import { PulsingLogo } from '@/components/common/PulsingLogo'
import { LoadingBar } from '@/components/common/LoadingBar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { soundEffects } from '@/lib/utils/soundEffects'

const WelcomePage = () => {
  const { currentUser, signIn, signInWithEmail, signUpWithEmail, loading } = useAuth()
  const navigate = useNavigate()
  const [showLoadingBar, setShowLoadingBar] = useState(false)
  const [loginMode, setLoginMode] = useState<'google' | 'email'>('google')
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

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
      setError(null)
      await signIn()
      soundEffects.success()
    } catch (error: any) {
      console.error('Erro ao fazer login:', error)
      soundEffects.error()
      setShowLoadingBar(false)
      setError(error?.message || 'Erro ao fazer login')
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      soundEffects.click()
      setShowLoadingBar(true)
      soundEffects.transition()
      setError(null)
      
      if (isSignUp) {
        await signUpWithEmail(email, password)
      } else {
        await signInWithEmail(email, password)
      }
      
      soundEffects.success()
    } catch (error: any) {
      console.error('Erro ao fazer login com email:', error)
      soundEffects.error()
      setShowLoadingBar(false)
      setError(error?.message || 'Erro ao fazer login')
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
              {isSignUp ? 'Criar conta' : 'Faça login para continuar'}
            </h2>
            <p 
              className="text-white/60 text-sm font-light mb-6 text-center lg:text-left"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {loginMode === 'google' 
                ? 'Entre com sua conta Google para acessar o sistema'
                : isSignUp 
                  ? 'Crie sua conta para começar'
                  : 'Entre com seu email e senha'}
            </p>

            {/* Seletor de modo de login */}
            <div className="flex gap-2 mb-6 bg-white/5 rounded-lg p-1">
              <button
                type="button"
                onClick={() => {
                  setLoginMode('google')
                  setError(null)
                }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-light transition-all ${
                  loginMode === 'google'
                    ? 'bg-primary-red text-white'
                    : 'text-white/60 hover:text-white/80'
                }`}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Google
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMode('email')
                  setError(null)
                }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-light transition-all ${
                  loginMode === 'email'
                    ? 'bg-primary-red text-white'
                    : 'text-white/60 hover:text-white/80'
                }`}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Email
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}
            
            {showLoadingBar ? (
              <LoadingBar onComplete={handleLoadingComplete} duration={800} />
            ) : loginMode === 'google' ? (
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
            ) : (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                {isSignUp && (
                  <div>
                    <label className="block text-sm font-light text-white/90 mb-2">
                      Nome
                    </label>
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome completo"
                      required={isSignUp}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-light text-white/90 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-light text-white/90 mb-2">
                    Senha
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
                <Button
                  type="submit"
                  variant="combined"
                  size="lg"
                  disabled={loading || showLoadingBar || !email || !password}
                  className="w-full font-light tracking-wide"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {isSignUp ? 'Criar conta' : 'Entrar'}
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp)
                    setError(null)
                  }}
                  className="w-full text-center text-white/60 hover:text-white/80 text-sm font-light transition-colors"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {isSignUp 
                    ? 'Já tem uma conta? Faça login'
                    : 'Não tem uma conta? Criar conta'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomePage


