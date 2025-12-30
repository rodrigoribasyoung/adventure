import { Logo } from './Logo'
import { UserMenu } from './UserMenu'
import { ProjectSelector } from './ProjectSelector'
import { MobileMenu } from './MobileMenu'
import { Link, useLocation } from 'react-router-dom'

interface TabItem {
  label: string
  path: string
}

const tabs: TabItem[] = [
  { label: 'Início', path: '/' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Negociações', path: '/deals' },
  { label: 'Tarefas', path: '/tasks' },
  { label: 'Propostas', path: '/proposals' },
  { label: 'Contatos', path: '/contacts' },
  { label: 'Empresas', path: '/companies' },
  { label: 'Relatórios', path: '/reports' },
  { label: 'Marketing', path: '/marketing' },
]

export const Header = () => {
  const location = useLocation()

  // Verificar se a rota atual corresponde a uma aba
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/dashboard'
    }
    return location.pathname.startsWith(path)
  }

      return (
        <header className="h-16 bg-background-darker border-b border-white/5 flex items-center justify-between px-4 shadow-lg shadow-black/20">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-shrink-0">
          <Logo variant="white" size="md" />
          <span className="text-white/60 text-sm hidden sm:block">CRM</span>
        </div>
        
        {/* Abas de navegação - Desktop */}
        <nav className="hidden lg:flex items-center gap-1 flex-1 overflow-x-auto min-w-0">
          {tabs.map((tab) => {
            const active = isActive(tab.path)
            const isMarketingInactive = tab.path === '/marketing' && !active
            
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`
                  px-3 py-1.5 text-sm transition-all duration-200 whitespace-nowrap rounded
                  ${
                    active
                      ? 'text-white/90 bg-white/10'
                      : isMarketingInactive
                      ? 'text-white/30 hover:text-white/50 hover:bg-white/5'
                      : 'text-white/60 hover:text-white/90 hover:bg-white/5'
                  }
                `}
              >
                {tab.label}
              </Link>
            )
          })}
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
