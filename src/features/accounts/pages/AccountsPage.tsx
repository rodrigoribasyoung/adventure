import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { useAccounts } from '@/hooks/useAccounts'
import { useAccount } from '@/contexts/AccountContext'
import { Account } from '@/types'
import { Toast } from '@/components/ui/Toast'
import { getDocument } from '@/lib/firebase/db'

const AccountsPage = () => {
  const { accounts, loading, createAccount, updateAccount, deleteAccount, refetch } = useAccounts()
  const { currentAccount, setCurrentAccount, isMaster } = useAccount()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | undefined>()
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

  // Apenas master pode acessar
  if (!isMaster) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card>
            <div className="text-center py-12">
              <p className="text-white/70 mb-4">Acesso restrito</p>
              <p className="text-white/50 text-sm">Apenas usuários master podem gerenciar contas</p>
            </div>
          </Card>
        </div>
      </Container>
    )
  }

  const handleCreateNew = () => {
    setSelectedAccount(undefined)
    setFormData({
      name: '',
      description: '',
      plan: 'basic',
      active: true,
    })
    setIsModalOpen(true)
  }

  const handleEdit = (account: Account) => {
    setSelectedAccount(account)
    setFormData({
      name: account.name,
      description: account.description || '',
      plan: account.plan,
      active: account.active,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setFormLoading(true)
      if (selectedAccount) {
        await updateAccount(selectedAccount.id, formData)
        setToast({ message: 'Conta atualizada com sucesso!', type: 'success', visible: true })
      } else {
        const newAccountId = await createAccount(formData)
        
        // Buscar a conta recém-criada diretamente do Firestore
        try {
          const newAccount = await getDocument<Account>('accounts', newAccountId)
          if (newAccount) {
            setCurrentAccount(newAccount)
            setToast({ message: `Conta "${newAccount.name}" criada e selecionada!`, type: 'success', visible: true })
          } else {
            setToast({ message: 'Conta criada com sucesso!', type: 'success', visible: true })
          }
        } catch (error) {
          console.error('Erro ao buscar conta criada:', error)
          setToast({ message: 'Conta criada! Recarregando...', type: 'success', visible: true })
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        }
        
        // Recarregar lista de contas em background
        refetch()
      }
      setIsModalOpen(false)
      setSelectedAccount(undefined)
    } catch (error: any) {
      console.error('[AccountsPage] Erro ao salvar conta:', error)
      const errorMessage = error?.message || 'Erro ao salvar conta'
      setToast({ message: errorMessage, type: 'error', visible: true })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita e todos os projetos desta conta também serão afetados.')) {
      return
    }
    try {
      await deleteAccount(id)
      if (currentAccount?.id === id) {
        setCurrentAccount(null)
      }
      setToast({ message: 'Conta excluída com sucesso!', type: 'success', visible: true })
    } catch (error: any) {
      console.error('[AccountsPage] Erro ao excluir conta:', error)
      setToast({ message: 'Erro ao excluir conta', type: 'error', visible: true })
    }
  }

  const handleSelectAccount = (account: Account) => {
    setCurrentAccount(account)
    setToast({ message: `Conta "${account.name}" selecionada!`, type: 'success', visible: true })
  }

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Contas</h1>
            <p className="text-white/70">Gerencie as contas (clientes) do sistema</p>
          </div>
          <Button variant="primary-red" onClick={handleCreateNew}>
            + Nova Conta
          </Button>
        </div>

        {loading ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-white/70">Carregando contas...</div>
            </div>
          </Card>
        ) : accounts.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-white/70 mb-4">Nenhuma conta cadastrada</p>
              <Button variant="primary-red" onClick={handleCreateNew}>
                Criar Primeira Conta
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <Card
                key={account.id}
                variant="elevated"
                className={`cursor-pointer transition-all ${
                  currentAccount?.id === account.id
                    ? 'border-primary-blue border-2'
                    : 'hover:border-primary-red/50'
                }`}
                onClick={() => handleSelectAccount(account)}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{account.name}</h3>
                      {account.description && (
                        <p className="text-white/70 text-sm">{account.description}</p>
                      )}
                    </div>
                    {currentAccount?.id === account.id && (
                      <span className="px-2 py-1 bg-primary-blue/20 text-primary-blue text-xs rounded">
                        Ativa
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      account.plan === 'basic' ? 'bg-blue-500/20 text-blue-400' :
                      account.plan === 'premium' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {account.plan === 'basic' ? 'Básico' : account.plan === 'premium' ? 'Premium' : 'Enterprise'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      account.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {account.active ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-white/10">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEdit(account)
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
                        handleDelete(account.id)
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
          setSelectedAccount(undefined)
        }}
        title={selectedAccount ? 'Editar Conta' : 'Nova Conta'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Nome da Conta *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Cliente ABC"
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
              placeholder="Descrição da conta..."
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
              Conta ativa
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsModalOpen(false)
                setSelectedAccount(undefined)
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
              {formLoading ? 'Salvando...' : selectedAccount ? 'Atualizar' : 'Criar'}
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

export default AccountsPage

