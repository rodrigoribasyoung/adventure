import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { FiUser, FiSettings, FiBell, FiCreditCard, FiUsers, FiLogOut } from 'react-icons/fi'

export const UserMenu = () => {
  const { userData, signOut } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
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
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const menuItems = [
    { label: 'Perfil', path: '/profile', icon: FiUser },
    { label: 'Configurações', path: '/settings', icon: FiSettings },
    { label: 'Notificações', path: '/notifications', icon: FiBell },
    { label: 'Gerenciar Plano', path: '/settings/plan', icon: FiCreditCard },
    { label: 'Usuários', path: '/settings/users', icon: FiUsers, adminOnly: true },
  ]

  // Obter iniciais do nome para avatar
  const getInitials = (name: string) => {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const avatarText = userData?.name ? getInitials(userData.name) : 'U'

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 transition-all"
      >
        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white text-xs">
          {avatarText}
        </div>
        <span className="text-white/70 text-xs hidden sm:block">
          {userData?.name || 'Usuário'}
        </span>
        <svg
          className={`w-4 h-4 text-white/70 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-background-darker border border-white/10 rounded shadow-lg z-50 overflow-hidden">
          <div className="p-3 border-b border-white/5">
            <p className="text-white text-sm">{userData?.name || 'Usuário'}</p>
            <p className="text-white/60 text-xs">{userData?.email}</p>
          </div>
          
          <div className="py-1">
            {menuItems.map((item) => {
              // Verificar se é admin only (por enquanto mostrar todos)
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path)
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm text-white/70 hover:bg-white/5 hover:text-white transition-all"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>

          <div className="border-t border-white/5 p-1">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm text-red-400/80 hover:bg-red-500/10 transition-all rounded"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

