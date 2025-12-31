import { 
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  QueryConstraint,
  writeBatch
} from 'firebase/firestore'
import { db } from './config'

// Tipos utilitários
export type FirestoreTimestamp = Timestamp

// Helper para remover campos undefined do objeto (recursivo para objetos aninhados)
const removeUndefinedFields = (obj: Record<string, any>): Record<string, any> => {
  if (obj === null || obj === undefined) {
    return {}
  }
  
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value === undefined) {
      // Ignorar campos undefined
      return acc
    }
    
    // Se for um objeto (mas não array, Timestamp, Date), processar recursivamente
    if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date) && !(value.constructor?.name === 'Timestamp')) {
      const cleaned = removeUndefinedFields(value as Record<string, any>)
      // Só adicionar se o objeto limpo não estiver vazio ou se tiver propriedades
      if (Object.keys(cleaned).length > 0) {
        acc[key] = cleaned
      }
    } else {
      acc[key] = value
    }
    
    return acc
  }, {} as Record<string, any>)
}

// Helpers genéricos para CRUD
export const getDocument = async <T>(collectionName: string, docId: string): Promise<T | null> => {
  try {
    const docRef = doc(db, collectionName, docId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T
    }
    return null
  } catch (error) {
    console.error(`Erro ao buscar documento ${collectionName}/${docId}:`, error)
    throw error
  }
}

export const getDocuments = async <T>(
  collectionName: string, 
  constraints: QueryConstraint[] = []
): Promise<T[]> => {
  try {
    console.log(`[Firestore] Buscando documentos de ${collectionName}`)
    const q = query(collection(db, collectionName), ...constraints)
    const querySnapshot = await getDocs(q)
    
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[]
    
    console.log(`[Firestore] ${data.length} documentos encontrados em ${collectionName}`)
    return data
  } catch (error: any) {
    console.error(`[Firestore] Erro ao buscar documentos de ${collectionName}:`, error)
    console.error(`[Firestore] Código do erro: ${error.code}, Mensagem: ${error.message}`)
    throw error
  }
}

export const createDocument = async <T extends Record<string, any>>(
  collectionName: string, 
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    // Remove campos undefined antes de salvar
    const cleanData = removeUndefinedFields(data as Record<string, any>)
    
    const docData = {
      ...cleanData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }
    console.log(`[Firestore] Criando documento em ${collectionName}:`, docData)
    const docRef = await addDoc(collection(db, collectionName), docData)
    console.log(`[Firestore] Documento criado com sucesso: ${docRef.id}`)
    return docRef.id
  } catch (error: any) {
    console.error(`[Firestore] Erro ao criar documento em ${collectionName}:`, error)
    console.error(`[Firestore] Código do erro: ${error.code}, Mensagem: ${error.message}`)
    throw error
  }
}

// Criar documento com ID específico (útil para usuários onde o ID deve ser o UID)
export const createDocumentWithId = async <T extends Record<string, any>>(
  collectionName: string,
  docId: string,
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    // Remove campos undefined antes de salvar
    const cleanData = removeUndefinedFields(data as Record<string, any>)
    
    const docData = {
      ...cleanData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }
    console.log(`[Firestore] Criando documento ${collectionName}/${docId}:`, docData)
    const docRef = doc(db, collectionName, docId)
    await setDoc(docRef, docData)
    console.log(`[Firestore] Documento criado com sucesso: ${docId}`)
    return docId
  } catch (error: any) {
    console.error(`[Firestore] Erro ao criar documento ${collectionName}/${docId}:`, error)
    console.error(`[Firestore] Código do erro: ${error.code}, Mensagem: ${error.message}`)
    throw error
  }
}

export const updateDocument = async <T extends Record<string, any>>(
  collectionName: string,
  docId: string,
  data: Partial<Omit<T, 'id' | 'createdAt'>>
): Promise<void> => {
  try {
    // Remove campos undefined antes de atualizar
    const cleanData = removeUndefinedFields(data as Record<string, any>)
    
    const docRef = doc(db, collectionName, docId)
    await updateDoc(docRef, {
      ...cleanData,
      updatedAt: Timestamp.now(),
    })
    console.log(`[Firestore] Documento ${collectionName}/${docId} atualizado com sucesso`)
  } catch (error: any) {
    console.error(`[Firestore] Erro ao atualizar documento ${collectionName}/${docId}:`, error)
    console.error(`[Firestore] Código do erro: ${error.code}, Mensagem: ${error.message}`)
    throw error
  }
}

export const deleteDocument = async (
  collectionName: string,
  docId: string
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, docId)
    await deleteDoc(docRef)
  } catch (error) {
    console.error(`Erro ao deletar documento ${collectionName}/${docId}:`, error)
    throw error
  }
}

// Criar múltiplos documentos em batch (máximo 500 por batch)
export const createDocumentsBatch = async <T extends Record<string, any>>(
  collectionName: string,
  dataArray: Array<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<string[]> => {
  try {
    if (dataArray.length === 0) {
      return []
    }

    // Firestore permite máximo 500 operações por batch
    const BATCH_SIZE = 500
    const allIds: string[] = []
    const now = Timestamp.now()

    // Processar em lotes de 500
    for (let i = 0; i < dataArray.length; i += BATCH_SIZE) {
      const batch = writeBatch(db)
      const batchData = dataArray.slice(i, i + BATCH_SIZE)
      const batchIds: string[] = []

      batchData.forEach((data) => {
        // Remove campos undefined antes de salvar
        const cleanData = removeUndefinedFields(data as Record<string, any>)
        
        const docData = {
          ...cleanData,
          createdAt: now,
          updatedAt: now,
        }

        // Criar referência de documento (doc() sem ID gera um ID automático)
        const docRef = doc(collection(db, collectionName))
        batchIds.push(docRef.id)
        batch.set(docRef, docData)
      })

      // Executar batch
      console.log(`[Firestore] Criando batch de ${batchData.length} documentos em ${collectionName}`)
      await batch.commit()
      console.log(`[Firestore] Batch criado com sucesso: ${batchIds.length} documentos`)
      
      allIds.push(...batchIds)
    }

    console.log(`[Firestore] Total de ${allIds.length} documentos criados em ${collectionName}`)
    return allIds
  } catch (error: any) {
    console.error(`[Firestore] Erro ao criar batch de documentos em ${collectionName}:`, error)
    console.error(`[Firestore] Código do erro: ${error.code}, Mensagem: ${error.message}`)
    throw error
  }
}

// Exportar helpers do Firestore para uso direto quando necessário
export { collection, doc, query, where, orderBy, limit, startAfter, Timestamp }

