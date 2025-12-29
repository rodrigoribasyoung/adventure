import { Funnel, CloseReason } from '@/types'

// Funil padrão para serviços de Martech
export const DEFAULT_MARTECH_FUNNEL: Omit<Funnel, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'projectId'> = {
  name: 'Funil de Vendas Martech',
  description: 'Funil otimizado para vendas de serviços de Marketing Technology',
  type: 'martech',
  active: true,
  stages: [
    {
      id: 'qualificacao',
      name: 'Qualificação',
      order: 1,
      color: '#4285F4', // Google Blue
      isWonStage: false,
      isLostStage: false,
    },
    {
      id: 'descoberta',
      name: 'Descoberta de Necessidade',
      order: 2,
      color: '#34A853', // Google Green
      isWonStage: false,
      isLostStage: false,
    },
    {
      id: 'proposta',
      name: 'Proposta Enviada',
      order: 3,
      color: '#FBBC04', // Google Yellow
      isWonStage: false,
      isLostStage: false,
    },
    {
      id: 'negociacao',
      name: 'Negociação',
      order: 4,
      color: '#FF9800', // Orange
      isWonStage: false,
      isLostStage: false,
    },
    {
      id: 'assinatura',
      name: 'Assinatura',
      order: 5,
      color: '#9C27B0', // Purple
      isWonStage: false,
      isLostStage: false,
    },
    {
      id: 'fechado_ganho',
      name: 'Fechado - Ganho',
      order: 6,
      color: '#10B981', // Green (Success)
      isWonStage: true,
      isLostStage: false,
    },
    {
      id: 'fechado_perda',
      name: 'Fechado - Perda',
      order: 7,
      color: '#EF4444', // Red (Error)
      isWonStage: false,
      isLostStage: true,
    },
  ],
}

// Motivos de fechamento padrão para Martech
export const DEFAULT_MARTECH_CLOSE_REASONS: Omit<CloseReason, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>[] = [
  // Motivos de Ganho
  {
    name: 'Aceitou proposta',
    type: 'won',
    category: 'Comercial',
    active: true,
    order: 1,
  },
  {
    name: 'Fechou contrato',
    type: 'won',
    category: 'Comercial',
    active: true,
    order: 2,
  },
  {
    name: 'Assinou proposta',
    type: 'won',
    category: 'Comercial',
    active: true,
    order: 3,
  },
  {
    name: 'Fechou com desconto',
    type: 'won',
    category: 'Comercial',
    active: true,
    order: 4,
  },
  {
    name: 'Fechou após negociação',
    type: 'won',
    category: 'Comercial',
    active: true,
    order: 5,
  },
  
  // Motivos de Perda
  {
    name: 'Preço alto / Sem orçamento',
    type: 'lost',
    category: 'Financeiro',
    active: true,
    order: 1,
  },
  {
    name: 'Escolheu concorrente',
    type: 'lost',
    category: 'Concorrência',
    active: true,
    order: 2,
  },
  {
    name: 'Não tem necessidade no momento',
    type: 'lost',
    category: 'Timing',
    active: true,
    order: 3,
  },
  {
    name: 'Perdeu interesse',
    type: 'lost',
    category: 'Interesse',
    active: true,
    order: 4,
  },
  {
    name: 'Perdeu contato / Sem resposta',
    type: 'lost',
    category: 'Contato',
    active: true,
    order: 5,
  },
  {
    name: 'Projeto cancelado pelo cliente',
    type: 'lost',
    category: 'Cliente',
    active: true,
    order: 6,
  },
  {
    name: 'Não atende às necessidades',
    type: 'lost',
    category: 'Fit',
    active: true,
    order: 7,
  },
  {
    name: 'Outro motivo',
    type: 'lost',
    category: 'Outros',
    active: true,
    order: 8,
  },
]

