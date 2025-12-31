import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { useProjects } from '@/hooks/useProjects'
import { usePermissions } from '@/hooks/usePermissions'
import { useAuth } from '@/contexts/AuthContext'
import { useProject } from '@/contexts/ProjectContext'
import { Link } from 'react-router-dom'
import { CsvImporter } from '../components/CsvImporter'

const ClientReportsPage = () => {
  const { projects, loading: projectsLoading } = useProjects()
  const { canAccessClientReports, isMaster } = usePermissions()
  const { userData, loading: authLoading } = useAuth()
  const { loading: projectLoading } = useProject()
  const [showImporter, setShowImporter] = useState(false)

  // Aguardar carregamento dos dados antes de verificar permissões
  if (authLoading || projectLoading) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-white">Carregando permissões...</div>
        </div>
      </Container>
    )
  }

  // Debug: log dos valores
  console.log('[ClientReportsPage] Debug:', {
    canAccessClientReports,
    isMaster,
    userData: userData ? { id: userData.id, email: userData.email, isMaster: userData.isMaster } : null,
    authLoading,
    projectLoading,
  })

  if (!canAccessClientReports) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-red-400 text-center">
            <p className="text-xl font-semibold mb-2">Acesso Negado</p>
            <p className="text-white/60">Você não tem permissão para acessar relatórios de clientes.</p>
            <p className="text-white/40 text-xs mt-4">
              Debug: isMaster={String(isMaster)}, userData.isMaster={String(userData?.isMaster)}
            </p>
          </div>
        </div>
      </Container>
    )
  }

  if (projectsLoading) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-white">Carregando...</div>
        </div>
      </Container>
    )
  }

  const activeProjects = projects.filter(p => p.active)

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Relatórios de Clientes</h1>
            <p className="text-white/60 text-sm">
              Gerencie relatórios e dashboards de marketing e vendas dos clientes
            </p>
          </div>
          <Button
            variant="primary-red"
            onClick={() => setShowImporter(!showImporter)}
          >
            {showImporter ? 'Ocultar Importador' : 'Importar CSV'}
          </Button>
        </div>

        {showImporter && (
          <div className="mb-6">
            <CsvImporter onImportComplete={() => setShowImporter(false)} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeProjects.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-white/60">Nenhum projeto ativo encontrado</p>
            </div>
          ) : (
            activeProjects.map(project => (
              <Link
                key={project.id}
                to={`/client-reports/${project.id}`}
                className="block bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                  <svg
                    className="w-5 h-5 text-white/60"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <p className="text-white/60 text-sm mb-2">{project.description || 'Sem descrição'}</p>
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <span className="capitalize">{project.plan}</span>
                  {project.active && (
                    <>
                      <span>•</span>
                      <span className="text-green-400">Ativo</span>
                    </>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </Container>
  )
}

export default ClientReportsPage
