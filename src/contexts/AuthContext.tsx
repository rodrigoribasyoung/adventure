import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase/auth'
import { signInWithGoogle, signOut } from '@/lib/firebase/auth'
import { getDocument, createDocument } from '@/lib/firebase/db'
import { User } from '@/types'

interface AuthContextType {
  currentUser: FirebaseUser | null
  userData: User | null
  loading: boolean
  signIn: () => Promise<void>
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
            // Criar documento do usuário se não existir
            const newUserData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
              email: user.email || '',
              name: user.displayName || user.email || '',
              role: 'user',
              createdBy: user.uid,
            }
            await createDocument<User>('users', newUserData)
            userDoc = await getDocument<User>('users', user.uid)
            console.log('[AuthContext] Usuário criado com sucesso')
          } else {
            console.log('[AuthContext] Dados do usuário carregados:', userDoc)
          }
          
          setUserData(userDoc)
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
    signOut: handleSignOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

