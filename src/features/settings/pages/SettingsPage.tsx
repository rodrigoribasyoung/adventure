import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Link } from 'react-router-dom'
import { FiTarget, FiEdit3, FiUsers, FiSettings, FiLink, FiDownload, FiFolder, FiFileText, FiFile, FiUser, FiClock, FiDatabase } from 'react-icons/fi'
import { usePermissions } from '@/hooks/usePermissions'

interface SettingsItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  description: string
}

const SettingsPage = () => {
  const { isMaster } = usePermissions()
  
  const settingsItems: SettingsItem[] = [
    { id: 'funnels', label: 'Funis', icon: FiTarget, path: '/settings/funnels', description: 'Gerencie seus funis e estágios de vendas' },
    { id: 'customFields', label: 'Campos Personalizados', icon: FiEdit3, path: '/settings/custom-fields', description: 'Crie campos personalizados para contatos, empresas e negociações' },
    { id: 'users', label: 'Usuários', icon: FiUsers, path: '/settings/users', description: 'Gerencie usuários e permissões do sistema' },
    { id: 'automations', label: 'Automações', icon: FiSettings, path: '/settings/automations', description: 'Configure automações e workflows para agilizar processos' },
    { id: 'integrations', label: 'Integrações', icon: FiLink, path: '/settings/integrations', description: 'Conecte suas contas de marketing (Meta Ads, Google Ads, Analytics)' },
    { id: 'imports', label: 'Importar/Exportar Dados', icon: FiDownload, path: '/settings/imports', description: 'Importe e exporte dados de contatos, empresas e negociações via CSV' },
    { id: 'projects', label: 'Projetos', icon: FiFolder, path: '/projects', description: 'Gerencie os projetos e clientes do sistema' },
    { id: 'services', label: 'Serviços', icon: FiFileText, path: '/services', description: 'Gerencie seus serviços e produtos' },
    { id: 'proposals', label: 'Propostas', icon: FiFile, path: '/proposals', description: 'Gerencie propostas comerciais' },
    { id: 'projectMembers', label: 'Responsáveis', icon: FiUser, path: '/project-members', description: 'Gerencie os responsáveis e colaboradores do projeto' },
    { id: 'activityHistory', label: 'Histórico de Ações', icon: FiClock, path: '/settings/activity-history', description: 'Visualize o histórico de todas as ações realizadas no sistema' },
    ...(isMaster ? [{ id: 'tenants', label: 'Tenants', icon: FiDatabase, path: '/settings/tenants', description: 'Gerencie contas de clientes, projetos e permissões' }] : []),
  ]

  return (
    <Container>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl text-white/90 mb-1">Configurações</h1>
          <p className="text-white/60 text-sm">Gerencie as configurações do sistema</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {settingsItems.map((item) => (
            <Link key={item.id} to={item.path}>
              <Card variant="elevated" className="cursor-pointer hover:border-primary-red/50 transition-all h-full">
                <div className="p-3">
                  <div className="mb-2">
                    <item.icon className="w-6 h-6 text-primary-red" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">{item.label}</h3>
                  <p className="text-white/60 text-xs line-clamp-2">{item.description}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </Container>
  )
}

export default SettingsPage

