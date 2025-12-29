/**
 * Utilitários para integração com WhatsApp
 */

/**
 * Formata número de telefone para link do WhatsApp
 * @param phone - Número de telefone (com ou sem código do país)
 * @returns Link formatado para wa.me
 */
export function formatWhatsAppLink(phone: string): string {
  if (!phone) return ''
  
  // Remove todos os caracteres não numéricos exceto +
  let cleaned = phone.replace(/[^\d+]/g, '')
  
  // Se não começar com +, adiciona código do Brasil (55)
  if (!cleaned.startsWith('+')) {
    // Remove zeros à esquerda
    cleaned = cleaned.replace(/^0+/, '')
    
    // Se não começar com 55, adiciona
    if (!cleaned.startsWith('55')) {
      cleaned = '55' + cleaned
    }
    
    // Adiciona o +
    cleaned = '+' + cleaned
  }
  
  return `https://wa.me/${cleaned.replace(/\+/g, '')}`
}

/**
 * Formata número de telefone para exibição
 * @param phone - Número de telefone
 * @returns Número formatado para exibição
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return ''
  
  // Remove todos os caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '')
  
  // Formata como (XX) XXXXX-XXXX para números brasileiros
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  }
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
  }
  
  // Se começar com 55 (código do Brasil), formata com código
  if (cleaned.startsWith('55') && cleaned.length === 13) {
    return `+55 (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`
  }
  
  return phone
}

/**
 * Normaliza número de telefone (remove formatação)
 * @param phone - Número de telefone formatado
 * @returns Número apenas com dígitos
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return ''
  return phone.replace(/\D/g, '')
}

/**
 * Valida se um número de telefone é válido
 * @param phone - Número de telefone
 * @returns true se válido
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone) return false
  
  const cleaned = normalizePhoneNumber(phone)
  
  // Número brasileiro: 10 ou 11 dígitos (com DDD)
  // Número internacional: pelo menos 10 dígitos
  return cleaned.length >= 10 && cleaned.length <= 15
}

