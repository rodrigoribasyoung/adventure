import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { useActivityHistory } from '../hooks/useActivityHistory'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { FiCheckCircle, FiEdit, FiTrash2, FiArrowRight, FiUser, FiTarget, FiUsers, FiBriefcase, FiFileText, FiSettings } from 'react-icons/fi'

const ActivityHistoryPage = () => {
  const { history, loading } = useActivityHistory(200)

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <FiCheckCircle className="w-4 h-4 text-green-400" />
      case 'updated':
        return <FiEdit className="w-4 h-4 text-blue-400" />
      case 'deleted':
        return <FiTrash2 className="w-4 h-4 text-red-400" />
      case 'closed':
        return <FiCheckCircle className="w-4 h-4 text-green-400" />
      case 'reopened':
        return <FiArrowRight className="w-4 h-4 text-blue-400" />
      case 'stage_changed':
        return <FiArrowRight className="w-4 h-4 text-purple-400" />
      case 'status_changed':
        return <FiArrowRight className="w-4 h-4 text-yellow-400" />
      default:
        return <FiEdit className="w-4 h-4 text-white/60" />
    }
  }

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'deal':
        return <FiBriefcase className="w-4 h-4" />
      case 'contact':
        return <FiUser className="w-4 h-4" />
      case 'company':
        return <FiUsers className="w-4 h-4" />
      case 'task':
        return <FiCheckCircle className="w-4 h-4" />
      case 'proposal':
        return <FiFileText className="w-4 h-4" />
      case 'service':
        return <FiSettings className="w-4 h-4" />
      case 'funnel':
        return <FiTarget className="w-4 h-4" />
      default:
        return <FiEdit className="w-4 h-4" />
    }
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      created: 'Criou',
      updated: 'Atualizou',
      deleted: 'Excluiu',
      closed: 'Fechou',
      reopened: 'Reabriu',
      stage_changed: 'Mudou estágio de',
      status_changed: 'Mudou status de',
      assigned: 'Atribuiu',
      unassigned: 'Removeu atribuição de',
    }
    return labels[action] || action
  }

  const getEntityLabel = (entityType: string) => {
    const labels: Record<string, string> = {
      deal: 'Negociação',
      contact: 'Contato',
      company: 'Empresa',
      task: 'Tarefa',
      proposal: 'Proposta',
      service: 'Serviço',
      funnel: 'Funil',
      user: 'Usuário',
      project: 'Projeto',
    }
    return labels[entityType] || entityType
  }

  if (loading) {
    return (
      <Container>
        <div className="flex items-center justify-center py-12">
          <div className="text-white/70">Carregando histórico...</div>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl text-white/90 mb-1">Histórico de Ações</h1>
          <p className="text-white/60 text-sm">Acompanhe todas as ações realizadas no sistema</p>
        </div>

        {history.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-white/70">Nenhuma ação registrada ainda</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {history.map((activity) => (
              <Card key={activity.id} variant="elevated" className="p-3">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getActionIcon(activity.action)}
                      {getEntityIcon(activity.entityType)}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/90 truncate">
                          {activity.userName}
                        </p>
                        <p className="text-xs text-white/60 truncate">
                          {getActionLabel(activity.action)} {getEntityLabel(activity.entityType).toLowerCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-white/80 font-medium truncate" title={activity.entityName}>
                    {activity.entityName}
                  </p>
                  
                  {activity.details && Object.keys(activity.details).length > 0 && (
                    <div className="text-xs text-white/50">
                      {Object.entries(activity.details).slice(0, 2).map(([key, value]) => (
                        <div key={key} className="truncate">
                          {key}: {String(value)}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-white/40">
                    {format(activity.createdAt.toDate(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}

export default ActivityHistoryPage

