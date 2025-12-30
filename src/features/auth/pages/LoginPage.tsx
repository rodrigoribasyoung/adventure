import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { AnimatedBackground } from '@/components/common/AnimatedBackground'
import { PulsingLogo } from '@/components/common/PulsingLogo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { soundEffects } from '@/lib/utils/soundEffects'

const LoginPage = () => {
  const { currentUser, signIn, signInWithEmail, resetPassword, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  useEffect(() => {
    if (currentUser && !loading) {
      navigate('/')
    }
  }, [currentUser, loading, navigate])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      soundEffects.click()
      setError(null)
      await signInWithEmail(email, password)
      soundEffects.success()
    } catch (error: any) {
      console.error('Erro ao fazer login:', error)
      soundEffects.error()
      setError(error?.message || 'Erro ao fazer login')
    }
  }

  const handleGoogleLogin = async () => {
    try {
      soundEffects.click()
      setError(null)
      await signIn()
      soundEffects.success()
    } catch (error: any) {
      console.error('Erro ao fazer login:', error)
      soundEffects.error()
      setError(error?.message || 'Erro ao fazer login')
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setResetLoading(true)
      setError(null)
      await resetPassword(resetEmail)
      setResetSuccess(true)
      setTimeout(() => {
        setIsResetModalOpen(false)
        setResetSuccess(false)
        setResetEmail('')
      }, 3000)
    } catch (error: any) {
      console.error('Erro ao resetar senha:', error)
      setError(error?.message || 'Erro ao enviar email de recuperação')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Logo centralizado no topo */}
      <div className="absolute top-8 left-0 right-0 z-20 flex justify-center">
        <div className="scale-150">
          <PulsingLogo />
        </div>
      </div>

      {/* Conteúdo à esquerda */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative z-10 pt-32">
        <div className="max-w-lg">
          <h1 
            className="text-5xl font-light text-white mb-6 tracking-tight leading-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Movimentos ousados.<br />
            Crescimento inteligente.
          </h1>
          <p 
            className="text-white/70 text-lg font-light tracking-wide leading-relaxed mb-8"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Empreender não precisa ser difícil. Gerencie vendas, contatos e negociações com inteligência e precisão.
          </p>
          <div className="space-y-2">
            <p 
              className="text-white/90 text-xl font-light"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Adventure Labs
            </p>
            <p 
              className="text-white/60 text-sm font-light"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Seu laboratório de aventuras calculadas.
            </p>
          </div>
        </div>
      </div>

      {/* Formulário de login à direita */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-12 relative z-10 pt-32">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="text-center mb-8 lg:hidden">
            <h1 
              className="text-3xl font-light text-white mb-2 tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Movimentos ousados.<br />
              Crescimento inteligente.
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
              Entre com seu email e senha
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleEmailLogin} className="space-y-4">
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
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-light text-white/90">
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetModalOpen(true)
                      setResetEmail(email)
                    }}
                    className="text-sm text-primary-red hover:text-primary-red/80 font-light transition-colors underline"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Esqueci minha senha
                  </button>
                </div>
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
                variant="primary-blue"
                size="lg"
                disabled={loading || !email || !password}
                className="w-full font-light tracking-wide"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {loading ? 'Acessando...' : 'Acessar'}
              </Button>
            </form>

            {/* Divisor */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-white/10"></div>
              <span className="px-4 text-white/60 text-sm font-light">ou</span>
              <div className="flex-1 border-t border-white/10"></div>
            </div>

            {/* Botão Google */}
            <Button
              variant="ghost"
              size="lg"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full font-light tracking-wide border border-white/10 hover:bg-white/10"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Acessar com Google</span>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de recuperação de senha */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => {
          setIsResetModalOpen(false)
          setResetEmail('')
          setResetSuccess(false)
          setError(null)
        }}
        title="Recuperar senha"
        size="md"
      >
        {resetSuccess ? (
          <div className="text-center py-4">
            <div className="mb-4 text-green-400 text-lg">✓</div>
            <p className="text-white/90 mb-2">Email enviado com sucesso!</p>
            <p className="text-white/60 text-sm">
              Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
            </p>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-white/70 text-sm mb-4">
              Digite seu email e enviaremos um link para redefinir sua senha.
            </p>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsResetModalOpen(false)
                  setResetEmail('')
                  setError(null)
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary-red"
                disabled={resetLoading || !resetEmail}
                className="flex-1"
              >
                {resetLoading ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

export default LoginPage
