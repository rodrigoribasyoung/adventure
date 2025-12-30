import { collection, getDocs, query, limit, Timestamp } from 'firebase/firestore'
import { db } from './config'
import { createDocument, getDocuments } from './db'
import { Contact, Company, Service, Deal, Funnel, CloseReason, Project, Account } from '@/types'
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

// Função para garantir que o usuário master tenha conta e projeto
export const ensureMasterAccountAndProject = async (userId: string) => {
  console.log('[Seed] Verificando se usuário master tem conta e projeto...')
  
  try {
    // Buscar todas as contas ativas do usuário
    const allAccounts = await getDocuments<Account>('accounts', [])
    const accounts = allAccounts.filter(a => a.ownerId === userId && a.active)
    
    let accountId: string
    
    if (accounts.length === 0) {
      // Criar conta padrão
      console.log('[Seed] Criando conta padrão para usuário master...')
      accountId = await createDocument<Account>('accounts', {
        name: 'Conta Padrão',
        description: 'Conta padrão criada automaticamente',
        ownerId: userId,
        plan: 'basic',
        active: true,
        createdBy: userId,
      })
      console.log('[Seed] Conta criada:', accountId)
    } else {
      accountId = accounts[0].id
      console.log('[Seed] Conta encontrada:', accounts[0].name)
    }
    
    // Buscar todos os projetos e filtrar pela conta
    const allProjects = await getDocuments<Project>('projects', [])
    const projects = allProjects.filter(p => p.accountId === accountId && p.active)
    
    if (projects.length === 0) {
      // Criar projeto padrão
      console.log('[Seed] Criando projeto padrão para a conta...')
      const projectId = await createDocument<Project>('projects', {
        accountId: accountId,
        name: 'Projeto Padrão',
        description: 'Projeto padrão criado automaticamente',
        ownerId: userId,
        plan: 'basic',
        active: true,
        createdBy: userId,
      })
      console.log('[Seed] Projeto criado:', projectId)
      console.log('[Seed] Conta e projeto criados com sucesso!')
    } else {
      console.log('[Seed] Projeto encontrado:', projects[0].name)
    }
  } catch (error) {
    console.error('[Seed] Erro ao garantir conta e projeto:', error)
    throw error
  }
}

// Criar dados de teste
export const seedDatabase = async (userId: string) => {
  console.log('[Seed] Iniciando seed do banco de dados...')

  try {
    // Verificar se já existem dados
    const accountsExist = await hasData('accounts')
    const projectsExist = await hasData('projects')
    const contactsExist = await hasData('contacts')
    const companiesExist = await hasData('companies')
    const servicesExist = await hasData('services')
    const funnelsExist = await hasData('funnels')

    if (accountsExist || projectsExist || contactsExist || companiesExist || servicesExist || funnelsExist) {
      console.log('[Seed] Dados já existem. Pulando seed completo.')
      // Mas ainda garantir que o usuário master tenha conta e projeto
      await ensureMasterAccountAndProject(userId)
      return
    }

    // Criar conta padrão primeiro
    console.log('[Seed] Criando conta padrão...')
    const defaultAccountId = await createDocument<Account>('accounts', {
      name: 'Conta Padrão',
      description: 'Conta padrão criada automaticamente',
      ownerId: userId,
      plan: 'basic',
      active: true,
      createdBy: userId,
    })

    // Criar projeto padrão primeiro
    console.log('[Seed] Criando projeto padrão...')
    const defaultProjectId = await createDocument<Project>('projects', {
      accountId: defaultAccountId,
      name: 'Projeto Padrão',
      description: 'Projeto padrão criado automaticamente',
      ownerId: userId,
      plan: 'basic',
      active: true,
      createdBy: userId,
    })

    // Criar empresas primeiro
    console.log('[Seed] Criando empresas...')
    const company1Id = await createDocument<Company>('companies', {
      projectId: defaultProjectId,
      name: 'Tech Solutions Ltda',
      cnpj: '12.345.678/0001-90',
      email: 'contato@techsolutions.com.br',
      phone: '(11) 98765-4321',
      createdBy: userId,
    })

    const company2Id = await createDocument<Company>('companies', {
      projectId: defaultProjectId,
      name: 'Digital Marketing Agency',
      email: 'hello@digitalmarketing.com.br',
      phone: '(11) 91234-5678',
      createdBy: userId,
    })

    // Criar contatos
    console.log('[Seed] Criando contatos...')
    const contact1Id = await createDocument<Contact>('contacts', {
      projectId: defaultProjectId,
      firstName: 'João',
      lastName: 'Silva',
      name: 'João Silva',
      email: 'joao.silva@techsolutions.com.br',
      phone: '(11) 99876-5432',
      companyId: company1Id,
      createdBy: userId,
    })

    const contact2Id = await createDocument<Contact>('contacts', {
      projectId: defaultProjectId,
      firstName: 'Maria',
      lastName: 'Santos',
      name: 'Maria Santos',
      email: 'maria.santos@digitalmarketing.com.br',
      phone: '(11) 97654-3210',
      companyId: company2Id,
      createdBy: userId,
    })

    const contact3Id = await createDocument<Contact>('contacts', {
      projectId: defaultProjectId,
      firstName: 'Pedro',
      lastName: 'Oliveira',
      name: 'Pedro Oliveira',
      email: 'pedro.oliveira@email.com',
      phone: '(11) 96543-2109',
      createdBy: userId,
    })

    // Criar serviços
    console.log('[Seed] Criando serviços...')
    const service1Id = await createDocument<Service>('services', {
      projectId: defaultProjectId,
      name: 'Desenvolvimento de Site',
      description: 'Criação de site institucional responsivo',
      price: 5000.00,
      currency: 'BRL',
      active: true,
      createdBy: userId,
    })

    const service2Id = await createDocument<Service>('services', {
      projectId: defaultProjectId,
      name: 'E-commerce Completo',
      description: 'Loja virtual com painel administrativo',
      price: 15000.00,
      currency: 'BRL',
      active: true,
      createdBy: userId,
    })

    const service3Id = await createDocument<Service>('services', {
      projectId: defaultProjectId,
      name: 'SEO e Marketing Digital',
      description: 'Otimização para buscadores e campanhas',
      price: 3000.00,
      currency: 'BRL',
      active: true,
      createdBy: userId,
    })

    const service4Id = await createDocument<Service>('services', {
      projectId: defaultProjectId,
      name: 'Consultoria em Tecnologia',
      description: 'Consultoria estratégica em tecnologia',
      price: 2500.00,
      currency: 'BRL',
      active: true,
      createdBy: userId,
    })

    // Criar funil padrão Martech
    console.log('[Seed] Criando funil Martech...')
    await createDocument<Funnel>('funnels', {
      ...DEFAULT_MARTECH_FUNNEL,
      projectId: defaultProjectId,
      createdBy: userId,
    })

    // Criar motivos de fechamento padrão
    console.log('[Seed] Criando motivos de fechamento...')
    for (const reason of DEFAULT_MARTECH_CLOSE_REASONS) {
      await createDocument<CloseReason>('closeReasons', {
        ...reason,
        createdBy: userId,
      })
    }

    // Criar negociações
    console.log('[Seed] Criando negociações...')
    await createDocument<Deal>('deals', {
      projectId: defaultProjectId,
      title: 'Site para Tech Solutions',
      contactId: contact1Id,
      companyId: company1Id,
      stage: '3',
      value: 5000.00,
      currency: 'BRL',
      probability: 75,
      serviceIds: [service1Id],
      expectedCloseDate: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 dias
      createdBy: userId,
    })

    await createDocument<Deal>('deals', {
      projectId: defaultProjectId,
      title: 'E-commerce Digital Marketing',
      contactId: contact2Id,
      companyId: company2Id,
      stage: 'proposta',
      value: 15000.00,
      currency: 'BRL',
      probability: 50,
      serviceIds: [service2Id],
      status: 'active',
      expectedCloseDate: Timestamp.fromDate(new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)), // 45 dias
      createdBy: userId,
    })

    await createDocument<Deal>('deals', {
      projectId: defaultProjectId,
      title: 'Consultoria Pedro Oliveira',
      contactId: contact3Id,
      stage: 'qualificacao',
      value: 2500.00,
      currency: 'BRL',
      status: 'active',
      probability: 30,
      serviceIds: [service4Id],
      createdBy: userId,
    })

    await createDocument<Deal>('deals', {
      projectId: defaultProjectId,
      title: 'SEO Tech Solutions',
      contactId: contact1Id,
      companyId: company1Id,
      stage: '4',
      value: 3000.00,
      currency: 'BRL',
      probability: 100,
      serviceIds: [service3Id],
      createdBy: userId,
    })

    console.log('[Seed] Seed concluído com sucesso!')
  } catch (error) {
    console.error('[Seed] Erro ao fazer seed:', error)
    throw error
  }
}

