import { Timestamp } from 'firebase/firestore'
import { BaseEntity } from '@/types'

export type IntegrationProvider = 'meta_ads' | 'google_ads' | 'google_analytics'

export interface IntegrationConnection extends BaseEntity {
  provider: IntegrationProvider
  accessToken: string // Criptografado no Firestore
  refreshToken?: string // Criptografado no Firestore
  expiresAt?: Timestamp
  connectedAt: Timestamp
  accountId: string
  accountName: string
  metadata?: Record<string, any>
  userId: string // ID do usuário que conectou
}

export interface IntegrationConfig {
  provider: IntegrationProvider
  name: string
  description: string
  icon: string
  oauthUrl: string
  requiredScopes: string[]
  isConnected: boolean
  connection?: IntegrationConnection
}

