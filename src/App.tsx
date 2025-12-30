import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AccountProvider } from './contexts/AccountContext'
import { ProjectProvider } from './contexts/ProjectContext'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { InstallPrompt } from './components/pwa/InstallPrompt'
import { router } from './routes'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AccountProvider>
          <ProjectProvider>
            <RouterProvider router={router} />
            <InstallPrompt />
          </ProjectProvider>
        </AccountProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App

