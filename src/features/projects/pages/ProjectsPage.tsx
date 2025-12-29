import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { useProjects } from '@/hooks/useProjects'
import { useProject } from '@/contexts/ProjectContext'
import { Project } from '@/types'
import { Toast } from '@/components/ui/Toast'

const ProjectsPage = () => {
  const { projects, loading, createProject, updateProject, deleteProject, refetch } = useProjects()
  const { currentProject, setCurrentProject, isMaster } = useProject()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | undefined>()
  const [formLoading, setFormLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    plan: 'basic' as 'basic' | 'premium' | 'enterprise',
    active: true,
  })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  })

  // Se não for master e já tiver projetos, restringir acesso
  if (!isMaster && projects.length > 0) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card>
            <div className="text-center py-12">
              <p className="text-white/70 mb-4">Acesso restrito</p>
              <p className="text-white/50 text-sm">Apenas administradores podem gerenciar projetos</p>
            </div>
          </Card>
        </div>
      </Container>
    )
  }

  const handleCreateNew = () => {
    setSelectedProject(undefined)
    setFormData({
      name: '',
      description: '',
      plan: 'basic',
      active: true,
    })
    setIsModalOpen(true)
  }

  const handleEdit = (project: Project) => {
    setSelectedProject(project)
    setFormData({
      name: project.name,
      description: project.description || '',
      plan: project.plan,
      active: project.active,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setFormLoading(true)
      if (selectedProject) {
        await updateProject(selectedProject.id, formData)
        setToast({ message: 'Projeto atualizado com sucesso!', type: 'success', visible: true })
      } else {
        const newProjectId = await createProject(formData)
        
        // Recarregar projetos
        await refetch()
        
        // Aguardar um pouco para garantir que o estado foi atualizado
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Buscar o projeto recém-criado na lista atualizada
        const newProject = projects.find(p => p.id === newProjectId)
        if (newProject) {
          setCurrentProject(newProject)
          setToast({ message: `Projeto "${newProject.name}" criado e selecionado!`, type: 'success', visible: true })
        } else {
          setToast({ message: 'Projeto criado com sucesso!', type: 'success', visible: true })
        }
      }
      setIsModalOpen(false)
      setSelectedProject(undefined)
    } catch (error: any) {
      console.error('[ProjectsPage] Erro ao salvar projeto:', error)
      const errorMessage = error?.message || 'Erro ao salvar projeto'
      setToast({ message: errorMessage, type: 'error', visible: true })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.')) {
      return
    }
    try {
      await deleteProject(id)
      if (currentProject?.id === id) {
        setCurrentProject(null)
      }
      setToast({ message: 'Projeto excluído com sucesso!', type: 'success', visible: true })
    } catch (error: any) {
      console.error('[ProjectsPage] Erro ao excluir projeto:', error)
      setToast({ message: 'Erro ao excluir projeto', type: 'error', visible: true })
    }
  }

  const handleSelectProject = (project: Project) => {
    setCurrentProject(project)
    setToast({ message: `Projeto "${project.name}" selecionado!`, type: 'success', visible: true })
  }

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Projetos</h1>
            <p className="text-white/70">Gerencie os projetos e clientes do sistema</p>
          </div>
          <Button variant="primary-red" onClick={handleCreateNew}>
            + Novo Projeto
          </Button>
        </div>

        {loading ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-white/70">Carregando projetos...</div>
            </div>
          </Card>
        ) : projects.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-white/70 mb-4">Nenhum projeto cadastrado</p>
              <Button variant="primary-red" onClick={handleCreateNew}>
                Criar Primeiro Projeto
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                variant="elevated"
                className={`cursor-pointer transition-all ${
                  currentProject?.id === project.id
                    ? 'border-primary-blue border-2'
                    : 'hover:border-primary-red/50'
                }`}
                onClick={() => handleSelectProject(project)}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{project.name}</h3>
                      {project.description && (
                        <p className="text-white/70 text-sm">{project.description}</p>
                      )}
                    </div>
                    {currentProject?.id === project.id && (
                      <span className="px-2 py-1 bg-primary-blue/20 text-primary-blue text-xs rounded">
                        Ativo
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      project.plan === 'basic' ? 'bg-blue-500/20 text-blue-400' :
                      project.plan === 'premium' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {project.plan === 'basic' ? 'Básico' : project.plan === 'premium' ? 'Premium' : 'Enterprise'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      project.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {project.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-white/10">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEdit(project)
                      }}
                      className="flex-1"
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(project.id)
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
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedProject(undefined)
        }}
        title={selectedProject ? 'Editar Projeto' : 'Novo Projeto'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Nome do Projeto *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Young Empreendimentos"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição do projeto..."
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Plano
            </label>
            <select
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value as any })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200"
            >
              <option value="basic">Básico</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 text-primary-red bg-white/5 border-white/10 rounded focus:ring-primary-red/50"
            />
            <label htmlFor="active" className="text-sm text-white/90">
              Projeto ativo
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsModalOpen(false)
                setSelectedProject(undefined)
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary-red"
              disabled={formLoading || !formData.name}
              className="flex-1"
            >
              {formLoading ? 'Salvando...' : selectedProject ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </Container>
  )
}

export default ProjectsPage

