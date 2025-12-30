import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const marketingInterestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  role: z.string().min(1, 'Cargo é obrigatório'),
  roleOther: z.string().optional(),
  companyName: z.string().optional(),
  monthlyRevenue: z.string().optional(),
  employeeCount: z.string().optional(),
  dataConsent: z.boolean().refine((val) => val === true, {
    message: 'Você precisa concordar em compartilhar seus dados',
  }),
})

type MarketingInterestFormData = z.infer<typeof marketingInterestSchema>

export const MarketingInterestForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<MarketingInterestFormData>({
    resolver: zodResolver(marketingInterestSchema),
  })

  const selectedRole = watch('role')
  const showRoleOther = selectedRole === 'other'

  const revenueOptions = [
    { value: '', label: 'Selecione uma opção' },
    { value: 'ate-10k', label: 'Até R$ 10.000' },
    { value: '10k-50k', label: 'R$ 10.000 - R$ 50.000' },
    { value: '50k-100k', label: 'R$ 50.000 - R$ 100.000' },
    { value: '100k-500k', label: 'R$ 100.000 - R$ 500.000' },
    { value: '500k-1m', label: 'R$ 500.000 - R$ 1.000.000' },
    { value: 'acima-1m', label: 'Acima de R$ 1.000.000' },
  ]

  const employeeOptions = [
    { value: '', label: 'Selecione uma opção' },
    { value: '1-5', label: '1-5 funcionários' },
    { value: '6-10', label: '6-10 funcionários' },
    { value: '11-25', label: '11-25 funcionários' },
    { value: '26-50', label: '26-50 funcionários' },
    { value: '51-100', label: '51-100 funcionários' },
    { value: '101-500', label: '101-500 funcionários' },
    { value: 'acima-500', label: 'Acima de 500 funcionários' },
  ]

  const roleOptions = [
    { value: '', label: 'Selecione uma opção' },
    { value: 'ceo', label: 'CEO / Diretor' },
    { value: 'cto', label: 'CTO / Diretor de Tecnologia' },
    { value: 'cmo', label: 'CMO / Diretor de Marketing' },
    { value: 'marketing-manager', label: 'Gerente de Marketing' },
    { value: 'marketing-coordinator', label: 'Coordenador de Marketing' },
    { value: 'marketing-analyst', label: 'Analista de Marketing' },
    { value: 'commercial-manager', label: 'Gerente Comercial' },
    { value: 'commercial-coordinator', label: 'Coordenador Comercial' },
    { value: 'entrepreneur', label: 'Empreendedor' },
    { value: 'other', label: 'Outro' },
  ]

  const onSubmit = async (data: MarketingInterestFormData) => {
    setIsSubmitting(true)
    try {
      // Aqui você pode fazer a integração com sua API/backend
      console.log('Dados do formulário:', data)
      
      // Simulando envio (remover em produção e implementar chamada real)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSubmitSuccess(true)
      reset()
      
      // Resetar mensagem de sucesso após 5 segundos
      setTimeout(() => setSubmitSuccess(false), 5000)
    } catch (error) {
      console.error('Erro ao enviar formulário:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-gradient-to-br from-primary-blue/20 via-primary-red/10 to-primary-blue/20 border-primary-blue/30">
      <div className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl text-white/90 mb-3 font-semibold">
            Potencialize seus Resultados com Marketing & Tráfego Pago
          </h2>
          <p className="text-white/70 text-base max-w-2xl mx-auto">
            A Adventure Labs oferece soluções completas de Marketing Digital e Gestão de Tráfego Pago. 
            Transforme sua presença online e acelere o crescimento do seu negócio. 
            Deixe seu contato para consultar nossos planos e descobrir como podemos ajudar você.
          </p>
        </div>

        {submitSuccess && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <p className="text-green-400 text-sm text-center">
              Obrigado! Entraremos em contato em breve.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Nome *"
              {...register('name')}
              error={errors.name?.message}
              placeholder="Seu nome completo"
            />

            <Input
              label="Email *"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="seu@email.com"
            />

            <Input
              label="Telefone/WhatsApp *"
              {...register('phone')}
              error={errors.phone?.message}
              placeholder="(00) 00000-0000"
            />

            <div>
              <Select
                label="Cargo *"
                {...register('role')}
                error={errors.role?.message}
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              {showRoleOther && (
                <div className="mt-2">
                  <Input
                    label="Qual cargo?"
                    {...register('roleOther')}
                    error={errors.roleOther?.message}
                    placeholder="Especifique seu cargo"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Input
              label="Nome da Empresa"
              {...register('companyName')}
              error={errors.companyName?.message}
              placeholder="Nome da sua empresa"
            />

            <Select
              label="Faturamento Médio Mensal"
              {...register('monthlyRevenue')}
              error={errors.monthlyRevenue?.message}
            >
              {revenueOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            <Select
              label="Número de Funcionários"
              {...register('employeeCount')}
              error={errors.employeeCount?.message}
            >
              {employeeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="mb-6">
            <label className="flex items-start gap-3 cursor-pointer" style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                {...register('dataConsent')}
                className="mt-0.5 w-4 h-4 text-primary-red bg-white/5 border-white/10 rounded focus:ring-primary-red/50 focus:ring-2 cursor-pointer"
                style={{ cursor: 'pointer' }}
              />
              <span className="text-sm text-white/70">
                Concordo em compartilhar meus dados para que a Adventure Labs entre em contato comigo sobre os planos e serviços de Marketing & Tráfego Pago. *
              </span>
            </label>
            {errors.dataConsent && (
              <p className="mt-1 text-xs text-red-400/80 ml-7">{errors.dataConsent.message}</p>
            )}
          </div>

          <div className="text-center">
            <Button
              type="submit"
              variant="primary-red"
              size="lg"
              disabled={isSubmitting}
              className="min-w-[200px]"
            >
              {isSubmitting ? 'Enviando...' : 'Tenho Interesse'}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  )
}

