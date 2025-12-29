import { useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Toast } from '@/components/ui/Toast'

interface CsvImportProps {
  entityType: 'contacts' | 'companies' | 'deals'
  onImport: (data: any[]) => Promise<void>
  sampleFileName: string
  sampleHeaders: string[]
  sampleData: string[][]
}

export const CsvImport = ({ entityType, onImport, sampleFileName, sampleHeaders, sampleData }: CsvImportProps) => {
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const downloadSample = () => {
    const csvContent = [
      sampleHeaders.join(','),
      ...sampleData.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', sampleFileName)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const parseCsv = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) {
      throw new Error('CSV deve ter pelo menos um cabeçalho e uma linha de dados')
    }

    // Função para fazer parse de uma linha CSV considerando aspas
    const parseCsvLine = (line: string): string[] => {
      const result: string[] = []
      let current = ''
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      
      result.push(current.trim())
      return result
    }

    const headers = parseCsvLine(lines[0])
    const data: any[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvLine(lines[i])
      const row: any = {}
      
      headers.forEach((header, index) => {
        // Remove aspas do início e fim se existirem
        let value = values[index] || ''
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1)
        }
        row[header] = value
      })
      
      data.push(row)
    }

    return data
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setLoading(true)
      const text = await file.text()
      const data = parseCsv(text)
      
      if (data.length === 0) {
        throw new Error('Nenhum dado encontrado no CSV')
      }

      await onImport(data)
      setToast({ 
        message: `${data.length} ${entityType === 'contacts' ? 'contato(s)' : entityType === 'companies' ? 'empresa(s)' : 'negociação(ões)'} importado(s) com sucesso!`, 
        type: 'success', 
        visible: true 
      })
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error: any) {
      console.error('Erro ao importar CSV:', error)
      setToast({ 
        message: error?.message || 'Erro ao importar CSV', 
        type: 'error', 
        visible: true 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Importar {entityType === 'contacts' ? 'Contatos' : entityType === 'companies' ? 'Empresas' : 'Negociações'} via CSV
            </h3>
            <p className="text-white/70 text-sm mb-4">
              Faça o download do arquivo modelo, preencha com seus dados e faça o upload aqui.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={downloadSample}
              disabled={loading}
            >
              📥 Baixar Modelo CSV
            </Button>
            
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id={`csv-import-${entityType}`}
              />
              <Button
                variant="primary-red"
                disabled={loading}
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                {loading ? 'Importando...' : '📤 Selecionar e Importar CSV'}
              </Button>
            </div>
          </div>
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

