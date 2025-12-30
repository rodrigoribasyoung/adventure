import { Link, useLocation } from 'react-router-dom'
import { Icon } from '@/components/icons/Icon'

interface TabItem {
  label: string
  path: string
  icon: keyof typeof import('@/components/icons/Icon').Icons
}

const tabs: TabItem[] = [
  { label: 'Início', path: '/', icon: 'home' },
  { label: 'Dashboard', path: '/dashboard', icon: 'reports' },
  { label: 'Projetos', path: '/projects', icon: 'project' },
  { label: 'Empresas', path: '/companies', icon: 'companies' },
  { label: 'Contatos', path: '/contacts', icon: 'contacts' },
  { label: 'Negociações', path: '/deals', icon: 'deals' },
  { label: 'Tarefas', path: '/tasks', icon: 'tasks' },
  { label: 'Serviços', path: '/services', icon: 'services' },
  { label: 'Propostas', path: '/proposals', icon: 'proposals' },
  { label: 'Responsáveis', path: '/project-members', icon: 'contacts' },
]

export const TabsNavigation = () => {
  const location = useLocation()

  // Verificar se a rota atual corresponde a uma aba
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="bg-background-darker border-b border-white/10 overflow-x-auto">
      <div className="flex items-center gap-1 px-4">
        {tabs.map((tab) => {
          const active = isActive(tab.path)
          // Marketing inativo usa 30% de transparência
          const isMarketingInactive = tab.path === '/marketing' && !active
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200
                whitespace-nowrap
                ${
                  active
                    ? 'text-white border-b-2 border-primary-red bg-white/5'
                    : isMarketingInactive
                    ? 'text-white/30 hover:text-white/50 hover:bg-white/5'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <Icon 
                name={tab.icon} 
                size={18} 
                className={
                  active 
                    ? 'text-white' 
                    : isMarketingInactive 
                    ? 'text-white/30' 
                    : 'text-white/70'
                } 
              />
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

