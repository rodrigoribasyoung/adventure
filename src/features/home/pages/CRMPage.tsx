import { AnimatedBackground } from '@/components/common/AnimatedBackground'
import { PulsingLogo } from '@/components/common/PulsingLogo'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'

const CRMPage = () => {
  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Header */}
      <header className="relative z-10 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PulsingLogo />
            <span className="text-white text-xl font-light" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Adventure Labs
            </span>
          </div>
          <Link to="/login">
            <Button variant="primary-red" size="md">
              Entrar
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center relative z-10 px-6 lg:px-12 py-20">
        <div className="max-w-6xl mx-auto text-center">
          <h1 
            className="text-5xl lg:text-7xl font-light text-white mb-6 tracking-tight leading-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Movimentos ousados.<br />
            Crescimento inteligente.
          </h1>
          <p 
            className="text-white/70 text-xl lg:text-2xl font-light tracking-wide leading-relaxed mb-12 max-w-3xl mx-auto"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Seu laboratório de aventuras calculadas. Gerencie vendas, contatos e negociações com inteligência e precisão.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button variant="primary-red" size="lg" className="min-w-[200px]">
                Começar agora
              </Button>
            </Link>
            <Button variant="ghost" size="lg" className="min-w-[200px]">
              Saiba mais
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 lg:px-12 py-20">
        <div className="max-w-7xl mx-auto">
          <h2 
            className="text-4xl font-light text-white mb-12 text-center"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Recursos Principais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-500">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-light text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Pipeline de Negociações
              </h3>
              <p className="text-white/60 text-sm font-light leading-relaxed">
                Gerencie suas vendas com visualização Kanban e lista, buscas avançadas e filtros personalizados.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-500">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-light text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Gestão de Contatos
              </h3>
              <p className="text-white/60 text-sm font-light leading-relaxed">
                Organize contatos e empresas com campos personalizados e histórico completo de interações.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-500">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-light text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Dashboard e Relatórios
              </h3>
              <p className="text-white/60 text-sm font-light leading-relaxed">
                Acompanhe métricas importantes, taxas de conversão e gere relatórios detalhados.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-500">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-light text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Marketing e BI
              </h3>
              <p className="text-white/60 text-sm font-light leading-relaxed">
                Integrações com Meta Ads e Google Ads para análise completa de campanhas.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-500">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-light text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Tarefas e Atividades
              </h3>
              <p className="text-white/60 text-sm font-light leading-relaxed">
                Organize tarefas dentro de negociações com observações e lembretes.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-500">
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="text-xl font-light text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Personalização Total
              </h3>
              <p className="text-white/60 text-sm font-light leading-relaxed">
                Configure funis, campos personalizados e automações conforme sua necessidade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 lg:px-12 py-20">
        <div className="max-w-4xl mx-auto text-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12">
          <h2 
            className="text-4xl font-light text-white mb-6"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Pronto para começar?
          </h2>
          <p 
            className="text-white/70 text-lg font-light mb-8"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Experimente o Adventure Labs CRM e transforme a forma como você gerencia suas vendas.
          </p>
          <Link to="/login">
            <Button variant="primary-red" size="lg" className="min-w-[200px]">
              Começar agora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 lg:px-12 py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <PulsingLogo />
            <span className="text-white/60 text-sm font-light" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Adventure Labs © 2024
            </span>
          </div>
          <div className="flex gap-6 text-white/60 text-sm font-light">
            <a href="#" className="hover:text-white/80 transition-colors">Termos</a>
            <a href="#" className="hover:text-white/80 transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white/80 transition-colors">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default CRMPage

