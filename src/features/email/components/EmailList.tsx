import { Email } from '../types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface EmailListProps {
  emails: Email[]
  loading?: boolean
  onEmailClick?: (email: Email) => void
}

export const EmailList = ({ emails, loading, onEmailClick }: EmailListProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-white/5 rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  if (emails.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/70">Nenhum email encontrado</p>
      </div>
    )
  }

  const getStatusColor = (status: Email['status']) => {
    switch (status) {
      case 'sent':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'draft':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default:
        return 'bg-white/10 text-white/70 border-white/20'
    }
  }

  const getStatusLabel = (status: Email['status']) => {
    switch (status) {
      case 'sent':
        return 'Enviado'
      case 'failed':
        return 'Falhou'
      case 'draft':
        return 'Rascunho'
      default:
        return status
    }
  }

  return (
    <div className="space-y-3">
      {emails.map((email) => (
        <div
          key={email.id}
          onClick={() => onEmailClick?.(email)}
          className={`
            p-4 bg-white/5 border border-white/10 rounded-lg
            hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer
            ${onEmailClick ? 'cursor-pointer' : ''}
          `}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <p className="font-medium text-white truncate">{email.subject}</p>
                <span
                  className={`
                    px-2 py-1 text-xs font-medium rounded border
                    ${getStatusColor(email.status)}
                  `}
                >
                  {getStatusLabel(email.status)}
                </span>
              </div>
              <p className="text-sm text-white/70 truncate mb-1">Para: {email.to}</p>
              <p className="text-sm text-white/60 line-clamp-2">{email.body}</p>
            </div>
            <div className="text-right text-sm text-white/60 whitespace-nowrap">
              {email.sentAt ? (
                <p>{format(email.sentAt.toDate(), "dd 'de' MMM, yyyy 'às' HH:mm", { locale: ptBR })}</p>
              ) : (
                <p>{format(email.createdAt.toDate(), "dd 'de' MMM, yyyy 'às' HH:mm", { locale: ptBR })}</p>
              )}
            </div>
          </div>
          {email.error && (
            <div className="mt-2 pt-2 border-t border-white/10">
              <p className="text-xs text-red-400">Erro: {email.error}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

