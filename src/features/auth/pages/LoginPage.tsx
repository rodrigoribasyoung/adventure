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
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center">
            <PulsingLogo />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
            CRM Adventure Labs
          </h1>
          <p className="text-white/70 drop-shadow">
            Faça login para continuar
          </p>
        </div>
        
        <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg p-8 shadow-2xl">
          <Button
            variant="combined"
            size="lg"
            onClick={handleLogin}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Carregando...' : 'Entrar com Google'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

