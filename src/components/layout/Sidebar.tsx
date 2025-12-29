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
    <aside className="w-64 bg-background-darker border-r border-white/10 h-full">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                block px-4 py-2.5 rounded-lg transition-all duration-200
                ${
                  isActive
                    ? 'bg-gradient-blue text-white glow-blue'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
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

