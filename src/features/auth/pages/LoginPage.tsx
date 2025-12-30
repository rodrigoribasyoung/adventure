import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { AnimatedBackground } from '@/components/common/AnimatedBackground'
import { PulsingLogo } from '@/components/common/PulsingLogo'
import { Button } from '@/components/ui/Button'

const LoginPage = () => {
  const { currentUser, signIn, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (currentUser && !loading) {
      navigate('/')
    }
  }, [currentUser, loading, navigate])

  const handleLogin = async () => {
    try {
      await signIn()
    } catch (error) {
      console.error('Erro ao fazer login:', error)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="mb-8 flex justify-center">
            <PulsingLogo />
          </div>
          <h1 className="text-4xl font-light text-white mb-3 tracking-tight">
            CRM Adventure Labs
          </h1>
          <p className="text-white/60 text-sm font-light tracking-wide">
            Faça login para continuar
          </p>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl hover:bg-white/10 transition-all duration-500">
          <Button
            variant="combined"
            size="lg"
            onClick={handleLogin}
            disabled={loading}
            className="w-full font-light tracking-wide"
          >
            {loading ? 'Carregando...' : 'Entrar com Google'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

