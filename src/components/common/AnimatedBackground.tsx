import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  z: number
  size: number
  speed: number
}

interface FloatingLogo {
  x: number
  y: number
  z: number
  size: number
  rotation: number
  opacity: number
  speed: number
}

interface FloatingPlane {
  x: number
  y: number
  z: number
  rotationX: number
  rotationY: number
  rotationZ: number
  opacity: number
  type: 'code' | 'chart'
  content: string[]
  chartData?: number[]
}

export const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const logoImageRef = useRef<HTMLImageElement | null>(null)

  // Cores
  const RED = '#DA0028'
  const BLUE = '#042AA1'
  const BLACK = '#000000'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Carregar imagem do logo
    const logoImage = new Image()
    logoImage.src = '/assets/brand/logo/adventure-white-1.png'
    logoImageRef.current = logoImage

    // Configuração do canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Configuração 3D
    const FOV = 1000
    let centerX = canvas.width / 2
    let centerY = canvas.height / 2
    let cameraZ = 0
    const gridSpacing = 100

    // Partículas
    const particles: Particle[] = []
    for (let i = 0; i < 200; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        z: Math.random() * 2000,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 2 + 1,
      })
    }

    // Logos flutuantes
    const floatingLogos: FloatingLogo[] = []
    for (let i = 0; i < 8; i++) {
      floatingLogos.push({
        x: (Math.random() - 0.5) * 3000,
        y: (Math.random() - 0.5) * 3000,
        z: Math.random() * 2000 + 500,
        size: Math.random() * 40 + 20,
        rotation: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.3 + 0.1,
        speed: Math.random() * 0.5 + 0.2,
      })
    }

    // Planos flutuantes com código/gráficos
    const floatingPlanes: FloatingPlane[] = []
    const codeSnippets = [
      ['const data = {', '  users: 1250,', '  revenue: "$2.5M"', '}'],
      ['function analyze() {', '  return metrics', '}'],
      ['<Component>', '  <Data />', '</Component>'],
      ['export const API = {', '  endpoint: "/data"', '}'],
    ]

    for (let i = 0; i < 6; i++) {
      const isChart = Math.random() > 0.5
      const chartData = isChart
        ? Array.from({ length: 8 }, () => Math.random())
        : undefined

      floatingPlanes.push({
        x: (Math.random() - 0.5) * 4000,
        y: (Math.random() - 0.5) * 4000,
        z: Math.random() * 3000 + 1000,
        rotationX: Math.random() * Math.PI * 2,
        rotationY: Math.random() * Math.PI * 2,
        rotationZ: Math.random() * Math.PI * 2,
        opacity: 0.2,
        type: isChart ? 'chart' : 'code',
        content: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
        chartData,
      })
    }

    // Função para projetar ponto 3D para 2D
    const project = (x: number, y: number, z: number) => {
      const scale = FOV / (FOV + z + cameraZ)
      return {
        x: centerX + x * scale,
        y: centerY + y * scale,
        scale,
      }
    }

    // Atualizar centro quando redimensionar
    const updateCenter = () => {
      centerX = canvas.width / 2
      centerY = canvas.height / 2
    }

    // Função para desenhar grid
    const drawGrid = () => {
      const gridLines = 20
      const halfGrid = (gridLines * gridSpacing) / 2

      for (let i = -gridLines; i <= gridLines; i++) {
        const color = i % 2 === 0 ? RED : BLUE
        const alpha = Math.max(0, 1 - (Math.abs(i) / gridLines) * 0.5)

        // Linhas horizontais
        const z1 = -halfGrid
        const z2 = halfGrid
        const y = i * gridSpacing

        const p1 = project(-halfGrid, y, z1)
        const p2 = project(halfGrid, y, z1)
        const p3 = project(-halfGrid, y, z2)
        const p4 = project(halfGrid, y, z2)

        ctx.strokeStyle = color
        ctx.globalAlpha = alpha * 0.6
        ctx.lineWidth = 1

        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(p3.x, p3.y)
        ctx.lineTo(p4.x, p4.y)
        ctx.stroke()

        // Linhas verticais
        const x = i * gridSpacing
        const p5 = project(x, -halfGrid, z1)
        const p6 = project(x, halfGrid, z1)
        const p7 = project(x, -halfGrid, z2)
        const p8 = project(x, halfGrid, z2)

        ctx.beginPath()
        ctx.moveTo(p5.x, p5.y)
        ctx.lineTo(p6.x, p6.y)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(p7.x, p7.y)
        ctx.lineTo(p8.x, p8.y)
        ctx.stroke()
      }

      // Linhas de profundidade (perspectiva)
      for (let i = -gridLines; i <= gridLines; i++) {
        const color = i % 2 === 0 ? RED : BLUE
        const x = i * gridSpacing
        const y1 = -halfGrid
        const y2 = halfGrid

        const p1 = project(x, y1, -halfGrid)
        const p2 = project(x, y2, -halfGrid)
        const p3 = project(x, y1, halfGrid)
        const p4 = project(x, y2, halfGrid)

        ctx.strokeStyle = color
        ctx.globalAlpha = 0.3
        ctx.lineWidth = 1

        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p3.x, p3.y)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(p2.x, p2.y)
        ctx.lineTo(p4.x, p4.y)
        ctx.stroke()
      }
    }

    // Função para desenhar partículas
    const drawParticles = () => {
      particles.forEach((particle) => {
        particle.z -= particle.speed

        if (particle.z < 0) {
          particle.z = 2000
          particle.x = (Math.random() - 0.5) * 2000
          particle.y = (Math.random() - 0.5) * 2000
        }

        const proj = project(particle.x, particle.y, particle.z)
        const alpha = Math.max(0, 1 - particle.z / 2000)

        ctx.fillStyle = '#FFFFFF'
        ctx.globalAlpha = alpha * 0.8
        ctx.beginPath()
        ctx.arc(proj.x, proj.y, particle.size * proj.scale, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    // Função para desenhar logos flutuantes
    const drawFloatingLogos = () => {
      if (!logoImageRef.current || !logoImage.complete) return

      floatingLogos.forEach((logo) => {
        logo.z -= logo.speed
        logo.rotation += 0.01

        if (logo.z < 0) {
          logo.z = 2000
          logo.x = (Math.random() - 0.5) * 3000
          logo.y = (Math.random() - 0.5) * 3000
        }

        const proj = project(logo.x, logo.y, logo.z)
        const alpha = Math.max(0, Math.min(logo.opacity, 1 - logo.z / 2000))

        if (alpha > 0.01 && proj.scale > 0) {
          ctx.save()
          ctx.globalAlpha = alpha
          ctx.translate(proj.x, proj.y)
          ctx.rotate(logo.rotation)
          ctx.scale(proj.scale, proj.scale)

          const logoSize = logo.size
          const aspectRatio = logoImage.width / logoImage.height
          const width = logoSize
          const height = logoSize / aspectRatio

          ctx.drawImage(
            logoImage,
            -width / 2,
            -height / 2,
            width,
            height
          )

          ctx.restore()
        }
      })
    }

    // Função para desenhar planos flutuantes
    const drawFloatingPlanes = () => {
      floatingPlanes.forEach((plane) => {
        plane.z -= 0.5
        plane.rotationX += 0.002
        plane.rotationY += 0.003

        if (plane.z < 500) {
          plane.z = 3000
          plane.x = (Math.random() - 0.5) * 4000
          plane.y = (Math.random() - 0.5) * 4000
        }

        const proj = project(plane.x, plane.y, plane.z)
        const alpha = Math.max(0, Math.min(plane.opacity, 1 - plane.z / 3000))

        if (alpha > 0.01 && proj.scale > 0) {
          ctx.save()
          ctx.globalAlpha = alpha
          ctx.translate(proj.x, proj.y)
          ctx.rotate(plane.rotationZ)

          const planeWidth = 200 * proj.scale
          const planeHeight = 150 * proj.scale

          // Desenhar plano
          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(-planeWidth / 2, -planeHeight / 2, planeWidth, planeHeight)

          // Desenhar conteúdo
          if (plane.type === 'code') {
            ctx.fillStyle = '#000000'
            ctx.font = `${12 * proj.scale}px monospace`
            plane.content.forEach((line, i) => {
              ctx.fillText(
                line,
                -planeWidth / 2 + 10 * proj.scale,
                -planeHeight / 2 + (i + 1) * 20 * proj.scale
              )
            })
          } else {
            // Gráfico fictício
            if (plane.chartData) {
              ctx.strokeStyle = '#000000'
              ctx.lineWidth = 2 * proj.scale
              ctx.beginPath()
              const points = plane.chartData.length
              for (let i = 0; i < points; i++) {
                const x = (-planeWidth / 2) + (i / (points - 1)) * planeWidth
                const y = (-planeHeight / 2) + (1 - plane.chartData[i]) * planeHeight * 0.8
                if (i === 0) ctx.moveTo(x, y)
                else ctx.lineTo(x, y)
              }
              ctx.stroke()
            }
          }

          ctx.restore()
        }
      })
    }

    // Loop de animação
    const animate = () => {
      updateCenter()
      ctx.fillStyle = BLACK
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      cameraZ += 2

      drawGrid()
      drawParticles()
      drawFloatingLogos()
      drawFloatingPlanes()

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    // Aguardar logo carregar antes de iniciar animação
    if (logoImage.complete) {
      animate()
    } else {
      logoImage.onload = () => {
        animate()
      }
    }

    // Áudio de tecnologia - ambiente suave
    const createAudio = () => {
      let audioContext: AudioContext | null = null
      let intervalId: number | null = null
      let isPlaying = false

      const playSound = () => {
        if (!audioContext || document.hidden || isPlaying) return

        try {
          isPlaying = true
          const now = audioContext.currentTime

          // Criar múltiplos osciladores para um som mais rico
          const osc1 = audioContext.createOscillator()
          const osc2 = audioContext.createOscillator()
          const gain = audioContext.createGain()
          const filter = audioContext.createBiquadFilter()
          const compressor = audioContext.createDynamicsCompressor()

          // Oscilador principal (baixa frequência)
          osc1.type = 'sine'
          osc1.frequency.setValueAtTime(60 + Math.random() * 20, now)

          // Oscilador secundário (harmônico)
          osc2.type = 'triangle'
          osc2.frequency.setValueAtTime(120 + Math.random() * 40, now)

          // Filtro passa-baixa para suavizar
          filter.type = 'lowpass'
          filter.frequency.setValueAtTime(400 + Math.random() * 200, now)
          filter.Q.setValueAtTime(0.5, now)

          // Compressor para suavizar picos
          compressor.threshold.setValueAtTime(-24, now)
          compressor.knee.setValueAtTime(30, now)
          compressor.ratio.setValueAtTime(12, now)
          compressor.attack.setValueAtTime(0.003, now)
          compressor.release.setValueAtTime(0.25, now)

          // Volume muito baixo para ambiente
          gain.gain.setValueAtTime(0, now)
          gain.gain.linearRampToValueAtTime(0.015, now + 0.3)
          gain.gain.linearRampToValueAtTime(0.015, now + 2)
          gain.gain.linearRampToValueAtTime(0, now + 2.3)

          osc1.connect(filter)
          osc2.connect(filter)
          filter.connect(compressor)
          compressor.connect(gain)
          gain.connect(audioContext.destination)

          osc1.start(now)
          osc2.start(now)
          osc1.stop(now + 2.3)
          osc2.stop(now + 2.3)

          setTimeout(() => {
            isPlaying = false
          }, 2300)
        } catch (error) {
          isPlaying = false
        }
      }

      // Inicializar áudio apenas após interação do usuário
      const initAudio = async () => {
        try {
          audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
          
          // Reproduzir som inicial após um pequeno delay
          setTimeout(() => {
            playSound()
          }, 1000)

          // Repetir a cada 5-7 segundos
          intervalId = window.setInterval(() => {
            if (!document.hidden) {
              playSound()
            }
          }, 5000 + Math.random() * 2000)
        } catch (error) {
          console.log('Áudio não disponível:', error)
        }
      }

      // Inicializar após primeira interação
      const handleInteraction = () => {
        if (!audioContext) {
          initAudio()
          document.removeEventListener('click', handleInteraction)
          document.removeEventListener('touchstart', handleInteraction)
          document.removeEventListener('keydown', handleInteraction)
        }
      }

      document.addEventListener('click', handleInteraction, { once: true })
      document.addEventListener('touchstart', handleInteraction, { once: true })
      document.addEventListener('keydown', handleInteraction, { once: true })

      return () => {
        if (intervalId) {
          clearInterval(intervalId)
        }
        if (audioContext) {
          audioContext.close()
        }
        document.removeEventListener('click', handleInteraction)
        document.removeEventListener('touchstart', handleInteraction)
        document.removeEventListener('keydown', handleInteraction)
      }
    }

    const audioCleanup = createAudio()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      audioCleanup()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  )
}

