import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { InstallPrompt } from './components/pwa/InstallPrompt'
import { router } from './routes'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RouterProvider router={router} />
        <InstallPrompt />
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App

