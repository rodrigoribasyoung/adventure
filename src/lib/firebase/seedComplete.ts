import { collection, getDocs, query, limit, Timestamp, deleteDoc } from 'firebase/firestore'
import { db } from './config'
import { createDocument } from './db'
import { 
  Contact, 
  Company, 
  Service, 
  Deal, 
  Funnel, 
  CloseReason, 
  Project, 
  Task,
  Proposal,
  Account
} from '@/types'
import { DEFAULT_MARTECH_FUNNEL, DEFAULT_MARTECH_CLOSE_REASONS } from './martechFunnel'

// Função para verificar se já existem dados
const hasData = async (collectionName: string): Promise<boolean> => {
  try {
    const q = query(collection(db, collectionName), limit(1))
    const snapshot = await getDocs(q)
    return !snapshot.empty
  } catch (error) {
    console.error(`Erro ao verificar dados de ${collectionName}:`, error)
    return false
  }
}

// Função para limpar dados existentes (opcional)
const clearCollection = async (collectionName: string) => {
  try {
    const snapshot = await getDocs(collection(db, collectionName))
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
    await Promise.all(deletePromises)
    console.log(`[Seed] Coleção ${collectionName} limpa (${snapshot.docs.length} documentos)`)
  } catch (error) {
    console.error(`[Seed] Erro ao limpar ${collectionName}:`, error)
  }
}

// Criar dados de exemplo completos para todas as coleções
export const seedCompleteDatabase = async (userId: string, clearExisting: boolean = false) => {
  console.log('[Seed] Iniciando seed completo do banco de dados...')
  console.log(`[Seed] Usuário: ${userId}`)
  console.log(`[Seed] Limpar dados existentes: ${clearExisting}`)

  try {
    // Limpar dados existentes se solicitado
    if (clearExisting) {
      console.log('[Seed] Limpando dados existentes...')
      await clearCollection('accounts')
      await clearCollection('projects')
      await clearCollection('companies')
      await clearCollection('contacts')
      await clearCollection('services')
      await clearCollection('funnels')
      await clearCollection('closeReasons')
      await clearCollection('deals')
      await clearCollection('tasks')
      await clearCollection('proposals')
    }

    // Verificar se já existem dados (se não for para limpar)
    if (!clearExisting) {
      const accountsExist = await hasData('accounts')
      const projectsExist = await hasData('projects')
      if (accountsExist || projectsExist) {
        console.log('[Seed] Dados já existem. Use clearExisting=true para limpar e recriar.')
        return
      }
    }

    // ============================================
    // 1. CRIAR CONTA
    // ============================================
    console.log('[Seed] Criando conta...')
    const accountId = await createDocument<Account>('accounts', {
      name: 'Conta Exemplo',
      description: 'Conta de exemplo para testes',
      ownerId: userId,
      plan: 'premium',
      active: true,
      createdBy: userId,
    })

    // ============================================
    // 2. CRIAR PROJETOS
    // ============================================
    console.log('[Seed] Criando projetos...')
    const project1Id = await createDocument<Project>('projects', {
      accountId: accountId,
      name: 'Projeto Exemplo 1',
      description: 'Projeto de exemplo para testes',
      ownerId: userId,
      plan: 'premium',
      active: true,
      createdBy: userId,
    })

    const project2Id = await createDocument<Project>('projects', {
      accountId: accountId,
      name: 'Projeto Exemplo 2',
      description: 'Segundo projeto de exemplo',
      ownerId: userId,
      plan: 'basic',
      active: true,
      createdBy: userId,
    })

    // ============================================
    // 3. CRIAR EMPRESAS
    // ============================================
    console.log('[Seed] Criando empresas...')
    const companies: string[] = []
    
    const companyData = [
      { name: 'Tech Solutions Ltda', cnpj: '12.345.678/0001-90', email: 'contato@techsolutions.com.br', phone: '(11) 98765-4321', projectId: project1Id },
      { name: 'Digital Marketing Agency', email: 'hello@digitalmarketing.com.br', phone: '(11) 91234-5678', projectId: project1Id },
      { name: 'Inovação Tecnológica S.A.', cnpj: '98.765.432/0001-10', email: 'contato@inovacao.com.br', phone: '(21) 98765-4321', projectId: project1Id },
      { name: 'Startup XYZ', email: 'contato@startupxyz.com.br', phone: '(11) 91234-5678', projectId: project2Id },
      { name: 'Empresa ABC', cnpj: '11.222.333/0001-44', email: 'contato@empresaabc.com.br', phone: '(11) 99876-5432', projectId: project2Id },
    ]

    for (const company of companyData) {
      const id = await createDocument<Company>('companies', {
        ...company,
        createdBy: userId,
      })
      companies.push(id)
    }

    // ============================================
    // 3. CRIAR CONTATOS
    // ============================================
    console.log('[Seed] Criando contatos...')
    const contacts: string[] = []
    
    const contactData = [
      { firstName: 'João', lastName: 'Silva', email: 'joao.silva@techsolutions.com.br', phone: '(11) 99876-5432', companyId: companies[0], projectId: project1Id },
      { firstName: 'Maria', lastName: 'Santos', email: 'maria.santos@digitalmarketing.com.br', phone: '(11) 97654-3210', companyId: companies[1], projectId: project1Id },
      { firstName: 'Pedro', lastName: 'Oliveira', email: 'pedro.oliveira@email.com', phone: '(11) 96543-2109', projectId: project1Id },
      { firstName: 'Ana', lastName: 'Costa', email: 'ana.costa@inovacao.com.br', phone: '(21) 98765-4321', companyId: companies[2], projectId: project1Id },
      { firstName: 'Carlos', lastName: 'Ferreira', email: 'carlos.ferreira@startupxyz.com.br', phone: '(11) 91234-5678', companyId: companies[3], projectId: project2Id },
      { firstName: 'Juliana', lastName: 'Almeida', email: 'juliana.almeida@empresaabc.com.br', phone: '(11) 99876-5432', companyId: companies[4], projectId: project2Id },
      { firstName: 'Roberto', lastName: 'Lima', email: 'roberto.lima@email.com', phone: '(11) 98765-4321', projectId: project1Id },
      { firstName: 'Fernanda', lastName: 'Rocha', email: 'fernanda.rocha@email.com', phone: '(11) 97654-3210', projectId: project2Id },
    ]

    for (const contact of contactData) {
      const id = await createDocument<Contact>('contacts', {
        ...contact,
        name: `${contact.firstName} ${contact.lastName || ''}`.trim(),
        createdBy: userId,
      })
      contacts.push(id)
    }

    // ============================================
    // 4. CRIAR SERVIÇOS
    // ============================================
    console.log('[Seed] Criando serviços...')
    const services: string[] = []
    
    const serviceData = [
      { name: 'Desenvolvimento de Site', description: 'Criação de site institucional responsivo', price: 5000.00, projectId: project1Id },
      { name: 'E-commerce Completo', description: 'Loja virtual com painel administrativo', price: 15000.00, projectId: project1Id },
      { name: 'SEO e Marketing Digital', description: 'Otimização para buscadores e campanhas', price: 3000.00, projectId: project1Id },
      { name: 'Consultoria em Tecnologia', description: 'Consultoria estratégica em tecnologia', price: 2500.00, projectId: project1Id },
      { name: 'App Mobile', description: 'Desenvolvimento de aplicativo mobile', price: 20000.00, projectId: project1Id },
      { name: 'Sistema de Gestão', description: 'Sistema personalizado de gestão', price: 12000.00, projectId: project2Id },
      { name: 'Design Gráfico', description: 'Serviços de design gráfico e identidade visual', price: 4000.00, projectId: project2Id },
      { name: 'Redes Sociais', description: 'Gestão de redes sociais e conteúdo', price: 2000.00, projectId: project2Id },
    ]

    for (const service of serviceData) {
      const id = await createDocument<Service>('services', {
        ...service,
        currency: 'BRL' as const,
        active: true,
        createdBy: userId,
      })
      services.push(id)
    }

    // ============================================
    // 5. CRIAR FUNIS
    // ============================================
    console.log('[Seed] Criando funis...')
    const funnels: string[] = []
    
    // Funil 1 - Martech (padrão)
    const funnel1Id = await createDocument<Funnel>('funnels', {
      ...DEFAULT_MARTECH_FUNNEL,
      projectId: project1Id,
      createdBy: userId,
    })
    funnels.push(funnel1Id)

    // Funil 2 - Vendas Geral
    const funnel2Id = await createDocument<Funnel>('funnels', {
      name: 'Funil de Vendas Geral',
      description: 'Funil padrão para vendas gerais',
      type: 'custom',
      active: true,
      stages: [
        { id: 'lead', name: 'Lead', order: 1, color: '#4285F4', isWonStage: false, isLostStage: false },
        { id: 'qualificacao', name: 'Qualificação', order: 2, color: '#34A853', isWonStage: false, isLostStage: false },
        { id: 'proposta', name: 'Proposta', order: 3, color: '#FBBC04', isWonStage: false, isLostStage: false },
        { id: 'negociacao', name: 'Negociação', order: 4, color: '#FF9800', isWonStage: false, isLostStage: false },
        { id: 'fechado_ganho', name: 'Fechado - Ganho', order: 5, color: '#10B981', isWonStage: true, isLostStage: false },
        { id: 'fechado_perda', name: 'Fechado - Perda', order: 6, color: '#EF4444', isWonStage: false, isLostStage: true },
      ],
      projectId: project2Id,
      createdBy: userId,
    })
    funnels.push(funnel2Id)

    // ============================================
    // 6. CRIAR MOTIVOS DE FECHAMENTO
    // ============================================
    console.log('[Seed] Criando motivos de fechamento...')
    for (const reason of DEFAULT_MARTECH_CLOSE_REASONS) {
      await createDocument<CloseReason>('closeReasons', {
        ...reason,
        createdBy: userId,
      })
    }

    // ============================================
    // 7. CRIAR NEGOCIAÇÕES
    // ============================================
    console.log('[Seed] Criando negociações...')
    const deals: string[] = []
    
    const dealData = [
      {
        title: 'Site para Tech Solutions',
        contactId: contacts[0],
        companyId: companies[0],
        stage: 'negociacao',
        value: 5000.00,
        probability: 75,
        serviceIds: [services[0]],
        expectedCloseDate: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        status: 'active' as const,
        projectId: project1Id,
      },
      {
        title: 'E-commerce Digital Marketing',
        contactId: contacts[1],
        companyId: companies[1],
        stage: 'proposta',
        value: 15000.00,
        probability: 50,
        serviceIds: [services[1]],
        expectedCloseDate: Timestamp.fromDate(new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)),
        status: 'active' as const,
        projectId: project1Id,
      },
      {
        title: 'Consultoria Pedro Oliveira',
        contactId: contacts[2],
        stage: 'qualificacao',
        value: 2500.00,
        probability: 30,
        serviceIds: [services[3]],
        status: 'active' as const,
        projectId: project1Id,
      },
      {
        title: 'SEO Tech Solutions',
        contactId: contacts[0],
        companyId: companies[0],
        stage: 'fechado_ganho',
        value: 3000.00,
        probability: 100,
        serviceIds: [services[2]],
        status: 'won' as const,
        closeReason: 'Aceitou proposta',
        closedAt: Timestamp.fromDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)),
        projectId: project1Id,
      },
      {
        title: 'App Mobile Inovação',
        contactId: contacts[3],
        companyId: companies[2],
        stage: 'negociacao',
        value: 20000.00,
        probability: 60,
        serviceIds: [services[4]],
        expectedCloseDate: Timestamp.fromDate(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)),
        status: 'active' as const,
        projectId: project1Id,
      },
      {
        title: 'Sistema de Gestão Startup XYZ',
        contactId: contacts[4],
        companyId: companies[3],
        stage: 'proposta',
        value: 12000.00,
        probability: 40,
        serviceIds: [services[5]],
        expectedCloseDate: Timestamp.fromDate(new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)),
        status: 'active' as const,
        projectId: project2Id,
      },
      {
        title: 'Design Gráfico Empresa ABC',
        contactId: contacts[5],
        companyId: companies[4],
        stage: 'qualificacao',
        value: 4000.00,
        probability: 25,
        serviceIds: [services[6]],
        status: 'active' as const,
        projectId: project2Id,
      },
      {
        title: 'Gestão Redes Sociais',
        contactId: contacts[6],
        stage: 'lead',
        value: 2000.00,
        probability: 20,
        serviceIds: [services[7]],
        status: 'paused' as const,
        projectId: project1Id,
      },
      {
        title: 'Projeto Perdido - Exemplo',
        contactId: contacts[7],
        stage: 'fechado_perda',
        value: 5000.00,
        probability: 0,
        serviceIds: [services[0]],
        status: 'lost' as const,
        closeReason: 'Preço alto / Sem orçamento',
        closedAt: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
        projectId: project2Id,
      },
    ]

    for (const deal of dealData) {
      const id = await createDocument<Deal>('deals', {
        ...deal,
        currency: 'BRL' as const,
        createdBy: userId,
      })
      deals.push(id)
    }

    // ============================================
    // 8. CRIAR TAREFAS
    // ============================================
    console.log('[Seed] Criando tarefas...')
    
    const taskData = [
      {
        title: 'Enviar proposta para Tech Solutions',
        description: 'Preparar e enviar proposta comercial',
        dealId: deals[0],
        type: 'call',
        assignedTo: userId,
        dueDate: Timestamp.fromDate(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)),
        status: 'pending' as const,
        projectId: project1Id,
      },
      {
        title: 'Reunião com Digital Marketing',
        description: 'Apresentação da proposta de e-commerce',
        dealId: deals[1],
        type: 'meeting',
        assignedTo: userId,
        dueDate: Timestamp.fromDate(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)),
        status: 'pending' as const,
        projectId: project1Id,
      },
      {
        title: 'Follow-up Pedro Oliveira',
        description: 'Ligar para qualificar necessidade',
        dealId: deals[2],
        type: 'call',
        assignedTo: userId,
        dueDate: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)), // Atrasada
        status: 'pending' as const,
        projectId: project1Id,
      },
      {
        title: 'Tarefa Concluída - Exemplo',
        description: 'Tarefa já finalizada',
        dealId: deals[3],
        type: 'other',
        assignedTo: userId,
        dueDate: Timestamp.fromDate(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)),
        status: 'completed' as const,
        projectId: project1Id,
      },
      {
        title: 'Negociar contrato App Mobile',
        description: 'Discutir termos e condições',
        dealId: deals[4],
        type: 'meeting',
        assignedTo: userId,
        dueDate: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
        status: 'pending' as const,
        projectId: project1Id,
      },
      {
        title: 'Enviar proposta Startup XYZ',
        description: 'Proposta do sistema de gestão',
        dealId: deals[5],
        type: 'email',
        assignedTo: userId,
        dueDate: Timestamp.fromDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)),
        status: 'pending' as const,
        projectId: project2Id,
      },
    ]

    for (const task of taskData) {
      await createDocument<Task>('tasks', {
        ...task,
        createdBy: userId,
      })
    }

    // ============================================
    // 9. CRIAR PROPOSTAS
    // ============================================
    console.log('[Seed] Criando propostas...')
    
    const proposalData = [
      {
        dealId: deals[0],
        title: 'Proposta - Site Tech Solutions',
        description: 'Proposta comercial para desenvolvimento de site institucional',
        status: 'sent' as const,
        value: 5000.00,
        currency: 'BRL' as const,
        services: [
          {
            serviceId: services[0],
            quantity: 1,
            unitPrice: 5000.00,
          },
        ],
        sentAt: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)),
        projectId: project1Id,
      },
      {
        dealId: deals[1],
        title: 'Proposta - E-commerce Digital Marketing',
        description: 'Proposta comercial para e-commerce completo',
        status: 'draft' as const,
        value: 15000.00,
        currency: 'BRL' as const,
        services: [
          {
            serviceId: services[1],
            quantity: 1,
            unitPrice: 15000.00,
          },
        ],
        projectId: project1Id,
      },
      {
        dealId: deals[4],
        title: 'Proposta - App Mobile Inovação',
        description: 'Proposta comercial para desenvolvimento de aplicativo mobile',
        status: 'sent' as const,
        value: 20000.00,
        currency: 'BRL' as const,
        services: [
          {
            serviceId: services[4],
            quantity: 1,
            unitPrice: 20000.00,
          },
        ],
        sentAt: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 28 * 24 * 60 * 60 * 1000)),
        projectId: project1Id,
      },
    ]

    for (const proposal of proposalData) {
      await createDocument<Proposal>('proposals', {
        ...proposal,
        createdBy: userId,
      })
    }

    // ============================================
    // RESUMO
    // ============================================
    console.log('\n[Seed] ✅ Seed completo concluído com sucesso!')
    console.log(`[Seed] Projetos criados: 2`)
    console.log(`[Seed] Empresas criadas: ${companies.length}`)
    console.log(`[Seed] Contatos criados: ${contacts.length}`)
    console.log(`[Seed] Serviços criados: ${services.length}`)
    console.log(`[Seed] Funis criados: ${funnels.length}`)
    console.log(`[Seed] Negociações criadas: ${deals.length}`)
    console.log(`[Seed] Tarefas criadas: ${taskData.length}`)
    console.log(`[Seed] Propostas criadas: ${proposalData.length}`)
    console.log(`[Seed] Motivos de fechamento: ${DEFAULT_MARTECH_CLOSE_REASONS.length}`)
    
  } catch (error) {
    console.error('[Seed] ❌ Erro ao fazer seed completo:', error)
    throw error
  }
}

