import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Toast } from '@/components/ui/Toast'
import { ProjectMemberForm } from '../components/ProjectMemberForm'
import { ProjectMemberList } from '../components/ProjectMemberList'
import { useProjectMembers } from '../hooks/useProjectMembers'
import { ProjectMember } from '@/types'

const ProjectMembersPage = () => {
  const { members, loading, createMember, updateMember, deleteMember } = useProjectMembers()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<ProjectMember | undefined>()
  const [formLoading, setFormLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  })

  const handleCreateNew = () => {
    setSelectedMember(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (member: ProjectMember) => {
    setSelectedMember(member)
    setIsModalOpen(true)
  }

  const handleSubmit = async (data: any) => {
    try {
      setFormLoading(true)
      if (selectedMember) {
        await updateMember(selectedMember.id, data)
        setToast({ message: 'Responsável atualizado com sucesso!', type: 'success', visible: true })
      } else {
        await createMember(data)
        setToast({ message: 'Responsável criado com sucesso!', type: 'success', visible: true })
      }
      setIsModalOpen(false)
      setSelectedMember(undefined)
    } catch (error: any) {
      console.error('Erro ao salvar responsável:', error)
      setToast({ message: error?.message || 'Erro ao salvar responsável', type: 'error', visible: true })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMember(id)
      setToast({ message: 'Responsável excluído com sucesso!', type: 'success', visible: true })
    } catch (error) {
      setToast({ message: 'Erro ao excluir responsável', type: 'error', visible: true })
    }
  }

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Responsáveis</h1>
            <p className="text-white/70">Gerencie os responsáveis e colaboradores do projeto</p>
          </div>
          <Button variant="primary-red" onClick={handleCreateNew}>
            + Novo Responsável
          </Button>
        </div>

        <ProjectMemberList
          members={members}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedMember(undefined)
        }}
        title={selectedMember ? 'Editar Responsável' : 'Novo Responsável'}
        size="md"
      >
        <ProjectMemberForm
          member={selectedMember}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false)
            setSelectedMember(undefined)
          }}
          loading={formLoading}
        />
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

export default ProjectMembersPage

