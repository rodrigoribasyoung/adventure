import { Timestamp } from 'firebase/firestore'
import { BaseEntity } from '@/types'

// Tipos de canal de marketing
export type MarketingChannel = 'google_ads' | 'meta_ads' | 'hotsite' | 'real_estate' | 'other'

// Dados de origem/campanha de marketing
export interface MarketingSource {
  channel: MarketingChannel
  campaignObjective?: string
  adLink?: string
  conversionChannel?: string // Cadastro, Conversa iniciada, Hotsite
  conversionDetails?: string
  medium?: string
  source?: string
}

// Dados de atribuição (UTM, origem, etc)
export interface AttributionData {
  medium?: string
  source?: string
  campaign?: string
  term?: string
  content?: string
}

// Métricas de marketing
export interface MarketingMetrics {
  impressions: number
  linkClicks: number
  registrations: number // Cadastros
  conversationsStarted: number // Conversas iniciadas
  totalLeads: number
  investmentValue: number
  platformBalance?: number // Saldo atual na plataforma
}

// Métricas de vendas
export interface SalesMetrics {
  activities?: number
  dealsCreated?: number
  leadsReceived?: number
  contactsMade?: number
  scheduledVisits?: number
  completedVisits?: number
  signedContracts?: number
  internalSales?: number
  losses?: number
  realEstateContacts?: number
  realEstateVideoCalls?: number
  realEstateVisits?: number
  realEstateLeadsInProcess?: number
  sales?: number
}

// Dados de venda (para deals)
export interface SalesData {
  activeProperty: string // Empreendimento/Ativo
  lotNumber?: string
  entryValue?: number
  lotValue?: number
  responsible?: string // Responsável pela venda
  saleType?: 'internal' | 'external' // Venda interna ou externa
  intermediation?: string
  internalResponsible?: string
  externalResponsible?: string
}

// Marketing Report (relatório agregado diário de marketing)
export interface MarketingReport extends BaseEntity {
  projectId: string
  date: Timestamp
  weekISO: number
  activeProperty: string // Código + nome do empreendimento
  channel: MarketingChannel
  investmentCategory?: string
  investmentDetail?: string
  metrics: MarketingMetrics
  campaignObjective?: string
  adLink?: string
  conversionChannel?: string
  conversionDetails?: string
  purchaseInterest?: string
  medium?: string
  source?: string
}

// Sales Report (relatório agregado diário de vendas)
export interface SalesReport extends BaseEntity {
  projectId: string
  date: Timestamp
  weekISO: number
  activeProperty: string
  reportCategory?: string
  crmFunnel?: string
  metrics: SalesMetrics
  saleIntermediation?: string
  internalSalesResponsible?: string
  externalSalesResponsible?: string
}

// Client Integration (configuração de integração por cliente)
export interface ClientIntegration extends BaseEntity {
  projectId: string
  provider: 'meta_ads' | 'google_ads' | 'google_analytics' | 'rd_station' | 'sellflux'
  config: Record<string, any> // Configurações específicas do provider
  credentials?: {
    encrypted: boolean
    // Credenciais serão criptografadas no Firestore
    [key: string]: any
  }
  lastSync?: Timestamp
  syncEnabled: boolean
  syncFrequency?: 'daily' | 'hourly' | 'realtime'
}
