import { useState, useEffect } from 'react'
import { ProjectUser } from '@/types'
import { getDocuments, where } from '@/lib/firebase/db'
import { useAuth } from '@/contexts/AuthContext'
import { useProject } from '@/contexts/ProjectContext'

export const useCurrentProjectUser = () => {
  const { currentUser } = useAuth()
  const { currentProject } = useProject()
  const [projectUser, setProjectUser] = useState<ProjectUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjectUser = async () => {
      if (!currentUser || !currentProject) {
        setProjectUser(null)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const projectUsers = await getDocuments<ProjectUser>('projectUsers', [
          where('projectId', '==', currentProject.id),
          where('userId', '==', currentUser.uid),
        ])

        if (projectUsers.length > 0) {
          setProjectUser(projectUsers[0])
        } else {
          setProjectUser(null)
        }
      } catch (err) {
        console.error('Erro ao buscar ProjectUser:', err)
        setProjectUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProjectUser()
  }, [currentUser, currentProject])

  return { projectUser, loading }
}

