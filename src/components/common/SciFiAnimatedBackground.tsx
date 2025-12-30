import { useEffect, useRef } from 'react'

interface SciFiAnimatedBackgroundProps {
  className?: string
}

export const SciFiAnimatedBackground = ({ className = '' }: SciFiAnimatedBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Configurar tamanho do canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Cores do tema
    const red = '#DA0028'
    const blue = '#042AA1'
    const darkBg = '#000000'

    // Configurações do grid
    const gridSize = 80
    const gridDepth = 8
    const perspective = 1000

    // Partículas e elementos de dados
    const particles: Array<{
      x: number
      y: number
      z: number
      vx: number
      vy: number
      vz: number
      color: string
      size: number
    }> = []

    // Inicializar partículas
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * perspective,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        vz: (Math.random() - 0.5) * 0.3,
        color: Math.random() > 0.5 ? red : blue,
        size: Math.random() * 3 + 1,
      })
    }

    // Elementos de visualização de dados (bar charts, line charts)
    const dataElements: Array<{
      x: number
      y: number
      width: number
      height: number
      type: 'bar' | 'line'
      opacity: number
    }> = []

    // Criar alguns elementos de dados
    for (let i = 0; i < 8; i++) {
      dataElements.push({
        x: Math.random() * canvas.width * 0.3,
        y: canvas.height * 0.7 + Math.random() * canvas.height * 0.2,
        width: Math.random() * 40 + 20,
        height: Math.random() * 60 + 20,
        type: Math.random() > 0.5 ? 'bar' : 'line',
        opacity: Math.random() * 0.3 + 0.1,
      })
    }

    let time = 0

    const animate = () => {
      ctx.fillStyle = darkBg
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      time += 0.01

      // Desenhar grid 3D
      ctx.strokeStyle = red
      ctx.lineWidth = 0.5
      ctx.globalAlpha = 0.3

      // Linhas horizontais do grid
      for (let i = 0; i < gridDepth; i++) {
        const z = i * (perspective / gridDepth)
        const scale = perspective / (perspective + z)
        const offsetX = (canvas.width / 2) * (1 - scale)
        const offsetY = (canvas.height / 2) * (1 - scale)

        ctx.beginPath()
        for (let x = 0; x <= gridSize; x++) {
          const px = offsetX + (x * gridSize * scale)
          const py1 = offsetY
          const py2 = offsetY + (gridSize * gridSize * scale)

          if (x === 0 || x === gridSize) {
            ctx.moveTo(px, py1)
            ctx.lineTo(px, py2)
          }
        }
        ctx.stroke()

        // Linhas verticais
        ctx.beginPath()
        for (let y = 0; y <= gridSize; y++) {
          const py = offsetY + (y * gridSize * scale)
          const px1 = offsetX
          const px2 = offsetX + (gridSize * gridSize * scale)

          if (y === 0 || y === gridSize) {
            ctx.moveTo(px1, py)
            ctx.lineTo(px2, py)
          }
        }
        ctx.stroke()
      }

      // Desenhar grid azul (camada adicional)
      ctx.strokeStyle = blue
      ctx.globalAlpha = 0.2

      for (let i = 0; i < gridDepth; i++) {
        const z = i * (perspective / gridDepth) + perspective * 0.3
        const scale = perspective / (perspective + z)
        const offsetX = (canvas.width / 2) * (1 - scale) + Math.sin(time * 0.5) * 50
        const offsetY = (canvas.height / 2) * (1 - scale) + Math.cos(time * 0.3) * 30

        ctx.beginPath()
        for (let x = 0; x <= gridSize; x++) {
          const px = offsetX + (x * gridSize * scale)
          const py1 = offsetY
          const py2 = offsetY + (gridSize * gridSize * scale)

          if (x % 2 === 0) {
            ctx.moveTo(px, py1)
            ctx.lineTo(px, py2)
          }
        }
        ctx.stroke()
      }

      // Atualizar e desenhar partículas
      ctx.globalAlpha = 0.6
      particles.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.z += particle.vz

        // Wrap around
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0
        if (particle.z < 0) particle.z = perspective
        if (particle.z > perspective) particle.z = 0

        const scale = perspective / (perspective + particle.z)
        const x = particle.x
        const y = particle.y
        const size = particle.size * scale

        ctx.fillStyle = particle.color
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
      })

      // Desenhar elementos de visualização de dados
      ctx.globalAlpha = 0.4
      dataElements.forEach((element, index) => {
        const pulse = Math.sin(time * 2 + index) * 0.1 + 0.9
        ctx.globalAlpha = element.opacity * pulse

        if (element.type === 'bar') {
          // Bar chart
          const barCount = 5
          const barWidth = element.width / barCount
          for (let i = 0; i < barCount; i++) {
            const barHeight = (Math.sin(time + i) * 0.5 + 0.5) * element.height
            ctx.fillStyle = i % 2 === 0 ? blue : red
            ctx.fillRect(
              element.x + i * barWidth,
              element.y + element.height - barHeight,
              barWidth - 2,
              barHeight
            )
          }
        } else {
          // Line chart
          ctx.strokeStyle = blue
          ctx.lineWidth = 1
          ctx.beginPath()
          const pointCount = 8
          const pointSpacing = element.width / pointCount
          for (let i = 0; i <= pointCount; i++) {
            const x = element.x + i * pointSpacing
            const y = element.y + element.height - (Math.sin(time + i * 0.5) * 0.5 + 0.5) * element.height
            if (i === 0) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }
          }
          ctx.stroke()
        }
      })

      // Efeitos de luz/streaks
      ctx.globalAlpha = 0.2
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, `rgba(218, 0, 40, 0.1)`)
      gradient.addColorStop(0.5, `rgba(4, 42, 161, 0.1)`)
      gradient.addColorStop(1, `rgba(218, 0, 40, 0.1)`)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ zIndex: 0 }}
    />
  )
}

