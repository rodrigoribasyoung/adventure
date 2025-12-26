import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Link } from 'react-router-dom'

const SettingsPage = () => {

  const settingsItems = [
    { id: 'funnels', label: 'Funís', icon: '🎯', path: '/funnels', description: 'Gerencie seus funis e estágios de vendas' },
    { id: 'customFields', label: 'Campos Personalizados', icon: '📝', path: '/settings/custom-fields', description: 'Crie campos personalizados para contatos, empresas e negociações' },
    { id: 'users', label: 'Usuários', icon: '👥', path: '/settings/users', description: 'Gerencie usuários e permissões do sistema' },
    { id: 'automations', label: 'Automações', icon: '⚙️', path: '/settings/automations', description: 'Configure automações e workflows para agilizar processos' },
    { id: 'integrations', label: 'Integrações', icon: '🔌', path: '/settings/integrations', description: 'Conecte suas contas de marketing (Meta Ads, Google Ads, Analytics)' },
  ]

  return (
    <Container>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Configurações</h1>
          <p className="text-white/70">Gerencie as configurações do sistema</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settingsItems.map((item) => (
            <Link key={item.id} to={item.path}>
              <Card variant="elevated" className="cursor-pointer hover:border-primary-red/50 transition-all h-full">
                <div className="p-6">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">{item.label}</h3>
                  <p className="text-white/70 text-sm">{item.description}</p>
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

