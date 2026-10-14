import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/utils'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  hue: string
  size: number
}

export function WinBurst({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!active || prefersReducedMotion()) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.clientWidth * window.devicePixelRatio
      canvas.height = canvas.clientHeight * window.devicePixelRatio
    }
    resize()

    const particles: Particle[] = Array.from({ length: 42 }, () => ({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 7,
      vy: (Math.random() - 0.75) * 6,
      life: 1,
      hue: Math.random() > 0.45 ? '#d4b46a' : '#3ee0a2',
      size: 1.4 + Math.random() * 2.4,
    }))

    let frame = 0
    let raf = 0
    const tick = () => {
      frame += 1
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.06
        p.life -= 0.016
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.fillStyle = p.hue
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * window.devicePixelRatio, 0, Math.PI * 2)
        ctx.fill()
      })
      if (frame < 90) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-20 h-full w-full"
      aria-hidden="true"
    />
  )
}
