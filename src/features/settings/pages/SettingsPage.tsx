import { Container } from '@/components/layout/Container'
import { Link } from 'react-router-dom'
import { FiTarget, FiEdit3, FiUsers, FiSettings, FiLink, FiDownload, FiFolder, FiFileText, FiFile, FiUser, FiClock, FiDatabase, FiBookOpen, FiChevronRight } from 'react-icons/fi'
import { usePermissions } from '@/hooks/usePermissions'

interface SettingsItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  description: string
  category?: string
}

const SettingsPage = () => {
  const { isMaster } = usePermissions()
  
  const settingsItems: SettingsItem[] = [
    { id: 'funnels', label: 'Funis', icon: FiTarget, path: '/settings/funnels', description: 'Gerencie funis e estágios', category: 'CRM' },
    { id: 'customFields', label: 'Campos Personalizados', icon: FiEdit3, path: '/settings/custom-fields', description: 'Crie campos customizados', category: 'CRM' },
    { id: 'users', label: 'Usuários', icon: FiUsers, path: '/settings/users', description: 'Gerencie usuários e permissões', category: 'Sistema' },
    { id: 'automations', label: 'Automações', icon: FiSettings, path: '/settings/automations', description: 'Configure automações e workflows', category: 'Sistema' },
    { id: 'integrations', label: 'Integrações', icon: FiLink, path: '/settings/integrations', description: 'Conecte contas de marketing', category: 'Integrações' },
    { id: 'imports', label: 'Importar/Exportar', icon: FiDownload, path: '/settings/imports', description: 'Importe e exporte dados via CSV', category: 'Dados' },
    { id: 'projects', label: 'Projetos', icon: FiFolder, path: '/projects', description: 'Gerencie projetos e clientes', category: 'Sistema' },
    { id: 'services', label: 'Serviços', icon: FiFileText, path: '/services', description: 'Gerencie serviços e produtos', category: 'CRM' },
    { id: 'proposals', label: 'Propostas', icon: FiFile, path: '/proposals', description: 'Gerencie propostas comerciais', category: 'CRM' },
    { id: 'projectMembers', label: 'Responsáveis', icon: FiUser, path: '/project-members', description: 'Gerencie responsáveis e colaboradores', category: 'Sistema' },
    { id: 'activityHistory', label: 'Histórico de Ações', icon: FiClock, path: '/settings/activity-history', description: 'Visualize histórico de ações', category: 'Sistema' },
    { id: 'documentation', label: 'Documentação', icon: FiBookOpen, path: '/settings/documentation', description: 'Documentação completa do CRM', category: 'Sistema' },
    ...(isMaster ? [{ id: 'tenants', label: 'Tenants', icon: FiDatabase, path: '/settings/tenants', description: 'Gerencie contas de clientes', category: 'Admin' }] : []),
  ]

  // Agrupar por categoria
  const groupedItems = settingsItems.reduce((acc, item) => {
    const category = item.category || 'Outros'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(item)
    return acc
  }, {} as Record<string, SettingsItem[]>)

  const categories = Object.keys(groupedItems).sort()

  return (
    <Container>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-white mb-1">Configurações</h1>
          <p className="text-white/60 text-sm">Gerencie as configurações do sistema</p>
        </div>

        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category}>
              <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-3 px-1">
                {category}
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                {groupedItems[category].map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      className="group relative overflow-hidden bg-white/5 border border-white/10 rounded-lg p-4 hover:border-primary-red/50 hover:bg-white/10 transition-all duration-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-red/20 group-hover:border-primary-red/30 transition-colors">
                          <Icon className="w-5 h-5 text-white/70 group-hover:text-primary-red transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-white mb-0.5">{item.label}</h3>
                          <p className="text-sm text-white/60 line-clamp-1">{item.description}</p>
                        </div>
                      </div>
                      <FiChevronRight className="w-5 h-5 text-white/40 group-hover:text-primary-red group-hover:translate-x-1 transition-all flex-shrink-0 ml-4" />
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  )
}

export default SettingsPage
