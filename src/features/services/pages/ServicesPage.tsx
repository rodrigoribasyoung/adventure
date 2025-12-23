import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { ServiceList } from '../components/ServiceList'
import { ServiceForm } from '../components/ServiceForm'
import { Modal } from '@/components/ui/Modal'
import { useServices } from '../hooks/useServices'
import { Service } from '@/types'
import { Toast } from '@/components/ui/Toast'

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
      if (selectedService) {
        await updateService(selectedService.id, data)
        setToast({ message: 'Serviço atualizado com sucesso!', type: 'success', visible: true })
      } else {
        await createService(data)
        setToast({ message: 'Serviço criado com sucesso!', type: 'success', visible: true })
      }
      setIsModalOpen(false)
      setSelectedService(undefined)
    } catch (error) {
      setToast({ message: 'Erro ao salvar serviço', type: 'error', visible: true })
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
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Serviços</h1>
          <p className="text-white/70">Gerencie seus serviços</p>
        </div>

        <ServiceList
          services={services}
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

