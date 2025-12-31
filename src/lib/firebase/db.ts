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
  QueryConstraint
} from 'firebase/firestore'
import { db } from './config'

// Tipos utilitários
export type FirestoreTimestamp = Timestamp

// Helper para remover campos undefined do objeto
const removeUndefinedFields = (obj: Record<string, any>): Record<string, any> => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined) {
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

// Exportar helpers do Firestore para uso direto quando necessário
export { collection, doc, query, where, orderBy, limit, startAfter, Timestamp }

