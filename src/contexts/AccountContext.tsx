import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { Account } from '@/types'
import { useAccounts } from '@/hooks/useAccounts'

interface AccountContextType {
  currentAccount: Account | null
  setCurrentAccount: (account: Account | null) => void
  loading: boolean
  isMaster: boolean // Se o usuário é master (Adventure)
}

const AccountContext = createContext<AccountContextType | undefined>(undefined)

export const useAccount = () => {
  const context = useContext(AccountContext)
  if (context === undefined) {
    throw new Error('useAccount deve ser usado dentro de um AccountProvider')
  }
  return context
}

interface AccountProviderProps {
  children: ReactNode
}

const ACCOUNT_STORAGE_KEY = 'adventure_current_account_id'

export const AccountProvider = ({ children }: AccountProviderProps) => {
  const { userData } = useAuth()
  const { accounts, loading: accountsLoading } = useAccounts()
  const [currentAccount, setCurrentAccountState] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)

  const isMaster = userData?.isMaster === true

  // Carregar conta salva do localStorage ou selecionar a primeira disponível
  useEffect(() => {
    if (accountsLoading || !userData) {
      setLoading(true)
      return
    }

    // Se não for master, não precisa de conta
    if (!isMaster) {
      setCurrentAccountState(null)
      setLoading(false)
      return
    }

    const savedAccountId = localStorage.getItem(ACCOUNT_STORAGE_KEY)
    
    if (savedAccountId) {
      const savedAccount = accounts.find(a => a.id === savedAccountId && a.active)
      if (savedAccount) {
        setCurrentAccountState(savedAccount)
        setLoading(false)
        return
      } else {
        // Conta salva não existe mais ou está inativa, limpar localStorage
        localStorage.removeItem(ACCOUNT_STORAGE_KEY)
      }
    }

    // Se não há conta salva, selecionar a primeira disponível e ativa
    const activeAccounts = accounts.filter(a => a.active)
    if (activeAccounts.length > 0) {
      const firstAccount = activeAccounts[0]
      setCurrentAccountState(firstAccount)
      localStorage.setItem(ACCOUNT_STORAGE_KEY, firstAccount.id)
    } else {
      // Não há contas ativas
      setCurrentAccountState(null)
    }

    setLoading(false)
  }, [accounts, accountsLoading, userData, isMaster])

  const setCurrentAccount = (account: Account | null) => {
    setCurrentAccountState(account)
    if (account) {
      localStorage.setItem(ACCOUNT_STORAGE_KEY, account.id)
    } else {
      localStorage.removeItem(ACCOUNT_STORAGE_KEY)
    }
  }

  const value: AccountContextType = {
    currentAccount,
    setCurrentAccount,
    loading,
    isMaster,
  }

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
}

