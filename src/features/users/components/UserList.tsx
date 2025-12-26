import { User } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface UserListProps {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (id: string) => void
  loading?: boolean
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  user: 'Usuário',
}

export const UserList = ({ users, onEdit, onDelete, loading }: UserListProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-white/70">Carregando usuários...</div>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/70 mb-4">Nenhum usuário cadastrado.</p>
        <p className="text-white/50 text-sm">Crie usuários para gerenciar permissões e acessos ao sistema.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {users.map(user => (
        <Card key={user.id} variant="elevated">
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-white">{user.name}</h4>
                <p className="text-sm text-white/70 mt-1">{user.email}</p>
              </div>
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                user.role === 'admin'
                  ? 'bg-primary-red/20 text-primary-red'
                  : 'bg-primary-blue/20 text-primary-blue'
              }`}>
                {ROLE_LABELS[user.role]}
              </span>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(user)}
              >
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm('Tem certeza que deseja excluir este usuário?')) {
                    onDelete(user.id)
                  }
                }}
                className="text-red-400 hover:text-red-300"
              >
                Excluir
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

