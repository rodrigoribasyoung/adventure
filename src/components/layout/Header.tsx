import { Logo } from './Logo'
import { Button } from '../ui/Button'
import { useAuth } from '@/contexts/AuthContext'

export const Header = () => {
  const { userData, signOut } = useAuth()

  return (
    <header className="h-16 bg-background-darker border-b border-white/10 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <Logo variant="white" size="md" />
      </div>
      
      <div className="flex items-center gap-4">
        {userData && (
          <span className="text-white/80 text-sm">
            {userData.name}
          </span>
        )}
        <Button variant="ghost" size="sm" onClick={signOut}>
          Sair
        </Button>
      </div>
    </header>
  )
}

