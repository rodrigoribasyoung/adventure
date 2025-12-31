interface Step {
  id: string
  title: string
  description?: string
}

interface StepsProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (stepIndex: number) => void
  className?: string
}

export const Steps = ({ steps, currentStep, onStepClick, className = '' }: StepsProps) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {steps.map((step, index) => {
        const isActive = index === currentStep
        const isCompleted = index < currentStep
        const isClickable = onStepClick && (isCompleted || index === currentStep)

        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <button
                type="button"
                onClick={() => isClickable && onStepClick(index)}
                disabled={!isClickable}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                  transition-all duration-200
                  ${isActive 
                    ? 'bg-primary-red text-white ring-2 ring-primary-red/50' 
                    : isCompleted
                    ? 'bg-primary-red/20 text-primary-red border-2 border-primary-red'
                    : 'bg-white/5 text-white/60 border-2 border-white/10'
                  }
                  ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}
                `}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </button>
              <div className="mt-2 text-center">
                <p className={`text-sm font-medium ${isActive ? 'text-white' : 'text-white/60'}`}>
                  {step.title}
                </p>
                {step.description && (
                  <p className={`text-xs mt-0.5 ${isActive ? 'text-white/80' : 'text-white/40'}`}>
                    {step.description}
                  </p>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`
                  flex-1 h-0.5 mx-4 transition-all duration-200
                  ${isCompleted ? 'bg-primary-red' : 'bg-white/10'}
                `}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

