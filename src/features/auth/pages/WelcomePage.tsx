import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Logo } from '@/components/layout/Logo'
import { Button } from '@/components/ui/Button'

const WelcomePage = () => {
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
    <div className="min-h-screen bg-background-dark flex">
      {/* Banner de Boas-Vindas à Esquerda */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-blue/20 to-primary-red/20 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <Logo variant="white" size="lg" className="mx-auto mb-8" />
          <h1 className="text-4xl font-bold text-white mb-4">
            Bem-vindo ao CRM Adventure Labs
          </h1>
          <p className="text-xl text-white/80 mb-6">
            Gerencie suas vendas, contatos e negociações de forma inteligente e eficiente
          </p>
          <div className="space-y-3 text-left text-white/70">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary-red rounded-full"></div>
              <span>Pipeline de vendas visual e intuitivo</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary-red rounded-full"></div>
              <span>Gestão completa de contatos e empresas</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary-red rounded-full"></div>
              <span>Relatórios e análises em tempo real</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary-red rounded-full"></div>
              <span>Integração com WhatsApp Web</span>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário de Login à Direita */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <Logo variant="white" size="lg" className="mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-2">
              CRM Adventure Labs
            </h1>
          </div>
          
          <div className="bg-background-darker border border-white/20 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-2 text-center lg:text-left">
              Faça login para continuar
            </h2>
            <p className="text-white/70 mb-6 text-center lg:text-left">
              Entre com sua conta Google para acessar o sistema
            </p>
            
            <Button
              variant="combined"
              size="lg"
              onClick={handleLogin}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Carregando...' : 'Entrar com Google'}
            </Button>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-sm text-white/50 text-center">
                Ao fazer login, você concorda com nossos termos de uso e política de privacidade
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomePage

