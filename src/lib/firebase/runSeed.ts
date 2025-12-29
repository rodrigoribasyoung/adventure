/**
 * Script para executar o seed completo do banco de dados
 * 
 * Para executar no console do navegador:
 * 
 * 1. Abra o console do navegador (F12)
 * 2. Execute:
 *    window.runSeed()
 * 
 * Ou para limpar e recriar tudo:
 *    window.runSeed(true)
 */

import { seedCompleteDatabase } from './seedComplete'
import { auth } from './auth'

export const runSeed = async (clearExisting: boolean = false) => {
  const user = auth.currentUser
  if (!user) {
    console.error('❌ Usuário não autenticado. Faça login primeiro.')
    alert('Erro: Usuário não autenticado. Faça login primeiro.')
    return
  }

  try {
    console.log('🚀 Iniciando seed completo...')
    await seedCompleteDatabase(user.uid, clearExisting)
    console.log('✅ Seed completo finalizado!')
    alert('Seed completo executado com sucesso! Recarregue a página para ver os dados.')
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error)
    alert(`Erro ao executar seed: ${error}`)
  }
}

// Expor globalmente para uso no console
declare global {
  interface Window {
    runSeed: (clearExisting?: boolean) => Promise<void>
  }
}

window.runSeed = runSeed

