import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'

const DashboardPage = () => {
  return (
    <Container>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-white/70">Bem-vindo ao CRM Adventure Labs</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <h3 className="text-white/70 text-sm mb-2">Total de Negociações</h3>
            <p className="text-3xl font-bold text-white">0</p>
          </Card>
          
          <Card>
            <h3 className="text-white/70 text-sm mb-2">Valor Total</h3>
            <p className="text-3xl font-bold text-white">R$ 0,00</p>
          </Card>
          
          <Card>
            <h3 className="text-white/70 text-sm mb-2">Taxa de Conversão</h3>
            <p className="text-3xl font-bold text-white">0%</p>
          </Card>
          
          <Card>
            <h3 className="text-white/70 text-sm mb-2">Contatos</h3>
            <p className="text-3xl font-bold text-white">0</p>
          </Card>
        </div>
      </div>
    </Container>
  )
}

export default DashboardPage

