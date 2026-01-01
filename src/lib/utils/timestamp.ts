import { Timestamp } from 'firebase/firestore'

/**
 * Converte um Timestamp do Firestore para Date
 * Suporta Timestamp, Date, ou string ISO
 */
export const toDate = (timestamp?: Timestamp | Date | string | null): Date | null => {
  if (!timestamp) return null
  
  // Se já é Date
  if (timestamp instanceof Date) {
    return timestamp
  }
  
  // Se é string ISO
  if (typeof timestamp === 'string') {
    return new Date(timestamp)
  }
  
  // Se é Timestamp do Firestore
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
    return (timestamp as Timestamp).toDate()
  }
  
  // Se tem toMillis
  if (timestamp && typeof timestamp === 'object' && 'toMillis' in timestamp) {
    return new Date((timestamp as Timestamp).toMillis())
  }
  
  return null
}

/**
 * Converte um Timestamp do Firestore para número de milissegundos
 */
export const toMillis = (timestamp?: Timestamp | Date | string | null): number | null => {
  const date = toDate(timestamp)
  return date ? date.getTime() : null
}

