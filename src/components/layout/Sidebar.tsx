import { Link, useLocation } from 'react-router-dom'

interface NavItem {
  label: string
  path: string
  icon?: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/' },
  { label: 'Negociações', path: '/deals' },
  { label: 'Contatos', path: '/contacts' },
  { label: 'Empresas', path: '/companies' },
  { label: 'Serviços', path: '/services' },
  { label: 'Relatórios', path: '/reports' },
  { label: 'Marketing', path: '/marketing' },
  { label: 'Configurações', path: '/settings' },
  { label: 'Ajuda', path: '/help' },
]

export const Sidebar = () => {
  const location = useLocation()

  return (
    <aside className="w-56 bg-background-darker border-r border-white/5 h-full">
      <nav className="p-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                block px-3 py-1.5 rounded text-sm transition-all duration-200
                ${
                  isActive
                    ? 'bg-white/10 text-white border-l-2 border-primary-blue'
                    : 'text-white/60 hover:text-white/90 hover:bg-white/5'
                }
              `}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

