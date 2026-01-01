import { ProjectResponsible } from '../hooks/useProjectUsers'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface ProjectMemberListProps {
  members: ProjectResponsible[]
  loading: boolean
  onEdit: (member: ProjectResponsible) => void
  onDelete: (id: string) => void
}

export const ProjectMemberList = ({ members, loading, onEdit, onDelete }: ProjectMemberListProps) => {
  if (loading) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="text-white/70">Carregando responsáveis...</div>
        </div>
      </Card>
    )
  }

  if (members.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-white/70 mb-4">Nenhum responsável cadastrado</p>
          <p className="text-white/50 text-sm">Adicione responsáveis para atribuir a negociações e tarefas</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map((member) => (
        <Card key={member.id} variant="elevated">
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">{member.name}</h3>
                {member.jobTitle && (
                  <p className="text-white/70 text-sm">{member.jobTitle}</p>
                )}
              </div>
              {member.active ? (
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                  Ativo
                </span>
              ) : (
                <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                  Inativo
                </span>
              )}
            </div>

            <div className="space-y-1 mb-4">
              {member.email && (
                <p className="text-white/60 text-sm">
                  <span className="text-white/40">Email:</span> {member.email}
                </p>
              )}
              {member.phone && (
                <p className="text-white/60 text-sm">
                  <span className="text-white/40">Telefone:</span> {member.phone}
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-3 border-t border-white/10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(member)}
                className="flex-1"
              >
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm(`Tem certeza que deseja excluir ${member.name}?`)) {
                    onDelete(member.id)
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


