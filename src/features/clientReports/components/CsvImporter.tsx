import { useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Toast } from '@/components/ui/Toast'
import { useClientReports } from '../hooks/useClientReports'
import { useProject } from '@/contexts/ProjectContext'
import { useAuth } from '@/contexts/AuthContext'
import { parseCsv, processClientReportsCsv } from '../utils/csvParser'

interface CsvImporterProps {
  onImportComplete?: () => void
}

export const CsvImporter = ({ onImportComplete }: CsvImporterProps) => {
  const { currentProject } = useProject()
  const { currentUser } = useAuth()
  const { createMarketingReportFull, createSalesReportFull } = useClientReports(currentProject?.id)
  
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)
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
      setProgress({ current: 0, total })

      // Criar relatórios de marketing
      let current = 0
      for (const report of marketingReports) {
        try {
          await createMarketingReportFull(report)
          current++
          setProgress({ current, total })
        } catch (error) {
          console.error('Erro ao criar relatório de marketing:', error)
        }
      }

      // Criar relatórios de vendas
      for (const report of salesReports) {
        try {
          await createSalesReportFull(report)
          current++
          setProgress({ current, total })
        } catch (error) {
          console.error('Erro ao criar relatório de vendas:', error)
        }
      }

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
                  <span>Processando...</span>
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
