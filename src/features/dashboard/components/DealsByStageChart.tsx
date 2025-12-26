import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils/formatCurrency'

interface StageData {
  stageId: string
  stageName: string
  count: number
  value: number
}

interface DealsByStageChartProps {
  data: StageData[]
  maxValue?: number
}

export const DealsByStageChart = ({ data, maxValue }: DealsByStageChartProps) => {
  const maxCount = maxValue || Math.max(...data.map(d => d.count), 1)

  if (data.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-white/70">Nenhum dado disponível</p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="text-white font-semibold mb-4">Negociações por Estágio</h3>
      <div className="space-y-4">
        {data.map((stage) => {
          const percentage = (stage.count / maxCount) * 100
          return (
            <div key={stage.stageId} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/90">{stage.stageName}</span>
                <div className="flex items-center gap-3">
                  <span className="text-white/70">{stage.count} negociações</span>
                  <span className="text-primary-red font-semibold">
                    {formatCurrency(stage.value)}
                  </span>
                </div>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-blue transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}



