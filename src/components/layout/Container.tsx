import { ReactNode } from 'react'
import { Header } from './Header'
import { BackgroundManager } from '@/components/common/BackgroundManager'

interface ContainerProps {
  children: ReactNode
}

export const Container = ({ children }: ContainerProps) => {
  return (
    <div className="min-h-screen bg-background-dark flex flex-col relative">
      <BackgroundManager />
      <Header />
      <main className="flex-1 overflow-y-auto px-8 py-6 relative z-10">
        {children}
      </main>
    </div>
  )
}

