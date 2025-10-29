import { useEffect, useRef } from 'react'

const ParticleDots = ({
  color = null,
  colors = ['#ffffff', '#000000', '#B45309'],
  cycleMs = 4000,
  density = 0.0015,
  maxConnDist = 110,
}) => {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const colorRef = useRef(color || colors[0])
  const intervalRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }

    let particles = []
    const initParticles = () => {
      const count = Math.min(220, Math.floor(canvas.width * canvas.height * density))
      particles = Array.from({ length: count }).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: 1 + Math.random() * 1.5,
      }))
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // draw and move particles
      const activeColor = colorRef.current
      ctx.fillStyle = activeColor + 'AA' // slight transparency
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }

      // connect close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.hypot(dx, dy)
          if (dist < maxConnDist) {
            const alpha = 1 - dist / maxConnDist
            ctx.strokeStyle = activeColor + Math.floor(alpha * 120).toString(16).padStart(2, '0')
            ctx.lineWidth = 0.6
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    draw()

    // Cycle colors if an array was provided (or color not explicitly set)
    if (!color && Array.isArray(colors) && colors.length > 1) {
      let idx = 0
      intervalRef.current = setInterval(() => {
        idx = (idx + 1) % colors.length
        colorRef.current = colors[idx]
      }, Math.max(1000, cycleMs))
    } else {
      colorRef.current = color || colors[0]
    }

    return () => {
      window.removeEventListener('resize', resize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [color, colors, cycleMs, density, maxConnDist])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      aria-hidden
    />
  )
}

export default ParticleDots


