# Mapeamento de Campos CSV → Firestore

## Análise do CSV SMKTDailyReport.csv

Total de campos: 51

### Campos do CSV (primeira linha)

1. Data
2. Semana ISO
3. Tipo de relatório (1.Marketing | 2.Vendas)
4. Ativo (empreendimento: código + nome)
5. Categoria do relatório
6. Subcategoria do relatório
7. Categoria do investimento
8. Canal (Google Ads | Meta Ads | Hotsite)
9. Detalhamento do investimento
10. Saldo atual na plataforma - R$
11. Valor do investimento - R$
12. Impressões
13. Cliques no link
14. Cadastros
15. Conversas iniciadas
16. Leads totais (soma)
17. Funil do CRM
18. Atividades
19. Negociações criadas
20. Leads recebidos
21. Contatos feitos
22. Visitas agendadas
23. Visitas realizadas
24. Fichas assinadas
25. Vendas internas
26. Perdas
27. Contatos com imobiliárias
28. Videochamadas com imobiliárias
29. Visitas com imobiliárias
30. Leads de imobiliárias em atendimento
31. Intermediação da venda
32. Responsável pela venda interna
33. Responsável pela venda externa
34. Vendas
35. Valor de Entrada
36. Valor do lote à vista
37. Nº do lote
38. Nome do cliente
39. Email do cliente
40. Cidade
41. medium
42. source
43. Objetivo da campanha
44. Link do anúncio
45. Canal de conversão
46. Detalhes da conversão
47. Interesse de compra

## Mapeamento para Estrutura Firestore

### Marketing Reports Collection
```typescript
{
  id: string
  projectId: string
  date: Timestamp
  weekISO: number
  activeProperty: string // Ativo (código + nome)
  channel: 'google_ads' | 'meta_ads' | 'hotsite'
  investmentCategory: string
  investmentDetail: string
  platformBalance: number // Saldo atual na plataforma
  investmentValue: number // Valor do investimento
  impressions: number
  linkClicks: number
  registrations: number // Cadastros
  conversationsStarted: number
  totalLeads: number
  campaignObjective?: string
  adLink?: string
  conversionChannel?: string
  conversionDetails?: string
  purchaseInterest?: string
  medium?: string
  source?: string
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string
}
```

### Sales Reports Collection
```typescript
{
  id: string
  projectId: string
  date: Timestamp
  weekISO: number
  activeProperty: string
  reportCategory: string
  crmFunnel?: string
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
  saleIntermediation?: string
  internalSalesResponsible?: string
  externalSalesResponsible?: string
  sales?: number
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string
}
```

### Deal Extensions (para deals existentes)
```typescript
// Campos adicionais no Deal
{
  // ... campos existentes
  marketingSource?: {
    channel: 'google_ads' | 'meta_ads' | 'hotsite' | 'real_estate' | 'other'
    campaignObjective?: string
    adLink?: string
    conversionChannel?: string
    conversionDetails?: string
    medium?: string
    source?: string
  }
  salesData?: {
    activeProperty: string
    lotNumber?: string
    entryValue?: number
    lotValue?: number
    responsible?: string
    saleType?: 'internal' | 'external'
    intermediation?: string
  }
  purchaseInterest?: string
}
```

### Contact Extensions (para contacts existentes)
```typescript
// Campos adicionais no Contact
{
  // ... campos existentes
  marketingOrigin?: {
    channel: string
    medium?: string
    source?: string
    campaignObjective?: string
    conversionDate?: Timestamp
  }
  city?: string
}
```

## Regras de Transformação

1. **Data**: Converter formato brasileiro (DD/MM/YYYY) para Timestamp
2. **Valores monetários**: Converter formato brasileiro (1.234,56) para number
3. **Ativo**: Separar código (ex: "11. ITY") e nome ("Parque Lorena Itaqui")
4. **Tipo de relatório**: Separar por tipo (1.Marketing → marketingReports, 2.Vendas → salesReports)
5. **Vendas com detalhes de cliente**: Criar/atualizar Deal com dados completos
6. **Origem de leads**: Atualizar Contact com dados de origem quando disponível
