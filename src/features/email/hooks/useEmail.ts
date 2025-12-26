import { useState } from 'react'
import { Email, EmailTemplate } from '../types'
import { createDocument } from '@/lib/firebase/db'
import { useAuth } from '@/contexts/AuthContext'

export const useEmail = () => {
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { currentUser } = useAuth()

  const sendEmail = async (data: {
    to: string
    toContactId?: string
    toDealId?: string
    subject: string
    body: string
    templateId?: string
  }): Promise<void> => {
    try {
      setSending(true)
      setError(null)

      if (!currentUser) throw new Error('Usuário não autenticado')

      // TODO: Implementar chamada para Firebase Function que envia o email
      // Por enquanto, apenas salva no Firestore como registro
      const emailData: Omit<Email, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> = {
        ...data,
        status: 'sent', // Será atualizado pela função backend
        sentAt: undefined, // Será preenchido pela função backend
      }

      await createDocument<Email>('emails', emailData)

      // Em produção, aqui faríamos uma chamada HTTP para Firebase Functions
      // que enviaria o email usando SendGrid, Resend, etc.
      console.log('[Email] Email salvo no Firestore. Em produção, seria enviado via Firebase Functions.')
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar email')
      throw err
    } finally {
      setSending(false)
    }
  }

  return {
    sendEmail,
    sending,
    error,
  }
}

