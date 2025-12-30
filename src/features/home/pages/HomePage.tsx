import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { FiBriefcase, FiUsers, FiBarChart2 } from 'react-icons/fi'
import { FeaturesDiagram } from '@/components/home/FeaturesDiagram'
import { BackgroundManager } from '@/components/common/BackgroundManager'
import { TypewriterTitle } from '@/components/common/TypewriterTitle'
import { MarketingInterestForm } from '@/components/home/MarketingInterestForm'

const HomePage = () => {
  const { userData } = useAuth()
  const navigate = useNavigate()

  // Extrair primeiro nome do usuário
  const firstName = userData?.name?.split(' ')[0] || 'Usuário'
  const headlineText = `Que bom ter você aqui, ${firstName}!`

  return (
    <div className="min-h-screen bg-background-dark flex flex-col relative">
      <BackgroundManager />
      <Header />
      <main className="flex-1 overflow-y-auto px-8 py-6 relative z-10">
      <div className="max-w-6xl mx-auto">
        {/* Seção 1: Headline de Boas-Vindas e Cards de Ação Rápida */}
        <section className="py-24 mb-32">
          <div className="text-center mb-16">
            <TypewriterTitle 
              text={headlineText} 
              speed={40} 
              className="text-3xl text-white/90 mb-3"
              as="h1"
            />
            <p className="text-white/60 text-lg">
              Escolha uma opção abaixo para começar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card 
              variant="elevated" 
              className="cursor-pointer hover:border-white/20 transition-all group"
              onClick={() => navigate('/deals')}
            >
              <div className="text-center p-4">
                <div className="mb-3 group-hover:scale-105 transition-transform flex justify-center">
                  <FiBriefcase className="w-8 h-8 text-white/60" />
                </div>
                <h3 className="text-base text-white/90 mb-2">Negócios</h3>
                <p className="text-white/60 text-xs mb-4">
                  Gerencie seu pipeline de vendas e acompanhe suas negociações
                </p>
                <Button variant="secondary" size="sm" className="w-full">
                  Acessar Negócios
                </Button>
              </div>
            </Card>

            <Card 
              variant="elevated" 
              className="cursor-pointer hover:border-white/20 transition-all group"
              onClick={() => navigate('/contacts')}
            >
              <div className="text-center p-4">
                <div className="mb-3 group-hover:scale-105 transition-transform flex justify-center">
                  <FiUsers className="w-8 h-8 text-white/60" />
                </div>
                <h3 className="text-base text-white/90 mb-2">Contatos</h3>
                <p className="text-white/60 text-xs mb-4">
                  Organize e mantenha seus contatos sempre atualizados
                </p>
                <Button variant="secondary" size="sm" className="w-full">
                  Acessar Contatos
                </Button>
              </div>
            </Card>

            <Card 
              variant="elevated" 
              className="cursor-pointer hover:border-white/20 transition-all group"
              onClick={() => navigate('/reports')}
            >
              <div className="text-center p-4">
                <div className="mb-3 group-hover:scale-105 transition-transform flex justify-center">
                  <FiBarChart2 className="w-8 h-8 text-white/60" />
                </div>
                <h3 className="text-base text-white/90 mb-2">Relatórios</h3>
                <p className="text-white/60 text-xs mb-4">
                  Analise métricas e acompanhe o desempenho do seu negócio
                </p>
                <Button variant="secondary" size="sm" className="w-full">
                  Acessar Relatórios
                </Button>
              </div>
            </Card>
          </div>
        </section>

        {/* Seção 2: Visão do Todo */}
        <section className="py-16 mb-16">
          <div className="text-center mb-8">
            <TypewriterTitle 
              text="Aqui você tem a visão do todo" 
              speed={35} 
              className="text-xl text-white/90 mb-1.5"
              as="h2"
            />
            <p className="text-white/60 text-sm">
              Explore todas as funcionalidades integradas do CRM
            </p>
          </div>
          <FeaturesDiagram />
        </section>

        {/* Seção 3: Formulário de Interesse em Marketing */}
        <section className="py-16 mb-16">
          <MarketingInterestForm />
        </section>

        {/* Seção 4: Ajuda */}
        <section className="py-12">
          <Card className="bg-white/5 border-white/10 max-w-3xl mx-auto">
            <div className="text-center p-4">
              <h2 className="text-base text-white/90 mb-2">
                Precisa de ajuda?
              </h2>
              <p className="text-white/60 text-xs mb-4">
                Acesse nossos recursos e documentação para tirar suas dúvidas
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="secondary"
                  onClick={() => window.open('https://github.com/rodrigoribasyoung/adventure', '_blank')}
                  className="flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => window.open('/docs', '_blank')}
                  className="flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Guia do Usuário
                </Button>
              </div>
            </div>
          </Card>
        </section>
      </div>
      </main>
    </div>
  )
}

export default HomePage

