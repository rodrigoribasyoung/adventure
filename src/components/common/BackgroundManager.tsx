import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  life: number
  maxLife: number
}

interface OrbitalRing {
  radius: number
  angle: number
  speed: number
  opacity: number
  color: string
}

interface Wave {
  x: number
  y: number
  radius: number
  maxRadius: number
  opacity: number
  speed: number
}

export const BackgroundManager = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const timeRef = useRef(0)
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  const animationIntensityRef = useRef(isHomePage ? 1 : 0)

  useEffect(() => {
    // Transição suave da intensidade da animação
    const targetIntensity = isHomePage ? 1 : 0
    const startIntensity = animationIntensityRef.current
    const startTime = Date.now()
    const duration = 800 // 800ms para transição

    const animateTransition = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Easing function para transição suave
      const easeInOut = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2
      
      animationIntensityRef.current = startIntensity + (targetIntensity - startIntensity) * easeInOut

      if (progress < 1) {
        requestAnimationFrame(animateTransition)
      }
    }

    animateTransition()
  }, [isHomePage])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const centerX = () => window.innerWidth / 2
    const centerY = () => window.innerHeight / 2

    // Partículas orgânicas
    const particles: Particle[] = []
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 1 + 0.5,
        opacity: Math.random() * 0.2 + 0.05,
        life: Math.random(),
        maxLife: 1,
      })
    }

    // Configuração do canvas
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      const width = window.innerWidth
      const height = window.innerHeight
      
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      
      ctx.scale(dpr, dpr)
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Anéis orbitais
    const orbitalRings: OrbitalRing[] = []
    for (let i = 0; i < 4; i++) {
      orbitalRings.push({
        radius: 100 + i * 100,
        angle: Math.random() * Math.PI * 2,
        speed: (Math.random() - 0.5) * 0.001,
        opacity: 0.04 - i * 0.008,
        color: i % 2 === 0 ? '#DA0028' : '#042AA1',
      })
    }

    // Ondas
    const waves: Wave[] = []
    for (let i = 0; i < 2; i++) {
      waves.push({
        x: centerX() + (Math.random() - 0.5) * 300,
        y: centerY() + (Math.random() - 0.5) * 300,
        radius: Math.random() * 50,
        maxRadius: 200 + Math.random() * 200,
        opacity: 0.08,
        speed: 0.2 + Math.random() * 0.15,
      })
    }

    // Função para desenhar partículas (com intensidade variável)
    const drawParticles = (time: number, intensity: number) => {
      if (intensity <= 0) return

      const canvasWidth = canvas.clientWidth || window.innerWidth
      const canvasHeight = canvas.clientHeight || window.innerHeight

      particles.forEach((particle) => {
        particle.x += particle.vx * intensity + Math.sin(time * 0.0008 + particle.x * 0.008) * 0.15 * intensity
        particle.y += particle.vy * intensity + Math.cos(time * 0.0008 + particle.y * 0.008) * 0.15 * intensity

        particle.vx *= 0.96
        particle.vy *= 0.96

        if (particle.x < 0) particle.x = canvasWidth
        if (particle.x > canvasWidth) particle.x = 0
        if (particle.y < 0) particle.y = canvasHeight
        if (particle.y > canvasHeight) particle.y = 0

        const pulse = (Math.sin(time * 0.0015 + particle.x * 0.008) + 1) * 0.5
        const alpha = particle.opacity * (0.5 + pulse * 0.5) * intensity

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    // Função para desenhar anéis orbitais (com intensidade variável)
    const drawOrbitalRings = (time: number, intensity: number) => {
      if (intensity <= 0) return

      orbitalRings.forEach((ring, i) => {
        ring.angle += ring.speed * intensity

        const cx = centerX()
        const cy = centerY()
        const radius = ring.radius + Math.sin(time * 0.0004 + i) * 8 * intensity

        const gradient = ctx.createLinearGradient(
          cx - radius,
          cy - radius,
          cx + radius,
          cy + radius
        )
        gradient.addColorStop(0, `${ring.color}00`)
        gradient.addColorStop(0.5, `${ring.color}${Math.floor(ring.opacity * intensity * 255).toString(16).padStart(2, '0')}`)
        gradient.addColorStop(1, `${ring.color}00`)

        ctx.strokeStyle = gradient
        ctx.lineWidth = 0.8
        ctx.globalAlpha = ring.opacity * intensity
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.stroke()
      })
      ctx.globalAlpha = 1
    }

    // Função para desenhar ondas (com intensidade variável)
    const drawWaves = (intensity: number) => {
      if (intensity <= 0) return

      waves.forEach((wave) => {
        wave.radius += wave.speed * intensity
        wave.opacity = Math.max(0, wave.opacity - 0.0015 * intensity)

        if (wave.radius > wave.maxRadius || wave.opacity <= 0) {
          wave.x = centerX() + (Math.random() - 0.5) * 300
          wave.y = centerY() + (Math.random() - 0.5) * 300
          wave.radius = Math.random() * 50
          wave.opacity = 0.08
        }

        const gradient = ctx.createRadialGradient(wave.x, wave.y, 0, wave.x, wave.y, wave.radius)
        gradient.addColorStop(0, `rgba(218, 0, 40, ${wave.opacity * 0.2 * intensity})`)
        gradient.addColorStop(0.5, `rgba(4, 42, 161, ${wave.opacity * 0.2 * intensity})`)
        gradient.addColorStop(1, `rgba(218, 0, 40, 0)`)

        ctx.strokeStyle = gradient
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2)
        ctx.stroke()
      })
    }

    // Função para desenhar gradientes de fundo (sempre presentes, mas variam em intensidade)
    const drawBackgroundGradients = (time: number, intensity: number) => {
      const cx = centerX()
      const cy = centerY()

      // Base sempre presente (cores do tema)
      const baseRedOpacity = 0.03
      const baseBlueOpacity = 0.03
      // Adicional quando em HomePage
      const homeRedOpacity = 0.05 * intensity
      const homeBlueOpacity = 0.05 * intensity

      const redGradient = ctx.createRadialGradient(
        cx - 400,
        cy - 300,
        0,
        cx - 400,
        cy - 300,
        500
      )
      redGradient.addColorStop(0, `rgba(218, 0, 40, ${baseRedOpacity + homeRedOpacity})`)
      redGradient.addColorStop(1, 'rgba(218, 0, 40, 0)')
      ctx.fillStyle = redGradient
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

      const blueGradient = ctx.createRadialGradient(
        cx + 400,
        cy + 300,
        0,
        cx + 400,
        cy + 300,
        500
      )
      blueGradient.addColorStop(0, `rgba(4, 42, 161, ${baseBlueOpacity + homeBlueOpacity})`)
      blueGradient.addColorStop(1, 'rgba(4, 42, 161, 0)')
      ctx.fillStyle = blueGradient
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

      if (intensity > 0) {
        const pulse = (Math.sin(time * 0.0008) + 1) * 0.5 * intensity
        const centerGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 250 + pulse * 50)
        centerGradient.addColorStop(0, `rgba(255, 255, 255, ${0.015 * intensity})`)
        centerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
        ctx.fillStyle = centerGradient
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
      }
    }

    // Função para desenhar grid digital (sempre presente)
    const drawDigitalGrid = () => {
      const gridSize = 120
      const gridOpacity = 0.015
      
      ctx.strokeStyle = `rgba(255, 255, 255, ${gridOpacity})`
      ctx.lineWidth = 0.3
      ctx.globalAlpha = 1

      // Linhas horizontais
      for (let y = 0; y < window.innerHeight; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(window.innerWidth, y)
        ctx.stroke()
      }

      // Linhas verticais
      for (let x = 0; x < window.innerWidth; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, window.innerHeight)
        ctx.stroke()
      }
    }

    // Função para desenhar linhas de conexão (com intensidade variável)
    const drawConnectionLines = (intensity: number) => {
      if (intensity <= 0) return

      ctx.strokeStyle = `rgba(255, 255, 255, ${0.02 * intensity})`
      ctx.lineWidth = 0.3

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            const opacity = (1 - distance / 100) * 0.05 * intensity
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
    }

    // Loop de animação
    const animate = (currentTime: number) => {
      timeRef.current = currentTime
      const intensity = animationIntensityRef.current

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

      drawBackgroundGradients(currentTime, intensity)
      drawDigitalGrid()
      drawOrbitalRings(currentTime, intensity)
      drawWaves(intensity)
      drawConnectionLines(intensity)
      drawParticles(currentTime, intensity)

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate(0)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isHomePage])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}

