import { useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Toast } from '@/components/ui/Toast'
import { useProject } from '@/contexts/ProjectContext'
import { useAuth } from '@/contexts/AuthContext'
import { parseCsv, processClientReportsCsv } from '../utils/csvParser'
import { createDocumentsBatch } from '@/lib/firebase/db'
import { MarketingReport, SalesReport } from '../types'
import { useClientReports } from '../hooks/useClientReports'

interface CsvImporterProps {
  onImportComplete?: () => void
}

export const CsvImporter = ({ onImportComplete }: CsvImporterProps) => {
  const { currentProject } = useProject()
  const { currentUser } = useAuth()
  const { refetchAll } = useClientReports(currentProject?.id)
  
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<{ current: number; total: number; status: string } | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!currentProject) {
      setToast({
        message: 'Nenhum projeto selecionado',
        type: 'error',
        visible: true,
      })
      return
    }

    if (!currentUser) {
      setToast({
        message: 'Usuário não autenticado',
        type: 'error',
        visible: true,
      })
      return
    }

    try {
      setLoading(true)
      setProgress(null)
      
      const text = await file.text()
      const csvData = parseCsv(text)
      
      if (csvData.length === 0) {
        throw new Error('Nenhum dado encontrado no CSV')
      }

      // Processar CSV e transformar em relatórios
      const { marketingReports, salesReports } = processClientReportsCsv(
        csvData,
        currentProject.id,
        currentUser.uid
      )

      const total = marketingReports.length + salesReports.length
      setProgress({ current: 0, total, status: 'Preparando dados...' })

      // Preparar dados para batch (remover id, createdAt, updatedAt, createdBy já está incluído)
      const marketingReportsData = marketingReports.map(report => {
        const { id, createdAt, updatedAt, ...data } = report
        return data as Omit<MarketingReport, 'id' | 'createdAt' | 'updatedAt'>
      })

      const salesReportsData = salesReports.map(report => {
        const { id, createdAt, updatedAt, ...data } = report
        return data as Omit<SalesReport, 'id' | 'createdAt' | 'updatedAt'>
      })

      // Criar relatórios de marketing em batch
      if (marketingReportsData.length > 0) {
        setProgress({ 
          current: 0, 
          total, 
          status: `Criando ${marketingReportsData.length} relatório(s) de marketing...` 
        })
        
        try {
          await createDocumentsBatch<MarketingReport>('marketingReports', marketingReportsData)
          setProgress({ 
            current: marketingReportsData.length, 
            total, 
            status: 'Relatórios de marketing criados!' 
          })
        } catch (error) {
          console.error('Erro ao criar batch de relatórios de marketing:', error)
          throw new Error('Erro ao criar relatórios de marketing')
        }
      }

      // Criar relatórios de vendas em batch
      if (salesReportsData.length > 0) {
        setProgress({ 
          current: marketingReportsData.length, 
          total, 
          status: `Criando ${salesReportsData.length} relatório(s) de vendas...` 
        })
        
        try {
          await createDocumentsBatch<SalesReport>('salesReports', salesReportsData)
          setProgress({ 
            current: total, 
            total, 
            status: 'Todos os relatórios criados!' 
          })
        } catch (error) {
          console.error('Erro ao criar batch de relatórios de vendas:', error)
          throw new Error('Erro ao criar relatórios de vendas')
        }
      }

      // Recarregar dados após importação
      setProgress({ 
        current: total, 
        total, 
        status: 'Recarregando dados...' 
      })
      await refetchAll()

      setToast({
        message: `${marketingReports.length} relatório(s) de marketing e ${salesReports.length} relatório(s) de vendas importado(s) com sucesso!`,
        type: 'success',
        visible: true,
      })

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Callback de conclusão
      if (onImportComplete) {
        onImportComplete()
      }
    } catch (error: any) {
      console.error('Erro ao importar CSV:', error)
      setToast({
        message: error?.message || 'Erro ao importar CSV',
        type: 'error',
        visible: true,
      })
    } finally {
      setLoading(false)
      setProgress(null)
    }
  }

  return (
    <>
      <Card>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Importar Relatórios Diários via CSV
            </h3>
            <p className="text-white/70 text-sm mb-4">
              Faça o upload do arquivo CSV do relatório diário (formato Young Empreendimentos).
              O sistema irá processar e criar relatórios de marketing e vendas automaticamente.
            </p>
            {progress && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-white/70 mb-1">
                  <span>{progress.status || 'Processando...'}</span>
                  <span>{progress.current} / {progress.total}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-primary-red h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-import-reports"
              />
              <Button
                variant="primary-red"
                disabled={loading || !currentProject}
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                {loading ? 'Importando...' : '📤 Selecionar e Importar CSV'}
              </Button>
            </div>
          </div>

          {!currentProject && (
            <p className="text-sm text-yellow-400">
              ⚠️ Selecione um projeto antes de importar
            </p>
          )}
        </div>
      </Card>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </>
  )
}
