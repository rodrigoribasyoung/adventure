import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useProject } from '@/contexts/ProjectContext'
import { useProjects } from '@/hooks/useProjects'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/components/icons/Icon'

export const NoProjectSelected = () => {
  const { isMaster } = useProject()
  const { projects, loading } = useProjects()
  const navigate = useNavigate()

  if (loading) {
    return (
      <Container>
        <Card>
          <div className="text-center py-12">
            <div className="text-white/70">Carregando projetos...</div>
          </div>
        </Card>
      </Container>
    )
  }

  return (
    <Container>
      <Card>
        <div className="text-center py-12">
          <div className="mb-6 flex justify-center">
            <Icon name="project" className="w-16 h-16 text-primary-red" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Nenhum projeto selecionado
          </h2>
          <p className="text-white/70 mb-6 max-w-md mx-auto">
            {projects.length === 0
              ? 'Você precisa criar um projeto para começar a usar o sistema.'
              : 'Selecione um projeto no menu superior ou crie um novo projeto.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isMaster && (
              <Button
                variant="primary-red"
                onClick={() => navigate('/projects')}
              >
                <Icon name="project" className="mr-2" />
                {projects.length === 0 ? 'Criar Primeiro Projeto' : 'Gerenciar Projetos'}
              </Button>
            )}
            {projects.length > 0 && !isMaster && (
              <Button
                variant="primary-blue"
                onClick={() => {
                  // Selecionar o primeiro projeto disponível
                  if (projects.length > 0) {
                    // O ProjectContext deve selecionar automaticamente, mas vamos forçar
                    window.location.reload()
                  }
                }}
              >
                Recarregar Página
              </Button>
            )}
          </div>
        </div>
      </Card>
    </Container>
  )
}

