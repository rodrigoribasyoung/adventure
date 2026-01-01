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
  isMaster?: boolean // Se é o usuário master (Adventure) - DEPRECATED: usar userType
  userType?: 'developer' | 'owner' | 'client' | 'user' // Hierarquia de acesso
  // developer: Acesso completo - geral (backend e firebase)
  // owner: Acesso completo - geral (backend e firebase)
  // client: Acesso completo a nível de Projeto (frontend)
  // user: Acesso específico por nível de cargo (frontend)
}

// Project (Projeto/Cliente)
export interface Project extends BaseEntity {
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

// ProjectUser (Usuário do Projeto - Unificado com Responsáveis)
// Representa a relação entre User e Project, incluindo responsáveis/colaboradores
export interface ProjectUser extends BaseEntity {
  projectId: string // Projeto ao qual pertence
  userId?: string // ID do usuário (opcional - se não houver, é responsável sem conta de usuário)
  // Campos de acesso/permissão
  role: 'owner' | 'admin' | 'user' | 'viewer' // Role no projeto
  accessLevel: 'full' | 'limited' // Nível de acesso
  // Campos de responsável (para usuários que são responsáveis)
  name: string // Nome do responsável (obrigatório)
  email?: string // Email (opcional, pode vir do User ou ser específico)
  phone?: string // Telefone (opcional)
  jobTitle?: string // Cargo/função (ex: "Vendedor", "Gerente", etc.)
  functionLevel?: 'vendedor' | 'gerente' | 'diretor' | 'coordenador' | 'analista' | string // Nível de função
  active: boolean // Se o responsável está ativo
}

// ProjectMember (DEPRECATED - usar ProjectUser)
// Mantido para compatibilidade durante migração
export interface ProjectMember extends BaseEntity {
  projectId: string
  name: string
  email?: string
  phone?: string
  role?: string
  functionLevel?: 'vendedor' | 'gerente' | 'diretor' | 'coordenador' | 'analista' | string
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
  assignedTo?: string // projectUserId (ID do ProjectUser - responsável/colaborador do projeto)
  paymentType?: 'cash' | 'installment' // à vista ou à prazo
  paymentMethod?: 'pix' | 'boleto' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'exchange' | 'other' // método de pagamento
  contractUrl?: string // link do contrato (drive ou outro)
  status?: 'active' | 'won' | 'lost' | 'paused' // Em andamento, Vendiada, Perdida, Pausada
  closeReason?: string // motivo de fechamento (ID do motivo)
  closedAt?: Timestamp // data de fechamento
  notes?: string // anotações sobre a negociação
  customFields?: Record<string, any>
}

// Task (Tarefa/Atividade)
export interface Task extends BaseEntity {
  projectId: string // Projeto ao qual pertence
  dealId?: string // Opcional - tarefa pode estar vinculada a uma negociação ou não
  title: string
  description?: string
  type: string
  status: 'pending' | 'completed'
  dueDate?: Timestamp
  assignedTo?: string // projectUserId (ID do ProjectUser - responsável/colaborador do projeto)
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
  requiredFields?: string[] // campos obrigatórios para esta etapa (ex: ['title', 'contactId', 'value'])
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

