import { useEffect, useRef } from 'react'

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

export const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const timeRef = useRef(0)
  const mouseRef = useRef({ x: 0, y: 0, isActive: false })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

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

    // Rastreamento de mouse
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
      mouseRef.current.isActive = true
    }

    const handleMouseLeave = () => {
      mouseRef.current.isActive = false
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    const centerX = () => window.innerWidth / 2
    const centerY = () => window.innerHeight / 2

    // Partículas orgânicas sutis
    const particles: Particle[] = []
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.3 + 0.1,
        life: Math.random(),
        maxLife: 1,
      })
    }

    // Algumas partículas que seguem o cursor (apenas algumas para não atrapalhar)
    const interactiveParticleIndices = Array.from({ length: 15 }, () => 
      Math.floor(Math.random() * particles.length)
    )

    // Anéis orbitais suaves
    const orbitalRings: OrbitalRing[] = []
    for (let i = 0; i < 6; i++) {
      orbitalRings.push({
        radius: 100 + i * 80,
        angle: Math.random() * Math.PI * 2,
        speed: (Math.random() - 0.5) * 0.002,
        opacity: 0.08 - i * 0.01,
        color: i % 2 === 0 ? '#DA0028' : '#042AA1',
      })
    }

    // Ondas suaves
    const waves: Wave[] = []
    for (let i = 0; i < 3; i++) {
      waves.push({
        x: centerX() + (Math.random() - 0.5) * 200,
        y: centerY() + (Math.random() - 0.5) * 200,
        radius: Math.random() * 50,
        maxRadius: 200 + Math.random() * 300,
        opacity: 0.15,
        speed: 0.3 + Math.random() * 0.2,
      })
    }

    // Gradientes suaves
    const createGradient = (x: number, y: number, radius: number, color1: string, color2: string) => {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
      gradient.addColorStop(0, color1)
      gradient.addColorStop(1, color2)
      return gradient
    }

    // Função para desenhar partículas orgânicas
    const drawParticles = (time: number) => {
      particles.forEach((particle, index) => {
        const isInteractive = interactiveParticleIndices.includes(index)
        
        if (isInteractive && mouseRef.current.isActive) {
          // Partículas interativas seguem o cursor suavemente (muito leve)
          const dx = mouseRef.current.x - particle.x
          const dy = mouseRef.current.y - particle.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          // Apenas se estiver dentro de um raio maior (mais suave)
          if (distance < 400) {
            // Força de atração muito reduzida para movimento mais lento
            const attraction = 0.003 * (1 - distance / 400)
            particle.vx += dx * attraction
            particle.vy += dy * attraction
          }
        }
        
        // Movimento orgânico com seno/cosseno
        particle.x += particle.vx + Math.sin(time * 0.001 + particle.x * 0.01) * 0.2
        particle.y += particle.vy + Math.cos(time * 0.001 + particle.y * 0.01) * 0.2

        // Suavizar velocidade (friction mais forte para movimento mais lento)
        particle.vx *= 0.95
        particle.vy *= 0.95

        // Wrap around
        if (particle.x < 0) particle.x = window.innerWidth
        if (particle.x > window.innerWidth) particle.x = 0
        if (particle.y < 0) particle.y = window.innerHeight
        if (particle.y > window.innerHeight) particle.y = 0

        // Opacidade pulsante suave
        const pulse = (Math.sin(time * 0.002 + particle.x * 0.01) + 1) * 0.5
        const alpha = particle.opacity * (0.5 + pulse * 0.5)

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    // Função para desenhar anéis orbitais
    const drawOrbitalRings = (time: number) => {
      orbitalRings.forEach((ring, i) => {
        ring.angle += ring.speed

        const cx = centerX()
        const cy = centerY()
        const radius = ring.radius + Math.sin(time * 0.0005 + i) * 10

        // Gradiente suave no anel
        const gradient = ctx.createLinearGradient(
          cx - radius,
          cy - radius,
          cx + radius,
          cy + radius
        )
        gradient.addColorStop(0, `${ring.color}00`)
        gradient.addColorStop(0.5, `${ring.color}${Math.floor(ring.opacity * 255).toString(16).padStart(2, '0')}`)
        gradient.addColorStop(1, `${ring.color}00`)

        ctx.strokeStyle = gradient
        ctx.lineWidth = 1
        ctx.globalAlpha = ring.opacity
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.stroke()

        // Pontos brilhantes no anel
        const pointAngle = ring.angle
        const pointX = cx + Math.cos(pointAngle) * radius
        const pointY = cy + Math.sin(pointAngle) * radius
        const pointGradient = createGradient(pointX, pointY, 15, ring.color, `${ring.color}00`)
        ctx.fillStyle = pointGradient
        ctx.beginPath()
        ctx.arc(pointX, pointY, 3, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.globalAlpha = 1
    }

    // Função para desenhar ondas suaves
    const drawWaves = () => {
      waves.forEach((wave) => {
        wave.radius += wave.speed
        wave.opacity = Math.max(0, wave.opacity - 0.002)

        if (wave.radius > wave.maxRadius || wave.opacity <= 0) {
          wave.x = centerX() + (Math.random() - 0.5) * 200
          wave.y = centerY() + (Math.random() - 0.5) * 200
          wave.radius = Math.random() * 50
          wave.opacity = 0.15
        }

        const gradient = createGradient(
          wave.x,
          wave.y,
          wave.radius,
          `rgba(218, 0, 40, ${wave.opacity * 0.3})`,
          `rgba(4, 42, 161, ${wave.opacity * 0.3})`
        )

        ctx.strokeStyle = gradient
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2)
        ctx.stroke()
      })
    }

    // Função para desenhar gradientes de fundo suaves
    const drawBackgroundGradients = (time: number) => {
      const cx = centerX()
      const cy = centerY()

      // Gradiente vermelho suave
      const redGradient = createGradient(
        cx - 300,
        cy - 200,
        400,
        'rgba(218, 0, 40, 0.15)',
        'rgba(218, 0, 40, 0)'
      )
      ctx.fillStyle = redGradient
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

      // Gradiente azul suave
      const blueGradient = createGradient(
        cx + 300,
        cy + 200,
        400,
        'rgba(4, 42, 161, 0.15)',
        'rgba(4, 42, 161, 0)'
      )
      ctx.fillStyle = blueGradient
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

      // Gradiente central pulsante
      const pulse = (Math.sin(time * 0.001) + 1) * 0.5
      const centerGradient = createGradient(
        cx,
        cy,
        300 + pulse * 100,
        'rgba(255, 255, 255, 0.03)',
        'rgba(255, 255, 255, 0)'
      )
      ctx.fillStyle = centerGradient
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

      // Gradiente muito sutil no cursor (efeito bem leve)
      if (mouseRef.current.isActive) {
        const cursorGradient = createGradient(
          mouseRef.current.x,
          mouseRef.current.y,
          200,
          'rgba(255, 255, 255, 0.008)',
          'rgba(255, 255, 255, 0)'
        )
        ctx.fillStyle = cursorGradient
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
      }
    }

    // Função para desenhar linhas de conexão sutis
    const drawConnectionLines = () => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.lineWidth = 0.5

      // Conectar partículas próximas
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 120) {
            const opacity = (1 - distance / 120) * 0.1
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      // Linhas muito sutis do cursor para partículas próximas (efeito bem leve)
      if (mouseRef.current.isActive) {
        const mouseX = mouseRef.current.x
        const mouseY = mouseRef.current.y
        let connectionCount = 0
        
        particles.forEach((particle, index) => {
          if (interactiveParticleIndices.includes(index)) {
            const dx = mouseX - particle.x
            const dy = mouseY - particle.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            
            // Raio maior e opacidade muito reduzida
            if (distance < 250) {
              const opacity = (1 - distance / 250) * 0.03
              ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`
              ctx.lineWidth = 0.3
              ctx.beginPath()
              ctx.moveTo(mouseX, mouseY)
              ctx.lineTo(particle.x, particle.y)
              ctx.stroke()
              
              connectionCount++
            }
          }
        })
        
      }
    }

    // Loop de animação suave
    const animate = (currentTime: number) => {
      timeRef.current = currentTime

      // Limpar canvas completamente
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      
      // Preencher com preto sólido
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

      // Desenhar elementos
      drawBackgroundGradients(currentTime)
      drawOrbitalRings(currentTime)
      drawWaves()
      drawConnectionLines()
      drawParticles(currentTime)

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate(0)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
