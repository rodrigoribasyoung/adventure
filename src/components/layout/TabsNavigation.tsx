import { Link, useLocation } from 'react-router-dom'

interface TabItem {
  label: string
  path: string
  icon: string
}

const tabs: TabItem[] = [
  { label: 'Início', path: '/', icon: '🏠' },
  { label: 'Negociações', path: '/deals', icon: '💼' },
  { label: 'Serviços', path: '/services', icon: '⚙️' },
  { label: 'Empresas', path: '/companies', icon: '🏢' },
  { label: 'Contatos', path: '/contacts', icon: '👥' },
  { label: 'Tarefas', path: '/tasks', icon: '✅' },
  { label: 'Relatórios', path: '/reports', icon: '📊' },
  { label: 'Marketing', path: '/marketing', icon: '📈' },
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
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

