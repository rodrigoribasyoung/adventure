import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { UserForm } from '../components/UserForm'
import { UserList } from '../components/UserList'
import { useUsers } from '../hooks/useUsers'
import { User } from '@/types'
import { Toast } from '@/components/ui/Toast'
import { usePermissions } from '@/hooks/usePermissions'

const UsersPage = () => {
  const { canManageUsers } = usePermissions()
  const { users, loading, createUser, updateUser, deleteUser } = useUsers()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | undefined>()
  const [formLoading, setFormLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  })

  const handleCreateNew = () => {
    setSelectedUser(undefined)
    setIsFormOpen(true)
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setIsFormOpen(true)
  }

  const handleSubmit = async (data: any) => {
    try {
      setFormLoading(true)
      if (selectedUser) {
        await updateUser(selectedUser.id, data)
        setToast({ message: 'Usuário atualizado com sucesso!', type: 'success', visible: true })
      } else {
        await createUser(data)
        setToast({ message: 'Usuário criado com sucesso!', type: 'success', visible: true })
      }
      setIsFormOpen(false)
      setSelectedUser(undefined)
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error)
      setToast({ message: error.message || 'Erro ao salvar usuário', type: 'error', visible: true })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id)
      setToast({ message: 'Usuário excluído com sucesso!', type: 'success', visible: true })
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error)
      setToast({ message: 'Erro ao excluir usuário', type: 'error', visible: true })
    }
  }

  if (!canManageUsers) {
    return (
      <Container>
        <Card>
          <div className="p-12 text-center">
            <h2 className="text-2xl font-semibold text-white mb-2">Acesso Negado</h2>
            <p className="text-white/70">Você não tem permissão para acessar esta página.</p>
          </div>
        </Card>
      </Container>
    )
  }

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Usuários</h1>
            <p className="text-white/70">Gerencie usuários e permissões do sistema</p>
          </div>
          <Button variant="primary-red" onClick={handleCreateNew}>
            + Novo Usuário
          </Button>
        </div>

        <Card>
          <UserList
            users={users}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
          />
        </Card>
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setSelectedUser(undefined)
        }}
        title={selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
        size="md"
      >
        <UserForm
          user={selectedUser}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsFormOpen(false)
            setSelectedUser(undefined)
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

export default UsersPage

