/**
 * Utilitário para obter token Firebase
 * Use este código no console do navegador quando estiver logado
 */

import { auth } from '@/lib/firebase/auth'

/**
 * Obtém o token Firebase do usuário atual
 * Útil para configurar a extensão Chrome
 */
export async function getFirebaseToken(): Promise<string> {
  const user = auth.currentUser
  if (!user) {
    throw new Error('Usuário não autenticado')
  }
  
  return await user.getIdToken()
}

/**
 * Copia o token para a área de transferência
 * Use no console: window.copyFirebaseToken()
 */
if (typeof window !== 'undefined') {
  (window as any).copyFirebaseToken = async () => {
    try {
      const token = await getFirebaseToken()
      await navigator.clipboard.writeText(token)
      console.log('✅ Token copiado para a área de transferência!')
      console.log('Token:', token)
      alert('Token copiado! Cole na extensão Chrome.')
      return token
    } catch (error) {
      console.error('Erro ao obter token:', error)
      alert('Erro ao obter token. Certifique-se de estar logado.')
      throw error
    }
  }
  
  console.log('💡 Dica: Execute window.copyFirebaseToken() no console para copiar seu token Firebase')
}



