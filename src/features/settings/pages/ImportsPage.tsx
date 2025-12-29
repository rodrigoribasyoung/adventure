import { Container } from '@/components/layout/Container'
import { CsvImport } from '@/components/imports/CsvImport'
import { useContacts } from '@/features/contacts/hooks/useContacts'
import { useCompanies } from '@/features/companies/hooks/useCompanies'
import { useDeals } from '@/features/deals/hooks/useDeals'
import { useFunnels } from '@/features/funnels/hooks/useFunnels'
import { Timestamp } from 'firebase/firestore'
const ImportsPage = () => {
  const { createContact } = useContacts()
  const { createCompany } = useCompanies()
  const { createDeal } = useDeals()
  const { activeFunnel } = useFunnels()

  const handleContactsImport = async (data: any[]) => {
    for (const row of data) {
      const fullName = row.name || row.nome || ''
      const nameParts = fullName.split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || undefined
      
      await createContact({
        firstName,
        lastName,
        email: row.email || undefined,
        phone: row.phone || row.telefone || undefined,
        companyId: row.companyId || row.empresaId || undefined,
      })
    }
  }

  const handleCompaniesImport = async (data: any[]) => {
    for (const row of data) {
      await createCompany({
        name: row.name || row.nome || '',
        cnpj: row.cnpj || undefined,
        email: row.email || undefined,
        phone: row.phone || row.telefone || undefined,
        address: row.address || row.endereco ? {
          street: row.street || row.rua || undefined,
          city: row.city || row.cidade || undefined,
          state: row.state || row.estado || undefined,
          zipCode: row.zipCode || row.cep || undefined,
          country: row.country || row.pais || 'Brasil',
        } : undefined,
      })
    }
  }

  const handleDealsImport = async (data: any[]) => {
    if (!activeFunnel) {
      throw new Error('É necessário ter um funil ativo para importar negociações')
    }

    const firstStage = activeFunnel.stages[0]
    if (!firstStage) {
      throw new Error('Funil não possui estágios')
    }

    for (const row of data) {
      const title = row.title || row.titulo || ''
      const stageName = row.stage || row.estagio || ''
      
      // Tentar encontrar o estágio pelo nome
      let stageId = firstStage.id
      if (stageName) {
        const stage = activeFunnel.stages.find(s => 
          s.name.toLowerCase() === stageName.toLowerCase()
        )
        if (stage) {
          stageId = stage.id
        }
      }

      await createDeal({
        title,
        stage: stageId,
        contactId: row.contactId || row.contatoId || '',
        companyId: row.companyId || row.empresaId || undefined,
        value: parseFloat(row.value || row.valor || '0') || 0,
        currency: 'BRL' as const,
        probability: parseInt(row.probability || row.probabilidade || '50') || 50,
        serviceIds: row.serviceIds || row.servicosIds ? (row.serviceIds || row.servicosIds).split(',').map((id: string) => id.trim()) : [],
        expectedCloseDate: row.expectedCloseDate || row.dataFechamentoEsperada ? 
          Timestamp.fromDate(new Date(row.expectedCloseDate || row.dataFechamentoEsperada)) : 
          undefined,
      })
    }
  }

  const contactsSampleHeaders = ['name', 'email', 'phone', 'companyId']
  const contactsSampleData = [
    ['João Silva', 'joao@example.com', '(11) 98765-4321', ''],
    ['Maria Santos', 'maria@example.com', '(11) 91234-5678', ''],
  ]

  const companiesSampleHeaders = ['name', 'cnpj', 'email', 'phone', 'city', 'state']
  const companiesSampleData = [
    ['Tech Solutions Ltda', '12.345.678/0001-90', 'contato@techsolutions.com.br', '(11) 98765-4321', 'São Paulo', 'SP'],
    ['Digital Marketing Agency', '', 'hello@digitalmarketing.com.br', '(11) 91234-5678', 'Rio de Janeiro', 'RJ'],
  ]

  const dealsSampleHeaders = ['title', 'stage', 'contactId', 'value', 'probability']
  const dealsSampleData = [
    ['Negociação Exemplo 1', 'Proposta', '', '5000.00', '75'],
    ['Negociação Exemplo 2', 'Negociação', '', '10000.00', '50'],
  ]

  return (
    <Container>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Importações</h1>
          <p className="text-white/70">Importe dados de contatos, empresas e negociações via arquivo CSV</p>
        </div>

        <div className="space-y-6">
          <CsvImport
            entityType="contacts"
            onImport={handleContactsImport}
            sampleFileName="contatos-modelo.csv"
            sampleHeaders={contactsSampleHeaders}
            sampleData={contactsSampleData}
          />

          <CsvImport
            entityType="companies"
            onImport={handleCompaniesImport}
            sampleFileName="empresas-modelo.csv"
            sampleHeaders={companiesSampleHeaders}
            sampleData={companiesSampleData}
          />

          <CsvImport
            entityType="deals"
            onImport={handleDealsImport}
            sampleFileName="negociacoes-modelo.csv"
            sampleHeaders={dealsSampleHeaders}
            sampleData={dealsSampleData}
          />
        </div>
      </div>
    </Container>
  )
}

export default ImportsPage

