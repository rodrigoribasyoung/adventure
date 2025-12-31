import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase/auth'
import { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, signOut } from '@/lib/firebase/auth'
import { getDocument, createDocumentWithId } from '@/lib/firebase/db'
import { seedDatabase } from '@/lib/firebase/seed'
import { User } from '@/types'

interface AuthContextType {
  currentUser: FirebaseUser | null
  userData: User | null
  loading: boolean
  signIn: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null)
  const [userData, setUserData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('[AuthContext] Estado de autenticação mudou:', user ? `Usuário: ${user.email}` : 'Não autenticado')
      setCurrentUser(user)
      
      if (user) {
        // Buscar ou criar dados do usuário no Firestore
        try {
          console.log('[AuthContext] Buscando dados do usuário:', user.uid)
          let userDoc = await getDocument<User>('users', user.uid)
          
          if (!userDoc) {
            console.log('[AuthContext] Usuário não encontrado, criando novo documento')
            // Criar documento do usuário usando user.uid como ID do documento
            const newUserData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
              email: user.email || '',
              name: user.displayName || user.email || '',
              role: 'user',
              createdBy: user.uid,
            }
            await createDocumentWithId<User>('users', user.uid, newUserData)
            userDoc = await getDocument<User>('users', user.uid)
            console.log('[AuthContext] Usuário criado com sucesso')
          } else {
            console.log('[AuthContext] Dados do usuário carregados:', userDoc)
          }
          
          setUserData(userDoc)
          
          // Criar dados de teste se for o primeiro acesso
          try {
            await seedDatabase(user.uid)
          } catch (seedError) {
            console.warn('[AuthContext] Erro ao criar dados de teste (pode ignorar):', seedError)
          }
        } catch (error: any) {
          console.error('[AuthContext] Erro ao buscar/criar dados do usuário:', error)
          console.error('[AuthContext] Código do erro:', error?.code, 'Mensagem:', error?.message)
        }
      } else {
        setUserData(null)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const handleSignIn = async () => {
    try {
      await signInWithGoogle()
      // O estado será atualizado pelo onAuthStateChanged
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      throw error
    }
  }

  const handleSignInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmail(email, password)
      // O estado será atualizado pelo onAuthStateChanged
    } catch (error) {
      console.error('Erro ao fazer login com email:', error)
      throw error
    }
  }

  const handleSignUpWithEmail = async (email: string, password: string) => {
    try {
      await signUpWithEmail(email, password)
      // O estado será atualizado pelo onAuthStateChanged
    } catch (error) {
      console.error('Erro ao criar conta:', error)
      throw error
    }
  }

  const handleResetPassword = async (email: string) => {
    try {
      await resetPassword(email)
    } catch (error) {
      console.error('Erro ao resetar senha:', error)
      throw error
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setUserData(null)
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    currentUser,
    userData,
    loading,
    signIn: handleSignIn,
    signInWithEmail: handleSignInWithEmail,
    signUpWithEmail: handleSignUpWithEmail,
    resetPassword: handleResetPassword,
    signOut: handleSignOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

