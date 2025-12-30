import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Toast } from '@/components/ui/Toast'
import { useTenants, TenantWithUsers } from '@/hooks/useTenants'
import { useUsers } from '@/features/users/hooks/useUsers'
import { ProjectUser } from '@/types'
import { usePermissions } from '@/hooks/usePermissions'
import { AdvancedFilter } from '@/components/common/AdvancedFilter'
import { useAdvancedFilter } from '@/hooks/useAdvancedFilter'
import { FilterField } from '@/components/common/AdvancedFilter'

interface TenantFilters {
  search: string
  plan: string[]
  active: string
}

const TenantsPage = () => {
  const { canManageProjects } = usePermissions()
  const { tenants, loading, addUserToTenant, removeUserFromTenant, updateUserTenantPermissions, updateTenant } = useTenants()
  const { users } = useUsers()
  const [selectedTenant, setSelectedTenant] = useState<TenantWithUsers | null>(null)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  })

  const [userFormData, setUserFormData] = useState({
    userId: '',
    role: 'user' as ProjectUser['role'],
    accessLevel: 'full' as ProjectUser['accessLevel'],
  })

  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    plan: 'basic' as 'basic' | 'premium' | 'enterprise',
    active: true,
  })

  const initialFilters: TenantFilters = {
    search: '',
    plan: [],
    active: '',
  }

  const { filters, setFilters, resetFilters } = useAdvancedFilter<TenantFilters>({
    initialFilters,
    persistKey: 'tenants_filters',
  })

  const filterFields: FilterField[] = [
    {
      key: 'plan',
      label: 'Plano',
      type: 'multiselect',
      options: [
        { value: 'basic', label: 'Básico' },
        { value: 'premium', label: 'Premium' },
        { value: 'enterprise', label: 'Enterprise' },
      ],
    },
    {
      key: 'active',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'true', label: 'Ativo' },
        { value: 'false', label: 'Inativo' },
      ],
    },
  ]

  const filteredTenants = tenants.filter(tenant => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch = 
        tenant.name.toLowerCase().includes(searchLower) ||
        tenant.description?.toLowerCase().includes(searchLower)
      if (!matchesSearch) return false
    }

    if (filters.plan && filters.plan.length > 0) {
      if (!filters.plan.includes(tenant.plan)) return false
    }

    if (filters.active) {
      const isActive = filters.active === 'true'
      if (tenant.active !== isActive) return false
    }

    return true
  })

  const handleAddUser = (tenant: TenantWithUsers) => {
    setSelectedTenant(tenant)
    setUserFormData({
      userId: '',
      role: 'user',
      accessLevel: 'full',
    })
    setIsUserModalOpen(true)
  }

  const handleEditTenant = (tenant: TenantWithUsers) => {
    setSelectedTenant(tenant)
    setEditFormData({
      name: tenant.name,
      description: tenant.description || '',
      plan: tenant.plan,
      active: tenant.active,
    })
    setIsEditModalOpen(true)
  }

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTenant) return

    try {
      setFormLoading(true)
      await addUserToTenant(selectedTenant.id, userFormData.userId, userFormData.role, userFormData.accessLevel)
      setToast({ message: 'Usuário adicionado ao tenant com sucesso!', type: 'success', visible: true })
      setIsUserModalOpen(false)
      setSelectedTenant(null)
    } catch (error: any) {
      console.error('Erro ao adicionar usuário:', error)
      setToast({ message: error?.message || 'Erro ao adicionar usuário', type: 'error', visible: true })
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTenant) return

    try {
      setFormLoading(true)
      await updateTenant(selectedTenant.id, editFormData)
      setToast({ message: 'Tenant atualizado com sucesso!', type: 'success', visible: true })
      setIsEditModalOpen(false)
      setSelectedTenant(null)
    } catch (error: any) {
      console.error('Erro ao atualizar tenant:', error)
      setToast({ message: error?.message || 'Erro ao atualizar tenant', type: 'error', visible: true })
    } finally {
      setFormLoading(false)
    }
  }

  const handleRemoveUser = async (projectUserId: string) => {
    if (!confirm('Tem certeza que deseja remover este usuário do tenant?')) {
      return
    }

    try {
      await removeUserFromTenant(projectUserId)
      setToast({ message: 'Usuário removido com sucesso!', type: 'success', visible: true })
    } catch (error: any) {
      console.error('Erro ao remover usuário:', error)
      setToast({ message: 'Erro ao remover usuário', type: 'error', visible: true })
    }
  }

  const handleUpdatePermissions = async (projectUserId: string, role: ProjectUser['role'], accessLevel: ProjectUser['accessLevel']) => {
    try {
      await updateUserTenantPermissions(projectUserId, role, accessLevel)
      setToast({ message: 'Permissões atualizadas com sucesso!', type: 'success', visible: true })
    } catch (error: any) {
      console.error('Erro ao atualizar permissões:', error)
      setToast({ message: 'Erro ao atualizar permissões', type: 'error', visible: true })
    }
  }

  if (!canManageProjects) {
    return (
      <Container>
        <Card>
          <div className="p-12 text-center">
            <h2 className="text-2xl font-semibold text-white mb-2">Acesso Negado</h2>
            <p className="text-white/70">Apenas usuários master podem gerenciar tenants.</p>
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
            <h1 className="text-xl text-white/90 mb-1">Gerenciamento de Tenants</h1>
            <p className="text-white/60 text-sm">Gerencie contas de clientes, projetos e permissões</p>
          </div>
        </div>

        <AdvancedFilter
          filters={filters}
          onFiltersChange={setFilters}
          onReset={resetFilters}
          searchPlaceholder="Buscar por nome ou descrição..."
          fields={filterFields}
        />

        {loading ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-white/70">Carregando tenants...</div>
            </div>
          </Card>
        ) : filteredTenants.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-white/70 mb-4">
                {tenants.length === 0 ? 'Nenhum tenant cadastrado' : 'Nenhum tenant encontrado com os filtros aplicados'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredTenants.map((tenant) => (
              <Card key={tenant.id} variant="elevated">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{tenant.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${
                          tenant.plan === 'basic' ? 'bg-blue-500/20 text-blue-400' :
                          tenant.plan === 'premium' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {tenant.plan === 'basic' ? 'Básico' : tenant.plan === 'premium' ? 'Premium' : 'Enterprise'}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          tenant.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {tenant.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      {tenant.description && (
                        <p className="text-white/70 text-sm mb-4">{tenant.description}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTenant(tenant)}
                    >
                      Editar
                    </Button>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-white/90">Usuários do Tenant</h4>
                      <Button
                        variant="primary-red"
                        size="sm"
                        onClick={() => handleAddUser(tenant)}
                      >
                        + Adicionar Usuário
                      </Button>
                    </div>

                    {tenant.users.length === 0 ? (
                      <p className="text-white/60 text-sm">Nenhum usuário associado</p>
                    ) : (
                      <div className="space-y-2">
                        {tenant.users.map((projectUser) => {
                          const user = projectUser.userData
                          return (
                            <div
                              key={projectUser.id}
                              className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                            >
                              <div className="flex-1">
                                <div className="text-white font-medium">
                                  {user?.name || user?.email || 'Usuário não encontrado'}
                                </div>
                                <div className="text-white/60 text-xs mt-1">
                                  {user?.email}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <select
                                  value={projectUser.role}
                                  onChange={(e) => handleUpdatePermissions(
                                    projectUser.id,
                                    e.target.value as ProjectUser['role'],
                                    projectUser.accessLevel
                                  )}
                                  className="px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-red/50"
                                >
                                  <option value="owner">Owner</option>
                                  <option value="admin">Admin</option>
                                  <option value="user">User</option>
                                  <option value="viewer">Viewer</option>
                                </select>
                                <select
                                  value={projectUser.accessLevel}
                                  onChange={(e) => handleUpdatePermissions(
                                    projectUser.id,
                                    projectUser.role,
                                    e.target.value as ProjectUser['accessLevel']
                                  )}
                                  className="px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-red/50"
                                >
                                  <option value="full">Acesso Total</option>
                                  <option value="limited">Acesso Limitado</option>
                                </select>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveUser(projectUser.id)}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  Remover
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal para adicionar usuário */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false)
          setSelectedTenant(null)
        }}
        title="Adicionar Usuário ao Tenant"
        size="md"
      >
        <form onSubmit={handleUserSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Usuário *
            </label>
            <select
              value={userFormData.userId}
              onChange={(e) => setUserFormData({ ...userFormData, userId: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200"
              required
            >
              <option value="">Selecione um usuário</option>
              {users
                .filter(user => !selectedTenant?.users.some(pu => pu.userId === user.id))
                .map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Função *
            </label>
            <select
              value={userFormData.role}
              onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as ProjectUser['role'] })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200"
              required
            >
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Nível de Acesso *
            </label>
            <select
              value={userFormData.accessLevel}
              onChange={(e) => setUserFormData({ ...userFormData, accessLevel: e.target.value as ProjectUser['accessLevel'] })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200"
              required
            >
              <option value="full">Acesso Total</option>
              <option value="limited">Acesso Limitado</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsUserModalOpen(false)
                setSelectedTenant(null)
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary-red"
              disabled={formLoading || !userFormData.userId}
              className="flex-1"
            >
              {formLoading ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal para editar tenant */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedTenant(null)
        }}
        title="Editar Tenant"
        size="md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Nome do Tenant *
            </label>
            <Input
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              placeholder="Ex: Young Empreendimentos"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Descrição
            </label>
            <textarea
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              placeholder="Descrição do tenant..."
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Plano
            </label>
            <select
              value={editFormData.plan}
              onChange={(e) => setEditFormData({ ...editFormData, plan: e.target.value as any })}
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
              checked={editFormData.active}
              onChange={(e) => setEditFormData({ ...editFormData, active: e.target.checked })}
              className="w-4 h-4 text-primary-red bg-white/5 border-white/10 rounded focus:ring-primary-red/50"
            />
            <label htmlFor="active" className="text-sm text-white/90">
              Tenant ativo
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsEditModalOpen(false)
                setSelectedTenant(null)
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary-red"
              disabled={formLoading || !editFormData.name}
              className="flex-1"
            >
              {formLoading ? 'Salvando...' : 'Salvar'}
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

export default TenantsPage

