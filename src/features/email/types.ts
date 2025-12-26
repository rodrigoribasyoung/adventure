import { Timestamp } from 'firebase/firestore'
import { BaseEntity } from '@/types'

export interface Email extends BaseEntity {
  to: string
  toContactId?: string
  toDealId?: string
  subject: string
  body: string
  templateId?: string
  status: 'draft' | 'sent' | 'failed'
  sentAt?: Timestamp
  error?: string
}

export interface EmailTemplate extends BaseEntity {
  name: string
  subject: string
  body: string
  variables?: string[] // Variáveis disponíveis no template (ex: {{contact.name}})
}

