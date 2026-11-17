import { useEffect, useRef } from 'react'

import './PixelSnow.css'

/*
 * 픽셀 눈 효과 (Canvas 2D).
 * 스프라이트 문자: '@' 가장 밝음, 'o' 중간, 'x' 흐림, '.' 빈칸
 */
const SPRITES = {
  square: [
    ['@'],
    ['oo', 'oo'],
    ['xox', 'o@o', 'xox'],
    ['xoox', 'o@@o', 'o@@o', 'xoox'],
    ['xooox', 'oo@oo', 'o@@@o', 'oo@oo', 'xooox'],
  ],
  round: [
    ['@'],
    ['.x.', 'x@x', '.x.'],
    ['.xx.', 'x@@x', 'x@@x', '.xx.'],
    ['.xxx.', 'xo@ox', 'x@@@x', 'xo@ox', '.xxx.'],
    ['..xxx..', '.xooox.', 'xoo@oox', 'xo@@@ox', 'xoo@oox', '.xooox.', '..xxx..'],
  ],
  star: [
    ['@'],
    ['.x.', 'x@x', '.x.'],
    ['..o..', '.xox.', 'oo@oo', '.xox.', '..o..'],
    ['o..o..o', '.o.o.o.', '..ooo..', 'ooo@ooo', '..ooo..', '.o.o.o.', 'o..o..o'],
    [
      'x...x...x',
      '.o..o..o.',
      '..o.o.o..',
      '...ooo...',
      'xooo@ooox',
      '...ooo...',
      '..o.o.o..',
      '.o..o..o.',
      'x...x...x',
    ],
  ],
}

const MARK_ALPHA = { '@': 1, o: 0.7, x: 0.4 }
const LEVELS = 5
const LEVEL_WEIGHTS = [0.34, 0.28, 0.2, 0.12, 0.06]
const LEVEL_FALL = [18, 26, 36, 48, 62] // px/s (CSS 픽셀)
const MAX_FLAKES = 600

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

export default function PixelSnow({
  color = '#ffffff',
  variant = 'round', // 'square' | 'round' | 'star'
  density = 0.35, // 0 ~ 1
  speed = 1,
  wind = 0.15, // -2 ~ 2
  sway = 1,
  pixelSize = 3, // 스프라이트 한 칸의 CSS 픽셀 크기
  depth = 0.6, // 0 ~ 1, 작은 눈일수록 흐리고 느리게
  twinkle = 0.3, // 0 ~ 1
  mouseInteraction = true,
  paused = false,
  className = '',
  ...rest
}) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const settingsRef = useRef(null)
  settingsRef.current = {
    color,
    sprites: SPRITES[variant] || SPRITES.round,
    density: clamp(density, 0, 1),
    speed,
    wind: clamp(wind, -2, 2),
    sway: Math.max(0, sway),
    pixelSize: Math.round(clamp(pixelSize, 1, 12)),
    depth: clamp(depth, 0, 1),
    twinkle: clamp(twinkle, 0, 1),
    mouseInteraction,
    paused,
  }

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return undefined
    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const view = { width: 1, height: 1, ratio: 1 }
    const pointer = { x: 0, y: 0, inside: false }
    const flakes = []
    let raf = 0
    let last = 0
    let time = 0
    let visible = true

    const pickLevel = () => {
      let r = Math.random()
      for (let level = 0; level < LEVELS; level++) {
        r -= LEVEL_WEIGHTS[level]
        if (r <= 0) return level
      }
      return LEVELS - 1
    }

    const spawn = (flake, top) => {
      flake.level = pickLevel()
      flake.x = Math.random() * (view.width + 40) - 20
      flake.y = top ? -20 - Math.random() * 30 : Math.random() * view.height
      flake.vx = 0
      flake.vy = 0
      flake.phase = Math.random() * Math.PI * 2
      flake.rate = 0.6 + Math.random() * 0.9
      flake.drift = 0.7 + Math.random() * 0.6
      flake.sparkle = Math.random() * 100
    }

    const populate = () => {
      const s = settingsRef.current
      const target = Math.round(clamp((view.width * view.height * s.density) / 2200, 0, MAX_FLAKES))
      while (flakes.length < target) {
        const flake = {}
        spawn(flake, false)
        flakes.push(flake)
      }
      if (flakes.length > target) flakes.length = target
    }

    const simulate = dt => {
      const s = settingsRef.current
      const margin = 30
      const radius = 110
      for (const flake of flakes) {
        const parallax = 1 - s.depth * (1 - (flake.level + 1) / LEVELS) * 0.75
        const swing = Math.sin(time * flake.rate + flake.phase) * s.sway * (6 + flake.level * 6)
        const targetX = (s.wind * 46 * parallax + swing) * flake.drift
        const targetY = LEVEL_FALL[flake.level] * parallax * s.speed * flake.drift
        const ease = 1 - Math.exp(-dt * 3)
        flake.vx += (targetX - flake.vx) * ease
        flake.vy += (targetY - flake.vy) * ease

        if (s.mouseInteraction && pointer.inside) {
          const dx = flake.x - pointer.x
          const dy = flake.y - pointer.y
          const distance = Math.hypot(dx, dy)
          if (distance < radius && distance > 0.001) {
            const repel = (1 - distance / radius) * 900 * dt
            flake.vx += (dx / distance) * repel
            flake.vy += (dy / distance) * repel
          }
        }

        flake.x += flake.vx * dt
        flake.y += flake.vy * dt
        if (flake.y > view.height + margin) spawn(flake, true)
        if (flake.x < -margin) flake.x += view.width + margin * 2
        else if (flake.x > view.width + margin) flake.x -= view.width + margin * 2
      }
    }

    const draw = () => {
      const s = settingsRef.current
      const px = s.pixelSize * view.ratio
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = s.color
      for (const flake of flakes) {
        const rows = s.sprites[flake.level]
        const size = rows.length
        const depthLight = 1 - s.depth * (1 - (flake.level + 1) / LEVELS) * 0.6
        const spark = s.twinkle * (0.5 + 0.5 * Math.sin(time * 3 + flake.sparkle))
        const light = clamp(depthLight * (1 - s.twinkle * 0.5 + spark), 0, 1)
        // 픽셀 격자에 맞춰 스냅
        const ox = Math.round((flake.x * view.ratio) / px) * px - Math.floor(size / 2) * px
        const oy = Math.round((flake.y * view.ratio) / px) * px - Math.floor(size / 2) * px
        for (let y = 0; y < size; y++) {
          const line = rows[y]
          for (let x = 0; x < line.length; x++) {
            const alpha = MARK_ALPHA[line[x]]
            if (!alpha) continue
            ctx.globalAlpha = alpha * light
            ctx.fillRect(ox + x * px, oy + y * px, px, px)
          }
        }
      }
      ctx.globalAlpha = 1
    }

    const frame = now => {
      raf = 0
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0
      last = now
      time += dt
      simulate(dt)
      draw()
      if (visible && !settingsRef.current.paused && !document.hidden) raf = requestAnimationFrame(frame)
    }

    const wake = () => {
      if (reduce) {
        draw()
        return
      }
      if (!raf && visible && !settingsRef.current.paused && !document.hidden) {
        last = 0
        raf = requestAnimationFrame(frame)
      }
    }

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      view.width = Math.max(1, container.clientWidth)
      view.height = Math.max(1, container.clientHeight)
      view.ratio = ratio
      canvas.width = Math.round(view.width * ratio)
      canvas.height = Math.round(view.height * ratio)
      populate()
      draw()
    }

    const onPointerMove = event => {
      const rect = container.getBoundingClientRect()
      pointer.x = event.clientX - rect.left
      pointer.y = event.clientY - rect.top
      pointer.inside = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height
    }
    const onVisibility = () => wake()

    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    const intersection = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting)
      wake()
    })
    intersection.observe(container)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    wake()

    return () => {
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      intersection.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  // paused 해제 시 다시 시작
  useEffect(() => {
    if (!paused) {
      const evt = new Event('visibilitychange')
      document.dispatchEvent(evt)
    }
  }, [paused])

  return (
    <div ref={containerRef} className={`pixel-snow-container${className ? ` ${className}` : ''}`} {...rest}>
      <canvas ref={canvasRef} className="pixel-snow-canvas" aria-hidden="true" />
    </div>
  )
}
