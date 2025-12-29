import { Logo } from './Logo'
import { UserMenu } from './UserMenu'
import { ProjectSelector } from './ProjectSelector'

export const Header = () => {
  return (
    <header className="h-16 bg-background-darker border-b border-white/10 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <Logo variant="white" size="md" />
      </div>
      
      <div className="flex items-center gap-4">
        <ProjectSelector />
        <UserMenu />
      </div>
    </header>
  )
}

