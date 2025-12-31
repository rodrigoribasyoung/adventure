import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { OAuthCredentials } from '../hooks/useIntegrationCredentials'
import { FiEye, FiEyeOff, FiInfo } from 'react-icons/fi'

interface OAuthCredentialsFormProps {
  provider: 'meta_ads' | 'google_ads' | 'google_analytics'
  providerName: string
  credentials: OAuthCredentials | null
  onSave: (credentials: OAuthCredentials) => Promise<void>
  onCancel?: () => void
  loading?: boolean
}

export const OAuthCredentialsForm = ({
  provider,
  providerName,
  credentials,
  onSave,
  onCancel,
  loading = false,
}: OAuthCredentialsFormProps) => {
  const [clientId, setClientId] = useState(credentials?.clientId || '')
  const [clientSecret, setClientSecret] = useState(credentials?.clientSecret || '')
  const [showSecret, setShowSecret] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!clientId.trim() || !clientSecret.trim()) {
      setError('Por favor, preencha todos os campos')
      return
    }

    try {
      setSaving(true)
      await onSave({ clientId: clientId.trim(), clientSecret: clientSecret.trim() })
      // Limpar campos após salvar (por segurança)
      setClientSecret('')
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar credenciais')
    } finally {
      setSaving(false)
    }
  }

  const getInstructions = () => {
    switch (provider) {
      case 'google_ads':
        return {
          title: 'Como obter credenciais do Google Ads',
          steps: [
            '1. Acesse https://console.cloud.google.com/',
            '2. Crie um novo projeto ou selecione um existente',
            '3. Vá em "APIs e Serviços" → "Biblioteca"',
            '4. Procure e habilite "Google Ads API"',
            '5. Vá em "APIs e Serviços" → "Credenciais"',
            '6. Clique em "Criar credenciais" → "ID do cliente OAuth"',
            '7. Configure como "Aplicativo da Web"',
            '8. Adicione a URI de redirecionamento:',
            `   ${window.location.origin}/auth/${provider.replace('_', '-')}/callback`,
            '9. Copie o Client ID e Client Secret',
          ],
        }
      case 'meta_ads':
        return {
          title: 'Como obter credenciais do Meta Ads',
          steps: [
            '1. Acesse https://developers.facebook.com/',
            '2. Vá em "Meus Apps" → "Criar App"',
            '3. Selecione "Negócios" como tipo de app',
            '4. Preencha as informações do app',
            '5. Vá em "Configurações" → "Básico"',
            '6. Copie o "ID do App" (Client ID)',
            '7. Vá em "Configurações" → "Básico" → "Chave Secreta do App"',
            '8. Copie a "Chave Secreta do App" (Client Secret)',
            '9. Adicione a URI de redirecionamento OAuth válido:',
            `   ${window.location.origin}/auth/${provider.replace('_', '-')}/callback`,
          ],
        }
      case 'google_analytics':
        return {
          title: 'Como obter credenciais do Google Analytics',
          steps: [
            '1. Acesse https://console.cloud.google.com/',
            '2. Crie um novo projeto ou selecione um existente',
            '3. Vá em "APIs e Serviços" → "Biblioteca"',
            '4. Procure e habilite "Google Analytics Data API"',
            '5. Vá em "APIs e Serviços" → "Credenciais"',
            '6. Clique em "Criar credenciais" → "ID do cliente OAuth"',
            '7. Configure como "Aplicativo da Web"',
            '8. Adicione a URI de redirecionamento:',
            `   ${window.location.origin}/auth/${provider.replace('_', '-')}/callback`,
            '9. Copie o Client ID e Client Secret',
          ],
        }
      default:
        return { title: '', steps: [] }
    }
  }

  const instructions = getInstructions()

  return (
    <Card>
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">
            Configurar Credenciais {providerName}
          </h3>
          <p className="text-sm text-white/70">
            Insira suas credenciais OAuth para conectar sua conta {providerName}. 
            As credenciais serão salvas de forma segura e vinculadas a este projeto.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              label="Client ID"
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Ex: 123456789-abc123.apps.googleusercontent.com"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-white/90">Client Secret</label>
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="text-white/60 hover:text-white transition-colors"
              >
                {showSecret ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            <Input
              type={showSecret ? 'text' : 'password'}
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder="Ex: GOCSPX-xxxxxxxxxxxx"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="submit"
              variant="primary-red"
              disabled={saving || loading}
              className="flex-1"
            >
              {saving ? 'Salvando...' : credentials ? 'Atualizar Credenciais' : 'Salvar Credenciais'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={saving || loading}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10">
          <details className="group">
            <summary className="flex items-center gap-2 cursor-pointer text-sm text-white/70 hover:text-white transition-colors">
              <FiInfo size={16} />
              <span>Como obter essas credenciais?</span>
            </summary>
            <div className="mt-4 pl-6 space-y-2">
              <h4 className="text-sm font-medium text-white mb-2">{instructions.title}</h4>
              <ol className="text-xs text-white/60 space-y-1 list-decimal list-inside">
                {instructions.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          </details>
        </div>
      </div>
    </Card>
  )
}
