/**
 * Utilitários para armazenar tokens de forma segura no Firestore
 * Em produção, considere usar criptografia ou Firebase Functions para armazenar tokens sensíveis
 */

import { IntegrationConnection } from '@/features/integrations/types'

/**
 * Criptografa token antes de salvar (implementação básica)
 * NOTA: Para produção, use uma biblioteca de criptografia adequada ou Firebase Functions
 */
export const encryptToken = (token: string): string => {
  // Implementação básica - em produção, use crypto-js ou similar
  // Por enquanto, apenas base64 encode (não é seguro, mas funcional)
  return btoa(token)
}

/**
 * Descriptografa token após buscar do Firestore
 */
export const decryptToken = (encryptedToken: string): string => {
  try {
    return atob(encryptedToken)
  } catch {
    return encryptedToken // Retorna como está se falhar
  }
}

/**
 * Prepara conexão para salvar (criptografa tokens)
 */
export const prepareConnectionForStorage = (connection: Omit<IntegrationConnection, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Omit<IntegrationConnection, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> => {
  return {
    ...connection,
    accessToken: encryptToken(connection.accessToken),
    refreshToken: connection.refreshToken ? encryptToken(connection.refreshToken) : undefined,
  }
}

/**
 * Prepara conexão para uso (descriptografa tokens)
 */
export const prepareConnectionForUse = (connection: IntegrationConnection): IntegrationConnection => {
  return {
    ...connection,
    accessToken: decryptToken(connection.accessToken),
    refreshToken: connection.refreshToken ? decryptToken(connection.refreshToken) : undefined,
  }
}

