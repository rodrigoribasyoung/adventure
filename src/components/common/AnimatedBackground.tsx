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

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    // Configuração do canvas
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.scale(dpr, dpr)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

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
      particles.forEach((particle) => {
        // Movimento orgânico com seno/cosseno
        particle.x += particle.vx + Math.sin(time * 0.001 + particle.x * 0.01) * 0.2
        particle.y += particle.vy + Math.cos(time * 0.001 + particle.y * 0.01) * 0.2

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
    }

    // Loop de animação suave
    const animate = (currentTime: number) => {
      timeRef.current = currentTime

      // Limpar canvas com fade suave
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
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

          // Som ambiente mais suave e moderno
          const osc1 = audioContext.createOscillator()
          const osc2 = audioContext.createOscillator()
          const gain = audioContext.createGain()
          const filter = audioContext.createBiquadFilter()

          osc1.type = 'sine'
          osc1.frequency.setValueAtTime(80 + Math.random() * 10, now)

          osc2.type = 'triangle'
          osc2.frequency.setValueAtTime(160 + Math.random() * 20, now)

          filter.type = 'lowpass'
          filter.frequency.setValueAtTime(300 + Math.random() * 100, now)
          filter.Q.setValueAtTime(0.3, now)

          gain.gain.setValueAtTime(0, now)
          gain.gain.linearRampToValueAtTime(0.008, now + 0.5)
          gain.gain.linearRampToValueAtTime(0.008, now + 3)
          gain.gain.linearRampToValueAtTime(0, now + 3.5)

          osc1.connect(filter)
          osc2.connect(filter)
          filter.connect(gain)
          gain.connect(audioContext.destination)

          osc1.start(now)
          osc2.start(now)
          osc1.stop(now + 3.5)
          osc2.stop(now + 3.5)

          setTimeout(() => {
            isPlaying = false
          }, 3500)
        } catch (error) {
          isPlaying = false
        }
      }

      const initAudio = async () => {
        try {
          audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

          setTimeout(() => {
            playSound()
          }, 2000)

          intervalId = window.setInterval(() => {
            if (!document.hidden) {
              playSound()
            }
          }, 6000 + Math.random() * 3000)
        } catch (error) {
          console.log('Áudio não disponível:', error)
        }
      }

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
