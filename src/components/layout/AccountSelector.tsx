import { useState, useRef, useEffect } from 'react'
import { useAccount } from '@/contexts/AccountContext'
import { useAccounts } from '@/hooks/useAccounts'
import { Account } from '@/types'
import { FiBriefcase, FiSettings } from 'react-icons/fi'

export const AccountSelector = () => {
  const { currentAccount, setCurrentAccount, isMaster } = useAccount()
  const { accounts, loading } = useAccounts()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelectAccount = (account: Account) => {
    setCurrentAccount(account)
    setIsOpen(false)
  }

  // Apenas master vê o seletor de conta
  if (!isMaster) {
    return null
  }

  if (loading) {
    return (
      <div className="px-3 py-2 text-white/50 text-sm">
        Carregando...
      </div>
    )
  }

  if (accounts.length === 0) {
    return (
      <div className="px-3 py-2 text-white/50 text-sm">
        Nenhuma conta
      </div>
    )
  }
  
  // Se há contas mas nenhuma está selecionada, mostrar aviso
  if (!currentAccount && accounts.length > 0) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => {
            // Selecionar a primeira conta automaticamente
            if (accounts.length > 0) {
              handleSelectAccount(accounts[0])
            }
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-all text-sm font-medium"
        >
          <FiBriefcase className="w-4 h-4" />
          <span className="hidden sm:block">Selecionar Conta</span>
        </button>
      </div>
    )
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-all text-white/80 hover:text-white"
      >
        <FiBriefcase className="w-4 h-4" />
        <span className="text-sm font-medium hidden sm:block">
          {currentAccount?.name || 'Selecione uma conta'}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-background-darker border border-white/20 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-2">
            {accounts.map((account) => {
              const isSelected = currentAccount?.id === account.id
              return (
                <button
                  key={account.id}
                  onClick={() => handleSelectAccount(account)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-lg
                    transition-all text-left
                    ${
                      isSelected
                        ? 'bg-primary-blue/20 text-white border border-primary-blue/40'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <div className="flex-1">
                    <div className="font-medium">{account.name}</div>
                    {account.plan && (
                      <div className="text-xs text-white/60 mt-1">
                        Plano: {account.plan === 'basic' ? 'Básico' : account.plan === 'premium' ? 'Premium' : 'Enterprise'}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <span className="text-primary-blue">✓</span>
                  )}
                </button>
              )
            })}
          </div>
          
          <div className="border-t border-white/10 p-2">
            <button
              onClick={() => {
                setIsOpen(false)
                window.location.href = '/accounts'
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-white/80 hover:bg-white/10 hover:text-white transition-all rounded-lg"
            >
              <FiSettings className="w-4 h-4" />
              <span>Gerenciar Contas</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

