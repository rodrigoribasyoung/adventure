import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { ServiceTable } from '../components/ServiceTable'
import { ServiceForm } from '../components/ServiceForm'
import { Modal } from '@/components/ui/Modal'
import { useServices } from '../hooks/useServices'
import { Service } from '@/types'
import { Toast } from '@/components/ui/Toast'
import { AdvancedFilter } from '@/components/common/AdvancedFilter'
import { useAdvancedFilter } from '@/hooks/useAdvancedFilter'
import { FilterField } from '@/components/common/AdvancedFilter'
import { Button } from '@/components/ui/Button'

interface ServiceFilters {
  search: string
  active: string
  minPrice: number | null
  maxPrice: number | null
}

const ServicesPage = () => {
  const { services, loading, createService, updateService, deleteService } = useServices()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | undefined>()
  const [formLoading, setFormLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  })

  const initialFilters: ServiceFilters = {
    search: '',
    active: '',
    minPrice: null,
    maxPrice: null,
  }

  const { filters, setFilters, resetFilters } = useAdvancedFilter<ServiceFilters>({
    initialFilters,
    persistKey: 'services_filters',
  })

  const filterFields: FilterField[] = [
    {
      key: 'active',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: 'Todos' },
        { value: 'true', label: 'Ativo' },
        { value: 'false', label: 'Inativo' },
      ],
    },
    {
      key: 'minPrice',
      label: 'Preço Mínimo (R$)',
      type: 'number',
      placeholder: '0.00',
    },
    {
      key: 'maxPrice',
      label: 'Preço Máximo (R$)',
      type: 'number',
      placeholder: '0.00',
    },
  ]

  const filteredServices = services.filter(service => {
    // Busca por texto
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch = 
        service.name.toLowerCase().includes(searchLower) ||
        service.description?.toLowerCase().includes(searchLower)
      if (!matchesSearch) return false
    }

    // Filtro por status
    if (filters.active) {
      const isActive = filters.active === 'true'
      if (service.active !== isActive) return false
    }

    // Filtro por preço mínimo
    if (filters.minPrice !== null && filters.minPrice !== undefined) {
      if (service.price < filters.minPrice) return false
    }

    // Filtro por preço máximo
    if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
      if (service.price > filters.maxPrice) return false
    }

    return true
  })

  const handleCreateNew = () => {
    setSelectedService(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (service: Service) => {
    setSelectedService(service)
    setIsModalOpen(true)
  }

  const handleSubmit = async (data: any) => {
    try {
      setFormLoading(true)
      console.log('[ServicesPage] Submetendo formulário:', data)
      if (selectedService) {
        console.log('[ServicesPage] Atualizando serviço:', selectedService.id)
        await updateService(selectedService.id, data)
        setToast({ message: 'Serviço atualizado com sucesso!', type: 'success', visible: true })
      } else {
        console.log('[ServicesPage] Criando novo serviço')
        const id = await createService(data)
        console.log('[ServicesPage] Serviço criado com ID:', id)
        setToast({ message: 'Serviço criado com sucesso!', type: 'success', visible: true })
      }
      setIsModalOpen(false)
      setSelectedService(undefined)
    } catch (error: any) {
      console.error('[ServicesPage] Erro ao salvar serviço:', error)
      const errorMessage = error?.message || 'Erro ao salvar serviço'
      setToast({ message: errorMessage, type: 'error', visible: true })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteService(id)
      setToast({ message: 'Serviço excluído com sucesso!', type: 'success', visible: true })
    } catch (error) {
      setToast({ message: 'Erro ao excluir serviço', type: 'error', visible: true })
    }
  }

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Serviços</h1>
            <p className="text-white/70">Gerencie seus serviços</p>
          </div>
          <Button variant="primary-red" onClick={handleCreateNew}>
            + Novo Serviço
          </Button>
        </div>

        <AdvancedFilter
          filters={filters}
          onFiltersChange={setFilters}
          onReset={resetFilters}
          searchPlaceholder="Buscar por nome ou descrição..."
          fields={filterFields}
        />

        <ServiceTable
          services={filteredServices}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreateNew={handleCreateNew}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedService(undefined)
        }}
        title={selectedService ? 'Editar Serviço' : 'Novo Serviço'}
        size="md"
      >
        <ServiceForm
          service={selectedService}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false)
            setSelectedService(undefined)
          }}
          loading={formLoading}
        />
      </Modal>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </Container>
  )
}

export default ServicesPage

