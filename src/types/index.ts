import { Timestamp } from 'firebase/firestore'

// Tipos base
export interface BaseEntity {
  id: string
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string // userId
}

// User
export interface User extends BaseEntity {
  email: string
  name: string
  role: 'admin' | 'user'
}

// Contact
export interface Contact extends BaseEntity {
  name: string
  email?: string
  phone?: string
  companyId?: string
  customFields?: Record<string, any>
}

// Company
export interface Company extends BaseEntity {
  name: string
  cnpj?: string
  email?: string
  phone?: string
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  customFields?: Record<string, any>
}

// Service
export interface Service extends BaseEntity {
  name: string
  description?: string
  price: number
  currency: 'BRL'
  active: boolean
}

// Deal (Negociação)
export interface Deal extends BaseEntity {
  title: string
  contactId: string
  companyId?: string
  stage: string // funnel stage ID
  value: number
  currency: 'BRL'
  probability: number // 0-100
  expectedCloseDate?: Timestamp
  serviceIds: string[]
  assignedTo?: string // userId
  customFields?: Record<string, any>
}

// Task (Tarefa/Atividade)
export interface Task extends BaseEntity {
  dealId: string
  title: string
  description?: string
  type: string
  status: 'pending' | 'completed'
  dueDate?: Timestamp
}

// Funnel
export interface Funnel extends BaseEntity {
  name: string
  stages: FunnelStage[]
  active: boolean
}

export interface FunnelStage {
  id: string
  name: string
  order: number
  color: string
}

// Custom Field
export interface CustomField extends BaseEntity {
  entityType: 'contact' | 'company' | 'deal'
  name: string
  type: 'text' | 'number' | 'date' | 'select'
  options?: string[]
  required: boolean
}

// WhatsApp Conversation
export interface WhatsAppConversation extends BaseEntity {
  dealId: string
  phoneNumber: string
  messages: WhatsAppMessage[]
  saved: boolean
}

export interface WhatsAppMessage {
  timestamp: Timestamp
  from: string
  to: string
  body: string
}

