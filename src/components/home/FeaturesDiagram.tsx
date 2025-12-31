import { useEffect, useRef } from 'react'

interface FeatureGroup {
  items: string[]
  alignment: 'left' | 'center' | 'right'
  colSpan: number
  startCol: number
  opacity?: number
}

// Reorganizado por relevância: CRM e Marketing primeiro
const featureGroups: FeatureGroup[] = [
  {
    items: ['CRM Nativo', 'Hub de Integrações', 'Marketing & Analytics'],
    alignment: 'right',
    colSpan: 2,
    startCol: 1,
    opacity: 0.5,
  },
  {
    items: ['Pipeline de Vendas', 'Dashboard Inteligente', 'Funis Personalizados', 'Relatórios Avançados'],
    alignment: 'center',
    colSpan: 3,
    startCol: 3,
  },
  {
    items: ['Kanban de Negociações', 'Gestão de Contatos', 'Gestão de Empresas', 'Business Intelligence'],
    alignment: 'center',
    colSpan: 3,
    startCol: 8,
  },
  {
    items: ['Tarefas & Atividades', 'Propostas Comerciais', 'Automações'],
    alignment: 'left',
    colSpan: 2,
    startCol: 11,
    opacity: 0.5,
  },
]

export const FeaturesDiagram = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Animação de entrada suave
    const boxes = containerRef.current?.querySelectorAll('.feature-box')
    if (boxes) {
      boxes.forEach((box, index) => {
        const element = box as HTMLElement
        element.style.opacity = '0'
        element.style.transform = 'translateY(20px)'
        
        setTimeout(() => {
          element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out'
          element.style.opacity = element.dataset.opacity || '1'
          element.style.transform = 'translateY(0)'
        }, index * 80)
      })
    }
  }, [])

  return (
    <div className="w-full py-16 hidden lg:block bg-[#0a1929]">
      <div className="max-w-[90rem] mx-auto px-8 xl:px-16">
        <div 
          ref={containerRef}
          className="mind-map__grid grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-12 gap-5 relative"
        >
          {/* Grupo 1 - Esquerda (3 itens) */}
          <ul className="w-full xl:col-span-2 flex flex-col md:justify-center xl:items-end gap-4">
            {featureGroups[0].items.map((item, index) => (
              <li
                key={index}
                className="feature-box card-mind-map py-4 px-5 rounded-xl w-fit min-w-full xl:min-w-[200px] transition-all duration-300 cursor-pointer relative"
                data-opacity={featureGroups[0].opacity?.toString() || '1'}
                style={{ opacity: 0 }}
              >
                <span className="text-white/70 text-sm whitespace-nowrap hover:text-white transition-colors">
                  {item}
                </span>
              </li>
            ))}
          </ul>

          {/* Grupo 2 - Centro Esquerda (4 itens) */}
          <ul className="w-full xl:col-span-3 flex flex-col justify-center items-center gap-4 relative">
            {/* SVG Linhas Esquerda com energia vermelha */}
            <svg 
              className="absolute -left-[43%] -z-10 hidden xl:block pointer-events-none" 
              width="138" 
              height="462" 
              viewBox="0 0 138 462" 
              fill="none"
              style={{ top: '50%', transform: 'translateY(-50%)', overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="line-base-left" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0.05)" />
                  <stop offset="100%" stopColor="rgba(255, 255, 255, 0.05)" />
                </linearGradient>
                <linearGradient id="energy-red-left" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="30%" stopColor="#DA0028" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#DA0028" stopOpacity="1" />
                  <stop offset="70%" stopColor="#DA0028" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
                <filter id="glow-red-left">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <g>
                {/* Linhas base */}
                <path 
                  d="M138 261H100.925C89.8792 261 80.9249 269.954 80.9249 281V441C80.9249 452.046 71.9706 461 60.9249 461H49" 
                  stroke="url(#line-base-left)" 
                  strokeWidth="1"
                />
                <path 
                  d="M134 240H70.3286C59.2829 240 50.3286 248.954 50.3286 260V289C50.3286 300.046 41.3743 309 30.3286 309H0" 
                  stroke="url(#line-base-left)" 
                  strokeWidth="1"
                />
                <path 
                  d="M134 222H70.3286C59.2829 222 50.3286 213.046 50.3286 202V173C50.3286 161.954 41.3743 153 30.3286 153H0" 
                  stroke="url(#line-base-left)" 
                  strokeWidth="1"
                />
                <path 
                  d="M138 201H100.925C89.8792 201 80.9249 192.046 80.9249 181V21C80.9249 9.95431 71.9706 1 60.9249 1H49" 
                  stroke="url(#line-base-left)" 
                  strokeWidth="1"
                />
                {/* Energia vermelha animada */}
                <g filter="url(#glow-red-left)">
                  <path 
                    className="energy-pulse-left-1"
                    d="M138 261H100.925C89.8792 261 80.9249 269.954 80.9249 281V441C80.9249 452.046 71.9706 461 60.9249 461H49" 
                    stroke="url(#energy-red-left)" 
                    strokeWidth="1.5"
                  />
                  <path 
                    className="energy-pulse-left-2"
                    d="M134 240H70.3286C59.2829 240 50.3286 248.954 50.3286 260V289C50.3286 300.046 41.3743 309 30.3286 309H0" 
                    stroke="url(#energy-red-left)" 
                    strokeWidth="1.5"
                  />
                  <path 
                    className="energy-pulse-left-3"
                    d="M134 222H70.3286C59.2829 222 50.3286 213.046 50.3286 202V173C50.3286 161.954 41.3743 153 30.3286 153H0" 
                    stroke="url(#energy-red-left)" 
                    strokeWidth="1.5"
                  />
                  <path 
                    className="energy-pulse-left-4"
                    d="M138 201H100.925C89.8792 201 80.9249 192.046 80.9249 181V21C80.9249 9.95431 71.9706 1 60.9249 1H49" 
                    stroke="url(#energy-red-left)" 
                    strokeWidth="1.5"
                  />
                </g>
              </g>
            </svg>

            {featureGroups[1].items.map((item, index) => (
              <li
                key={index}
                className={`feature-box card-mind-map py-4 px-5 rounded-xl w-fit min-w-full xl:min-w-[200px] transition-all duration-300 cursor-pointer relative ${
                  index === 0 ? 'xl:translate-x-[27%]' : index === 3 ? 'xl:translate-x-[27%]' : ''
                }`}
                data-opacity="1"
                style={{ opacity: 0 }}
              >
                <span className="text-white/80 text-sm whitespace-nowrap hover:text-white transition-colors">
                  {item}
                </span>
              </li>
            ))}
          </ul>

          {/* Logo Central */}
          <ul className="w-full xl:col-span-2 xl:flex items-center justify-center relative">
            <div className="relative w-full flex items-center justify-center">
              {/* Logo com círculo */}
              <div className="relative group cursor-pointer" style={{ zIndex: 10 }}>
                {/* Glow atrás do logo - com animação de hover */}
                <div 
                  className="absolute transition-all duration-500 ease-out"
                  style={{
                    width: '140px',
                    height: '140px',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'radial-gradient(circle, rgba(4, 42, 161, 0.5) 0%, rgba(4, 42, 161, 0.2) 50%, transparent 70%)',
                    filter: 'blur(25px)',
                    zIndex: -1,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.width = '160px'
                    e.currentTarget.style.height = '160px'
                    e.currentTarget.style.background = 'radial-gradient(circle, rgba(4, 42, 161, 0.7) 0%, rgba(4, 42, 161, 0.3) 50%, transparent 70%)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.width = '140px'
                    e.currentTarget.style.height = '140px'
                    e.currentTarget.style.background = 'radial-gradient(circle, rgba(4, 42, 161, 0.5) 0%, rgba(4, 42, 161, 0.2) 50%, transparent 70%)'
                  }}
                />
                {/* Círculo com gradiente - com animação de hover */}
                <div 
                  className="relative w-28 h-28 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-lg transition-all duration-500 ease-out group-hover:scale-110 group-hover:border-white/20"
                  style={{
                    background: 'radial-gradient(circle at 30% 30%, rgba(4, 42, 161, 0.6) 0%, rgba(4, 42, 161, 0.3) 50%, rgba(10, 25, 41, 0.95) 100%)',
                    zIndex: 1,
                  }}
                >
                  <img
                    src="/assets/brand/logo/adventure-light-2.png"
                    alt="Adventure Labs"
                    className="h-16 w-auto object-contain relative transition-transform duration-500 ease-out group-hover:scale-110"
                    style={{ zIndex: 2 }}
                  />
                </div>
              </div>
            </div>
          </ul>

          {/* Grupo 3 - Centro Direita (4 itens) */}
          <ul className="w-full xl:col-span-3 flex flex-col justify-center lg:items-center gap-4 relative">
            {/* SVG Linhas Direita com energia vermelha */}
            <svg 
              className="absolute rotate-180 -right-[43%] -z-10 hidden xl:block pointer-events-none" 
              width="138" 
              height="462" 
              viewBox="0 0 138 462" 
              fill="none"
              style={{ top: '50%', transform: 'translateY(-50%)', overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="line-base-right" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0.05)" />
                  <stop offset="100%" stopColor="rgba(255, 255, 255, 0.05)" />
                </linearGradient>
                <linearGradient id="energy-red-right" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="30%" stopColor="#DA0028" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#DA0028" stopOpacity="1" />
                  <stop offset="70%" stopColor="#DA0028" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
                <filter id="glow-red-right">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <g>
                {/* Linhas base */}
                <path 
                  d="M138 261H100.925C89.8792 261 80.9249 269.954 80.9249 281V441C80.9249 452.046 71.9706 461 60.9249 461H49" 
                  stroke="url(#line-base-right)" 
                  strokeWidth="1"
                />
                <path 
                  d="M134 240H70.3286C59.2829 240 50.3286 248.954 50.3286 260V289C50.3286 300.046 41.3743 309 30.3286 309H0" 
                  stroke="url(#line-base-right)" 
                  strokeWidth="1"
                />
                <path 
                  d="M134 222H70.3286C59.2829 222 50.3286 213.046 50.3286 202V173C50.3286 161.954 41.3743 153 30.3286 153H0" 
                  stroke="url(#line-base-right)" 
                  strokeWidth="1"
                />
                <path 
                  d="M138 201H100.925C89.8792 201 80.9249 192.046 80.9249 181V21C80.9249 9.95431 71.9706 1 60.9249 1H49" 
                  stroke="url(#line-base-right)" 
                  strokeWidth="1"
                />
                {/* Energia vermelha animada */}
                <g filter="url(#glow-red-right)">
                  <path 
                    className="energy-pulse-right-1"
                    d="M138 261H100.925C89.8792 261 80.9249 269.954 80.9249 281V441C80.9249 452.046 71.9706 461 60.9249 461H49" 
                    stroke="url(#energy-red-right)" 
                    strokeWidth="1.5"
                  />
                  <path 
                    className="energy-pulse-right-2"
                    d="M134 240H70.3286C59.2829 240 50.3286 248.954 50.3286 260V289C50.3286 300.046 41.3743 309 30.3286 309H0" 
                    stroke="url(#energy-red-right)" 
                    strokeWidth="1.5"
                  />
                  <path 
                    className="energy-pulse-right-3"
                    d="M134 222H70.3286C59.2829 222 50.3286 213.046 50.3286 202V173C50.3286 161.954 41.3743 153 30.3286 153H0" 
                    stroke="url(#energy-red-right)" 
                    strokeWidth="1.5"
                  />
                  <path 
                    className="energy-pulse-right-4"
                    d="M138 201H100.925C89.8792 201 80.9249 192.046 80.9249 181V21C80.9249 9.95431 71.9706 1 60.9249 1H49" 
                    stroke="url(#energy-red-right)" 
                    strokeWidth="1.5"
                  />
                </g>
              </g>
            </svg>

            {featureGroups[2].items.map((item, index) => (
              <li
                key={index}
                className={`feature-box card-mind-map py-4 px-5 rounded-xl w-fit min-w-full xl:min-w-[200px] transition-all duration-300 cursor-pointer relative ${
                  index === 0 ? 'xl:-translate-x-[27%]' : index === 3 ? 'xl:-translate-x-[30%]' : ''
                }`}
                data-opacity="1"
                style={{ opacity: 0 }}
              >
                <span className="text-white/80 text-sm whitespace-nowrap hover:text-white transition-colors">
                  {item}
                </span>
              </li>
            ))}
          </ul>

          {/* Grupo 4 - Direita (3 itens) */}
          <ul className="w-full xl:col-span-2 flex flex-col md:justify-center xl:items-start gap-4">
            {featureGroups[3].items.map((item, index) => (
              <li
                key={index}
                className="feature-box card-mind-map py-4 px-5 rounded-xl w-fit min-w-full xl:min-w-[200px] transition-all duration-300 cursor-pointer relative"
                data-opacity={featureGroups[3].opacity?.toString() || '1'}
                style={{ opacity: 0 }}
              >
                <span className="text-white/70 text-sm whitespace-nowrap hover:text-white transition-colors">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style>{`
        .card-mind-map {
          background: rgba(10, 25, 41, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(8px);
        }
        .card-mind-map:hover {
          background: rgba(10, 25, 41, 0.8);
          border-color: rgba(255, 255, 255, 0.15);
        }
        .mind-map__grid {
          min-height: 500px;
        }
        
        /* Animações de energia vermelha nas linhas principais */
        @keyframes energy-flow-left-1 {
          0% {
            stroke-dashoffset: 200;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0;
          }
        }
        @keyframes energy-flow-left-2 {
          0% {
            stroke-dashoffset: 200;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0;
          }
        }
        @keyframes energy-flow-left-3 {
          0% {
            stroke-dashoffset: 200;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0;
          }
        }
        @keyframes energy-flow-left-4 {
          0% {
            stroke-dashoffset: 200;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0;
          }
        }
        
        @keyframes energy-flow-right-1 {
          0% {
            stroke-dashoffset: 200;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0;
          }
        }
        @keyframes energy-flow-right-2 {
          0% {
            stroke-dashoffset: 200;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0;
          }
        }
        @keyframes energy-flow-right-3 {
          0% {
            stroke-dashoffset: 200;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0;
          }
        }
        @keyframes energy-flow-right-4 {
          0% {
            stroke-dashoffset: 200;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0;
          }
        }
        
        .energy-pulse-left-1 {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: energy-flow-left-1 4s ease-in-out infinite;
          animation-delay: 0s;
        }
        .energy-pulse-left-2 {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: energy-flow-left-2 4s ease-in-out infinite;
          animation-delay: 1s;
        }
        .energy-pulse-left-3 {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: energy-flow-left-3 4s ease-in-out infinite;
          animation-delay: 2s;
        }
        .energy-pulse-left-4 {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: energy-flow-left-4 4s ease-in-out infinite;
          animation-delay: 3s;
        }
        
        .energy-pulse-right-1 {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: energy-flow-right-1 4s ease-in-out infinite;
          animation-delay: 0.5s;
        }
        .energy-pulse-right-2 {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: energy-flow-right-2 4s ease-in-out infinite;
          animation-delay: 1.5s;
        }
        .energy-pulse-right-3 {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: energy-flow-right-3 4s ease-in-out infinite;
          animation-delay: 2.5s;
        }
        .energy-pulse-right-4 {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: energy-flow-right-4 4s ease-in-out infinite;
          animation-delay: 3.5s;
        }
      `}</style>
    </div>
  )
}
