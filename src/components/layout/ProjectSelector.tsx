import { useState, useRef, useEffect } from 'react'
import { useProject } from '@/contexts/ProjectContext'
import { useProjects } from '@/hooks/useProjects'
import { useAccount } from '@/contexts/AccountContext'
import { Project } from '@/types'
import { FiFolder, FiSettings } from 'react-icons/fi'

export const ProjectSelector = () => {
  const { currentProject, setCurrentProject, isMaster, loading: projectContextLoading } = useProject()
  const { currentAccount } = useAccount()
  const { projects: allProjects, loading: projectsLoading } = useProjects()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Filtrar projetos pela conta atual (igual ao ProjectContext)
  const projects = currentAccount 
    ? allProjects.filter(p => p.accountId === currentAccount.id)
    : allProjects

  const loading = projectsLoading || projectContextLoading

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelectProject = (project: Project) => {
    setCurrentProject(project)
    setIsOpen(false)
  }

  // Se for master e não houver conta selecionada, mostrar mensagem
  if (isMaster && !currentAccount) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => window.location.href = '/accounts'}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-all text-sm font-medium"
        >
          <FiFolder className="w-4 h-4" />
          <span className="hidden sm:block">Selecione uma Conta</span>
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="px-3 py-2 text-white/50 text-sm">
        Carregando...
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="px-3 py-2 text-white/50 text-sm">
        Nenhum projeto
      </div>
    )
  }
  
  // Se há projetos mas nenhum está selecionado, mostrar aviso
  if (!currentProject && projects.length > 0) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => {
            // Selecionar o primeiro projeto automaticamente
            if (projects.length > 0) {
              handleSelectProject(projects[0])
            }
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-all text-sm font-medium"
        >
          <FiFolder className="w-4 h-4" />
          <span className="hidden sm:block">Selecionar Projeto</span>
        </button>
      </div>
    )
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-all text-white/80 hover:text-white"
      >
        <FiFolder className="w-4 h-4" />
        <span className="text-sm font-medium hidden sm:block">
          {currentProject?.name || 'Selecione um projeto'}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-background-darker border border-white/20 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-2">
            {projects.map((project) => {
              const isSelected = currentProject?.id === project.id
              return (
                <button
                  key={project.id}
                  onClick={() => handleSelectProject(project)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-lg
                    transition-all text-left
                    ${
                      isSelected
                        ? 'bg-primary-blue/20 text-white border border-primary-blue/40'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <div className="flex-1">
                    <div className="font-medium">{project.name}</div>
                    {project.plan && (
                      <div className="text-xs text-white/60 mt-1">
                        Plano: {project.plan === 'basic' ? 'Básico' : project.plan === 'premium' ? 'Premium' : 'Enterprise'}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <span className="text-primary-blue">✓</span>
                  )}
                </button>
              )
            })}
          </div>
          
          {isMaster && (
            <div className="border-t border-white/10 p-2">
              <button
                onClick={() => {
                  setIsOpen(false)
                  // Navegar para página de projetos (será criada)
                  window.location.href = '/projects'
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-white/80 hover:bg-white/10 hover:text-white transition-all rounded-lg"
              >
                <FiSettings className="w-4 h-4" />
                <span>Gerenciar Projetos</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

