import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Logo } from '@/components/layout/Logo'
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
    <div className="min-h-screen bg-background-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo variant="white" size="lg" className="mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-2">
            CRM Adventure Labs
          </h1>
          <p className="text-white/70">
            Faça login para continuar
          </p>
        </div>
        
        <div className="bg-background-darker border border-white/20 rounded-lg p-8">
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

