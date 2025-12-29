import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'

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
    { label: 'Perfil', path: '/profile', icon: '👤' },
    { label: 'Configurações', path: '/settings', icon: '⚙️' },
    { label: 'Notificações', path: '/notifications', icon: '🔔' },
    { label: 'Gerenciar Plano', path: '/settings/plan', icon: '💳' },
    { label: 'Usuários', path: '/settings/users', icon: '👥', adminOnly: true },
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
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-combined flex items-center justify-center text-white text-sm font-semibold">
          {avatarText}
        </div>
        <span className="text-white/80 text-sm hidden sm:block">
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
        <div className="absolute right-0 mt-2 w-56 bg-background-darker border border-white/20 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <p className="text-white font-semibold">{userData?.name || 'Usuário'}</p>
            <p className="text-white/70 text-sm">{userData?.email}</p>
          </div>
          
          <div className="py-2">
            {menuItems.map((item) => {
              // Verificar se é admin only (por enquanto mostrar todos)
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path)
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-white/80 hover:bg-white/10 hover:text-white transition-all"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>

          <div className="border-t border-white/10 p-2">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-red-400 hover:bg-red-500/10 transition-all rounded-lg"
            >
              <span className="text-lg">🚪</span>
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

