import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { SalesReportModal } from '../components/SalesReportModal'
import { ConversionReportModal } from '../components/ConversionReportModal'
import { PipelineReportModal } from '../components/PipelineReportModal'
import { FiBarChart2, FiTrendingUp, FiTarget, FiChevronRight, FiUsers } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { usePermissions } from '@/hooks/usePermissions'

const ReportsPage = () => {
  const { canAccessClientReports } = usePermissions()
  const [isSalesReportOpen, setIsSalesReportOpen] = useState(false)
  const [isConversionReportOpen, setIsConversionReportOpen] = useState(false)
  const [isPipelineReportOpen, setIsPipelineReportOpen] = useState(false)

  const reports = [
    {
      id: 'sales',
      title: 'Relatório de Vendas',
      description: 'Análise de vendas por período, estágio e responsável',
      icon: FiBarChart2,
      onClick: () => setIsSalesReportOpen(true),
    },
    {
      id: 'conversion',
      title: 'Relatório de Conversão',
      description: 'Taxa de conversão por estágio e período',
      icon: FiTrendingUp,
      onClick: () => setIsConversionReportOpen(true),
    },
    {
      id: 'pipeline',
      title: 'Relatório de Pipeline',
      description: 'Distribuição, valor e tempo médio em cada estágio',
      icon: FiTarget,
      onClick: () => setIsPipelineReportOpen(true),
    },
  ]

  return (
    <Container>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-white mb-1">Relatórios</h1>
          <p className="text-white/60 text-sm">Análise e insights do pipeline de vendas</p>
        </div>

        <div className="space-y-2">
          {reports.map((report) => {
            const Icon = report.icon
            return (
              <button
                key={report.id}
                onClick={report.onClick}
                className="w-full group relative overflow-hidden bg-white/5 border border-white/10 rounded-lg p-4 hover:border-primary-red/50 hover:bg-white/10 transition-all duration-200 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-primary-red/20 border border-primary-red/30 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-red/30 transition-colors">
                      <Icon className="w-5 h-5 text-primary-red" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-white mb-0.5">{report.title}</h3>
                      <p className="text-sm text-white/60 line-clamp-1">{report.description}</p>
                    </div>
                  </div>
                  <FiChevronRight className="w-5 h-5 text-white/40 group-hover:text-primary-red group-hover:translate-x-1 transition-all flex-shrink-0 ml-4" />
                </div>
              </button>
            )
          })}
          
          {/* Link para Relatórios de Cliente (apenas master) */}
          {canAccessClientReports && (
            <Link
              to="/client-reports"
              className="w-full group relative overflow-hidden bg-white/5 border border-white/10 rounded-lg p-4 hover:border-primary-blue/50 hover:bg-white/10 transition-all duration-200 text-left block"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-primary-blue/20 border border-primary-blue/30 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-blue/30 transition-colors">
                    <FiUsers className="w-5 h-5 text-primary-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white mb-0.5">Relatórios de Cliente</h3>
                    <p className="text-sm text-white/60 line-clamp-1">Dashboards e relatórios de marketing e vendas dos clientes</p>
                  </div>
                </div>
                <FiChevronRight className="w-5 h-5 text-white/40 group-hover:text-primary-blue group-hover:translate-x-1 transition-all flex-shrink-0 ml-4" />
              </div>
            </Link>
          )}
        </div>

        <div className="pt-4 border-t border-white/10">
          <p className="text-xs text-white/50">
            Todos os relatórios podem ser exportados em formato CSV ou PDF
          </p>
        </div>
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
