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
  isMaster?: boolean // Se é o usuário master (Adventure)
}

// Account (Conta/Cliente - Cliente da Adventure)
export interface Account extends BaseEntity {
  name: string
  description?: string
  ownerId: string // ID do usuário master (Adventure)
  plan: 'basic' | 'premium' | 'enterprise'
  active: boolean
  settings?: {
    customFields?: CustomField[]
    funnels?: Funnel[]
  }
}

// Project (Projeto dentro de uma Conta)
export interface Project extends BaseEntity {
  accountId: string // Conta à qual pertence
  name: string
  description?: string
  ownerId: string // ID do usuário master (Adventure)
  plan: 'basic' | 'premium' | 'enterprise'
  active: boolean
  settings?: {
    customFields?: CustomField[]
    funnels?: Funnel[]
  }
}

// ProjectUser (Usuário do Projeto - Cliente da Adventure)
export interface ProjectUser {
  id: string
  projectId: string
  userId: string
  role: 'owner' | 'admin' | 'user' | 'viewer'
  accessLevel: 'full' | 'limited'
  createdAt: Timestamp
  updatedAt: Timestamp
}

// ProjectMember (Responsável/Colaborador do Projeto)
export interface ProjectMember extends BaseEntity {
  projectId: string // Projeto ao qual pertence
  name: string // Nome do responsável
  email?: string // Email (opcional)
  phone?: string // Telefone (opcional)
  role?: string // Cargo/função (ex: "Vendedor", "Gerente", etc.)
  active: boolean
}

// Contact
export interface Contact extends BaseEntity {
  projectId: string // Projeto ao qual pertence
  firstName: string
  lastName?: string
  nickname?: string
  name: string // Nome completo (gerado automaticamente)
  email?: string
  phone?: string
  companyId?: string
  customFields?: Record<string, any>
}

// Company
export interface Company extends BaseEntity {
  projectId: string // Projeto ao qual pertence
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
  projectId: string // Projeto ao qual pertence
  name: string
  description?: string
  price: number
  currency: 'BRL'
  active: boolean
}

// Deal (Negociação)
export interface Deal extends BaseEntity {
  projectId: string // Projeto ao qual pertence
  title: string
  contactId?: string // Opcional (pode ser PF)
  contactIds?: string[] // Múltiplos contatos
  companyId?: string // Opcional (pode ser PJ)
  stage: string // funnel stage ID
  value: number
  currency: 'BRL'
  probability: number // 0-100
  expectedCloseDate?: Timestamp
  serviceIds: string[]
  assignedTo?: string // projectMemberId (responsável/colaborador do projeto)
  paymentType?: 'cash' | 'installment' // à vista ou à prazo
  paymentMethod?: 'pix' | 'boleto' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'exchange' | 'other' // método de pagamento
  contractUrl?: string // link do contrato (drive ou outro)
  status?: 'active' | 'won' | 'lost' | 'paused' // Em andamento, Vendiada, Perdida, Pausada
  closeReason?: string // motivo de fechamento (ID do motivo)
  closedAt?: Timestamp // data de fechamento
  customFields?: Record<string, any>
}

// Task (Tarefa/Atividade)
export interface Task extends BaseEntity {
  projectId: string // Projeto ao qual pertence
  dealId: string
  title: string
  description?: string
  type: string
  status: 'pending' | 'completed'
  dueDate?: Timestamp
  assignedTo?: string // projectMemberId (responsável/colaborador do projeto)
}

// Proposal (Proposta)
export interface Proposal extends BaseEntity {
  projectId: string // Projeto ao qual pertence
  dealId: string
  title: string
  description: string
  value: number
  currency: 'BRL'
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
  sentAt?: Timestamp
  expiresAt?: Timestamp
  services: ProposalService[]
  terms?: string
  notes?: string
}

export interface ProposalService {
  serviceId: string
  quantity: number
  unitPrice: number
  discount?: number
}

// Funnel
export interface Funnel extends BaseEntity {
  projectId: string // Projeto ao qual pertence
  name: string
  description?: string
  stages: FunnelStage[]
  active: boolean
  type?: 'martech' | 'custom' // tipo de funil
}

export interface FunnelStage {
  id: string
  name: string
  order: number
  color: string
  isWonStage?: boolean // se é etapa de ganho
  isLostStage?: boolean // se é etapa de perda
}

// Close Reason (Motivo de Fechamento)
export interface CloseReason extends BaseEntity {
  name: string
  type: 'won' | 'lost' // ganho ou perda
  category?: string // categoria para agrupamento
  active: boolean
  order?: number
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

