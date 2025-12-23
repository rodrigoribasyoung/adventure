import { 
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
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
    const q = query(collection(db, collectionName), ...constraints)
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[]
  } catch (error) {
    console.error(`Erro ao buscar documentos de ${collectionName}:`, error)
    throw error
  }
}

export const createDocument = async <T extends Record<string, any>>(
  collectionName: string, 
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const docData = {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }
    const docRef = await addDoc(collection(db, collectionName), docData)
    return docRef.id
  } catch (error) {
    console.error(`Erro ao criar documento em ${collectionName}:`, error)
    throw error
  }
}

export const updateDocument = async <T extends Record<string, any>>(
  collectionName: string,
  docId: string,
  data: Partial<Omit<T, 'id' | 'createdAt'>>
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, docId)
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error(`Erro ao atualizar documento ${collectionName}/${docId}:`, error)
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

