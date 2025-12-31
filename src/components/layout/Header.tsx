import { Logo } from './Logo'
import { UserMenu } from './UserMenu'
import { ProjectSelector } from './ProjectSelector'
import { MobileMenu } from './MobileMenu'
import { Link, useLocation } from 'react-router-dom'
import { useProject } from '@/contexts/ProjectContext'

interface TabItem {
  label: string
  path: string
}

const baseTabs: TabItem[] = [
  { label: 'Início', path: '/' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Negociações', path: '/deals' },
  { label: 'Tarefas', path: '/tasks' },
  // { label: 'Propostas', path: '/proposals' }, // Temporariamente oculto - será reativado posteriormente
  { label: 'Contatos', path: '/contacts' },
  { label: 'Empresas', path: '/companies' },
  { label: 'Relatórios', path: '/reports' },
  { label: 'Marketing', path: '/marketing' },
]

export const Header = () => {
  const location = useLocation()
  
  // Relatórios de Cliente foi movido para dentro da página de Relatórios
  const tabs = baseTabs

  // Verificar se a rota atual corresponde a uma aba
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

      return (
        <header className="h-16 bg-background-darker border-b border-white/5 flex items-center justify-between px-4 shadow-lg shadow-black/20 relative z-20">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-shrink-0">
          <Logo variant="white" size="md" />
          <span className="text-white font-bold text-sm hidden sm:block">CRM</span>
        </div>
        
        {/* Abas de navegação - Desktop */}
        <nav className="hidden lg:flex items-center flex-1 overflow-x-auto min-w-0 relative">
          <div className="flex items-center">
            {tabs.map((tab) => {
              const active = isActive(tab.path)
              const isMarketingInactive = tab.path === '/marketing' && !active
              
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`
                    relative px-3 py-1.5 text-sm whitespace-nowrap
                    transition-all duration-300 ease-out
                    ${
                      active
                        ? 'text-white/90'
                        : isMarketingInactive
                        ? 'text-white/30 hover:text-white/50'
                        : 'text-white/60 hover:text-white/90'
                    }
                  `}
                  style={{
                    transitionDelay: active ? '0ms' : '50ms'
                  }}
                >
                  {/* Background contínuo */}
                  <span className={`
                    absolute inset-0 rounded transition-all duration-300 ease-out
                    ${
                      active
                        ? 'bg-white/10'
                        : 'bg-transparent hover:bg-white/5'
                    }
                  `} />
                  
                  {/* Texto */}
                  <span className="relative z-10">{tab.label}</span>
                  
                  {/* Linha inferior para tab ativa */}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-blue transition-all duration-300" />
                  )}
                </Link>
              )
            })}
          </div>
        </nav>
        
        <MobileMenu />
      </div>
      
      <div className="flex items-center gap-6 flex-shrink-0">
        <Link
          to="/settings"
          className={`
            px-3 py-1.5 text-sm transition-all duration-200 whitespace-nowrap rounded
            ${
              location.pathname.startsWith('/settings')
                ? 'text-white/90 bg-white/10'
                : 'text-white/60 hover:text-white/90 hover:bg-white/5'
            }
          `}
        >
          Configurações
        </Link>
        <ProjectSelector />
        <UserMenu />
      </div>
    </header>
  )
}
