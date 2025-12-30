import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User 
} from 'firebase/auth'
import { auth } from './config'

const googleProvider = new GoogleAuthProvider()

export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return result.user
  } catch (error) {
    console.error('Erro ao fazer login com Google:', error)
    throw error
  }
}

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return result.user
  } catch (error: any) {
    console.error('Erro ao fazer login com email:', error)
    // Traduzir erros comuns do Firebase
    if (error.code === 'auth/user-not-found') {
      throw new Error('Usuário não encontrado')
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Senha incorreta')
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Email inválido')
    } else if (error.code === 'auth/user-disabled') {
      throw new Error('Usuário desabilitado')
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Muitas tentativas. Tente novamente mais tarde')
    }
    throw error
  }
}

export const signUpWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    return result.user
  } catch (error: any) {
    console.error('Erro ao criar conta com email:', error)
    // Traduzir erros comuns do Firebase
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Este email já está em uso')
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Email inválido')
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Senha muito fraca. Use pelo menos 6 caracteres')
    }
    throw error
  }
}

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth)
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
    throw error
  }
}

export { auth }

