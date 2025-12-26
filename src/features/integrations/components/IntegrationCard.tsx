import { IntegrationConfig } from '../types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface IntegrationCardProps {
  config: IntegrationConfig
  onConnect: () => void
  onDisconnect: () => void
  connecting?: boolean
}

export const IntegrationCard = ({ config, onConnect, onDisconnect, connecting }: IntegrationCardProps) => {
  return (
    <Card variant="elevated" className="h-full">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{config.icon}</div>
            <div>
              <h3 className="text-xl font-semibold text-white">{config.name}</h3>
              <p className="text-sm text-white/70 mt-1">{config.description}</p>
            </div>
          </div>
          {config.isConnected && (
            <span className="px-3 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">
              Conectado
            </span>
          )}
        </div>

        {config.isConnected && config.connection && (
          <div className="mb-4 p-3 bg-white/5 rounded-lg">
            <p className="text-sm text-white/80">
              Conta: <span className="font-medium">{config.connection.accountName}</span>
            </p>
            <p className="text-xs text-white/60 mt-1">
              Conectado em {new Date(config.connection.connectedAt.toMillis()).toLocaleDateString('pt-BR')}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          {config.isConnected ? (
            <Button
              variant="ghost"
              onClick={onDisconnect}
              className="flex-1"
            >
              Desconectar
            </Button>
          ) : (
            <Button
              variant="primary-red"
              onClick={onConnect}
              disabled={connecting}
              className="flex-1"
            >
              {connecting ? 'Conectando...' : 'Conectar'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

