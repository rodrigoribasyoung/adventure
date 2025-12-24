import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SalesReportModal } from '../components/SalesReportModal'
import { ConversionReportModal } from '../components/ConversionReportModal'
import { PipelineReportModal } from '../components/PipelineReportModal'

const ReportsPage = () => {
  const [isSalesReportOpen, setIsSalesReportOpen] = useState(false)
  const [isConversionReportOpen, setIsConversionReportOpen] = useState(false)
  const [isPipelineReportOpen, setIsPipelineReportOpen] = useState(false)

  return (
    <Container>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Relatórios</h1>
          <p className="text-white/70">Análise e insights do seu pipeline de vendas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card variant="elevated" className="cursor-pointer hover:border-primary-red/50 transition-all">
            <div className="p-6">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-white mb-2">Relatório de Vendas</h3>
              <p className="text-white/70 text-sm mb-4">
                Análise de vendas por período, estágio e responsável
              </p>
              <Button 
                variant="primary-red" 
                className="w-full"
                onClick={() => setIsSalesReportOpen(true)}
              >
                Gerar Relatório
              </Button>
            </div>
          </Card>

          <Card variant="elevated" className="cursor-pointer hover:border-primary-red/50 transition-all">
            <div className="p-6">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-semibold text-white mb-2">Relatório de Conversão</h3>
              <p className="text-white/70 text-sm mb-4">
                Taxa de conversão por estágio e período
              </p>
              <Button 
                variant="primary-red" 
                className="w-full"
                onClick={() => setIsConversionReportOpen(true)}
              >
                Gerar Relatório
              </Button>
            </div>
          </Card>

          <Card variant="elevated" className="cursor-pointer hover:border-primary-red/50 transition-all">
            <div className="p-6">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-white mb-2">Relatório de Pipeline</h3>
              <p className="text-white/70 text-sm mb-4">
                Distribuição, valor e tempo médio em cada estágio
              </p>
              <Button 
                variant="primary-red" 
                className="w-full"
                onClick={() => setIsPipelineReportOpen(true)}
              >
                Gerar Relatório
              </Button>
            </div>
          </Card>
        </div>

        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Relatórios em Desenvolvimento</h2>
            <p className="text-white/70">
              Em breve você poderá gerar relatórios detalhados e exportá-los em PDF, Excel ou CSV.
            </p>
          </div>
        </Card>
      </div>

      <SalesReportModal
        isOpen={isSalesReportOpen}
        onClose={() => setIsSalesReportOpen(false)}
      />

      <ConversionReportModal
        isOpen={isConversionReportOpen}
        onClose={() => setIsConversionReportOpen(false)}
      />

      <PipelineReportModal
        isOpen={isPipelineReportOpen}
        onClose={() => setIsPipelineReportOpen(false)}
      />
    </Container>
  )
}

export default ReportsPage

