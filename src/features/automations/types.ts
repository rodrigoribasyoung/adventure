import { Timestamp } from 'firebase/firestore'
import { BaseEntity } from '@/types'

export interface Automation extends BaseEntity {
  name: string
  description?: string
  enabled: boolean
  trigger: AutomationTrigger
  conditions: AutomationCondition[]
  actions: AutomationAction[]
  lastRunAt?: Timestamp
  nextRunAt?: Timestamp
}

export type AutomationTrigger = 
  | { type: 'deal_inactive'; days: number }
  | { type: 'deal_created' }
  | { type: 'deal_stage_changed' }
  | { type: 'deal_status_changed'; status: string }

export type AutomationCondition = 
  | { type: 'deal_value_greater_than'; value: number }
  | { type: 'deal_value_less_than'; value: number }
  | { type: 'deal_stage'; stageId: string }
  | { type: 'deal_status'; status: string }

export type AutomationAction =
  | { type: 'create_task'; title: string; dueDays: number }
  | { type: 'send_notification'; message: string }
  | { type: 'assign_to'; userId: string }
  | { type: 'move_stage'; stageId: string }

