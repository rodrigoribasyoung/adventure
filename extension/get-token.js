/**
 * Script helper para obter token Firebase
 * Execute este código no console do navegador quando estiver logado no Adventure CRM
 */

// Para React/Vite com Firebase
if (typeof window !== 'undefined' && window.firebase) {
  window.firebase.auth().currentUser?.getIdToken().then(token => {
    console.log('=== TOKEN FIREBASE ===')
    console.log(token)
    console.log('=====================')
    
    // Copiar para área de transferência
    if (navigator.clipboard) {
      navigator.clipboard.writeText(token).then(() => {
        console.log('✅ Token copiado para a área de transferência!')
        alert('Token copiado! Cole na extensão.')
      })
    } else {
      console.log('⚠️ Não foi possível copiar automaticamente. Copie manualmente o token acima.')
    }
  }).catch(error => {
    console.error('Erro ao obter token:', error)
    alert('Erro ao obter token. Certifique-se de estar logado.')
  })
} else {
  console.log('Firebase não encontrado. Certifique-se de estar na aplicação Adventure CRM.')
  console.log('Alternativa: Use o código abaixo no console da aplicação:')
  console.log(`
    import { auth } from '@/lib/firebase/auth'
    auth.currentUser.getIdToken().then(token => {
      console.log('Token:', token)
      navigator.clipboard.writeText(token)
    })
  `)
}



