import { collection, getDocs, query, limit } from 'firebase/firestore'
import { db } from './config'
import { createDocument } from './db'
import { Timestamp } from 'firebase/firestore'
import { Contact, Company, Service, Deal, Funnel } from '@/types'

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

// Criar dados de teste
export const seedDatabase = async (userId: string) => {
  console.log('[Seed] Iniciando seed do banco de dados...')

  try {
    // Verificar se já existem dados
    const contactsExist = await hasData('contacts')
    const companiesExist = await hasData('companies')
    const servicesExist = await hasData('services')
    const funnelsExist = await hasData('funnels')

    if (contactsExist || companiesExist || servicesExist || funnelsExist) {
      console.log('[Seed] Dados já existem. Pulando seed.')
      return
    }

    // Criar empresas primeiro
    console.log('[Seed] Criando empresas...')
    const company1Id = await createDocument<Company>('companies', {
      name: 'Tech Solutions Ltda',
      cnpj: '12.345.678/0001-90',
      email: 'contato@techsolutions.com.br',
      phone: '(11) 98765-4321',
      createdBy: userId,
    })

    const company2Id = await createDocument<Company>('companies', {
      name: 'Digital Marketing Agency',
      email: 'hello@digitalmarketing.com.br',
      phone: '(11) 91234-5678',
      createdBy: userId,
    })

    // Criar contatos
    console.log('[Seed] Criando contatos...')
    const contact1Id = await createDocument<Contact>('contacts', {
      name: 'João Silva',
      email: 'joao.silva@techsolutions.com.br',
      phone: '(11) 99876-5432',
      companyId: company1Id,
      createdBy: userId,
    })

    const contact2Id = await createDocument<Contact>('contacts', {
      name: 'Maria Santos',
      email: 'maria.santos@digitalmarketing.com.br',
      phone: '(11) 97654-3210',
      companyId: company2Id,
      createdBy: userId,
    })

    const contact3Id = await createDocument<Contact>('contacts', {
      name: 'Pedro Oliveira',
      email: 'pedro.oliveira@email.com',
      phone: '(11) 96543-2109',
      createdBy: userId,
    })

    // Criar serviços
    console.log('[Seed] Criando serviços...')
    const service1Id = await createDocument<Service>('services', {
      name: 'Desenvolvimento de Site',
      description: 'Criação de site institucional responsivo',
      price: 5000.00,
      currency: 'BRL',
      active: true,
      createdBy: userId,
    })

    const service2Id = await createDocument<Service>('services', {
      name: 'E-commerce Completo',
      description: 'Loja virtual com painel administrativo',
      price: 15000.00,
      currency: 'BRL',
      active: true,
      createdBy: userId,
    })

    const service3Id = await createDocument<Service>('services', {
      name: 'SEO e Marketing Digital',
      description: 'Otimização para buscadores e campanhas',
      price: 3000.00,
      currency: 'BRL',
      active: true,
      createdBy: userId,
    })

    const service4Id = await createDocument<Service>('services', {
      name: 'Consultoria em Tecnologia',
      description: 'Consultoria estratégica em tecnologia',
      price: 2500.00,
      currency: 'BRL',
      active: true,
      createdBy: userId,
    })

    // Criar funil padrão
    console.log('[Seed] Criando funil padrão...')
    await createDocument<Funnel>('funnels', {
      name: 'Funil Padrão de Vendas',
      stages: [
        { id: '1', name: 'Qualificação', order: 1, color: '#4285F4' },
        { id: '2', name: 'Proposta Enviada', order: 2, color: '#FBBC04' },
        { id: '3', name: 'Negociação', order: 3, color: '#FF9800' },
        { id: '4', name: 'Fechado Ganho', order: 4, color: '#34A853' },
        { id: '5', name: 'Fechado Perdido', order: 5, color: '#EA4335' },
      ],
      active: true,
      createdBy: userId,
    })

    // Criar negociações
    console.log('[Seed] Criando negociações...')
    await createDocument<Deal>('deals', {
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
      title: 'E-commerce Digital Marketing',
      contactId: contact2Id,
      companyId: company2Id,
      stage: '2',
      value: 15000.00,
      currency: 'BRL',
      probability: 50,
      serviceIds: [service2Id],
      expectedCloseDate: Timestamp.fromDate(new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)), // 45 dias
      createdBy: userId,
    })

    await createDocument<Deal>('deals', {
      title: 'Consultoria Pedro Oliveira',
      contactId: contact3Id,
      stage: '1',
      value: 2500.00,
      currency: 'BRL',
      probability: 30,
      serviceIds: [service4Id],
      createdBy: userId,
    })

    await createDocument<Deal>('deals', {
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

