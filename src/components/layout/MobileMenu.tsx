import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Icon } from '@/components/icons/Icon'
import { FiMenu, FiX } from 'react-icons/fi'

interface NavItem {
  label: string
  path: string
  icon: keyof typeof import('@/components/icons/Icon').Icons
}

const navItems: NavItem[] = [
  { label: 'Início', path: '/', icon: 'home' },
  { label: 'Dashboard', path: '/dashboard', icon: 'reports' },
  { label: 'Negociações', path: '/deals', icon: 'deals' },
  { label: 'Tarefas', path: '/tasks', icon: 'tasks' },
  { label: 'Propostas', path: '/proposals', icon: 'proposals' },
  { label: 'Contatos', path: '/contacts', icon: 'contacts' },
  { label: 'Empresas', path: '/companies', icon: 'companies' },
  { label: 'Relatórios', path: '/reports', icon: 'reports' },
  { label: 'Marketing', path: '/marketing', icon: 'marketing' },
  { label: 'Configurações', path: '/settings', icon: 'user' },
]

export const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const menuRef = useRef<HTMLDivElement>(null)

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleLinkClick = () => {
    setIsOpen(false)
  }

  return (
    <div className="lg:hidden relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded hover:bg-white/5 transition-all"
        aria-label="Menu"
      >
        {isOpen ? (
          <FiX className="w-5 h-5 text-white/90" />
        ) : (
          <FiMenu className="w-5 h-5 text-white/90" />
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="fixed top-16 left-0 right-0 bottom-0 bg-background-darker border-r border-white/5 z-50 overflow-y-auto">
            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleLinkClick}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all duration-200
                      ${
                        isActive
                          ? 'bg-white/10 text-white border-l-2 border-primary-blue'
                          : 'text-white/60 hover:text-white/90 hover:bg-white/5'
                      }
                    `}
                  >
                    <Icon 
                      name={item.icon} 
                      size={18} 
                      className={isActive ? 'text-white' : 'text-white/60'}
                    />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </>
      )}
    </div>
  )
}

