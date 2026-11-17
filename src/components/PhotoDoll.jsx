import { useEffect, useRef, useState } from 'react'
import { getColor } from '../data/options.js'
import dogBase from '../images/doll-dog.png'
import dogMask from '../images/doll-dog-mask.png'
import catBase from '../images/doll-cat.png'
import catMask from '../images/doll-cat-mask.png'
import rabbitBase from '../images/doll-rabbit.png'
import rabbitMask from '../images/doll-rabbit-mask.png'
import bearBase from '../images/doll-bear.png'
import bearMask from '../images/doll-bear-mask.png'
import tigerBase from '../images/doll-tiger.png'
import tigerMask from '../images/doll-tiger-mask.png'
import duckBase from '../images/doll-duck.png'
import duckMask from '../images/doll-duck-mask.png'

// 사진 인형 — 실제 인형 사진에서 부위별 색만 바꿈 (S3-2 미리보기, 2026-11-17)
// 원본 사진(assets/images): 강아지 color_puppy.png.jpg, 고양이 color_kitty.png.jpg, 토끼 color_rabbit.png.jpg,
//   곰 color_bear.png.jpg, 호랑이 color_tiger.png.jpg, 오리 duck.01.jpg
// 부위 나누기: 부위마다 실 색이 달라 색으로 나눔. 입 주변·코·입·수염 자수는 바꾸지 않음(255)
// 사진은 배경을 투명하게 따낸(누끼) RGBA PNG — 가장자리는 반투명으로 부드럽게
// 마스크 PNG의 밝기: 0 배경, 60·120·180·240 → 부위 0·1·2·3 (design.parts 순서), 255 → 그대로 두는 곳(입 주변·코·입·자수)
// 색 입히기: 사진의 밝고 어두운 무늬(뜨개 질감)는 살리고, 색상·채도는 고른 색으로 바꿈
export const PHOTO_DOLLS = {
  dog: { base: dogBase, mask: dogMask },
  cat: { base: catBase, mask: catMask },
  rabbit: { base: rabbitBase, mask: rabbitMask },
  bear: { base: bearBase, mask: bearMask },
  tiger: { base: tigerBase, mask: tigerMask },
  duck: { base: duckBase, mask: duckMask },
}

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

const readPixels = (img) => {
  const c = document.createElement('canvas')
  c.width = img.naturalWidth
  c.height = img.naturalHeight
  const ctx = c.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0)
  return ctx.getImageData(0, 0, c.width, c.height)
}

const hexToRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const rgbToHsl = (r, g, b) => {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  return [h / 6, s, l]
}

const hue2rgb = (p, q, t) => {
  if (t < 0) t += 1
  if (t > 1) t -= 1
  if (t < 1 / 6) return p + (q - p) * 6 * t
  if (t < 1 / 2) return q
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
  return p
}

const hslToRgb = (h, s, l) => {
  if (s === 0) return [l * 255, l * 255, l * 255]
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return [hue2rgb(p, q, h + 1 / 3) * 255, hue2rgb(p, q, h) * 255, hue2rgb(p, q, h - 1 / 3) * 255]
}

// 마스크 값 → 부위 번호 (-1 = 배경이거나 그대로 두는 곳)
const maskPart = (v) => (v === 0 || v >= 250 ? -1 : Math.round(v / 60) - 1)

const luma = (r, g, b) => (0.299 * r + 0.587 * g + 0.114 * b) / 255
const CONTRAST = 1.15 // 질감(밝기 차이)을 얼마나 살릴지

// Pixel Reveal: 처음 그릴 때 아무것도 없다가 위에서부터 픽셀 칸이 하나씩 생기며 나타남 (P5, 2026-11-17)
const REVEAL_MS = 1600 // 전체 시간
const CELL = 14 // 픽셀 칸 크기(원본 사진 px)

function pixelReveal(ctx, image, onDone) {
  const cols = Math.ceil(image.width / CELL)
  const rows = Math.ceil(image.height / CELL)
  // 칸마다 나타나는 시각: 위쪽 줄일수록 먼저(75%) + 같은 줄 안에서는 무작위(25%)
  const cells = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({ x: c * CELL, y: r * CELL, at: (r / rows) * 0.75 + Math.random() * 0.25 })
    }
  }
  cells.sort((a, b) => a.at - b.at)
  let next = 0
  let raf = 0
  const start = performance.now()
  const step = (now) => {
    const t = Math.min(1, (now - start) / REVEAL_MS)
    while (next < cells.length && cells[next].at <= t) {
      const { x, y } = cells[next]
      ctx.putImageData(image, 0, 0, x, y, CELL, CELL)
      next++
    }
    if (t < 1) raf = requestAnimationFrame(step)
    else {
      ctx.putImageData(image, 0, 0)
      onDone?.()
    }
  }
  raf = requestAnimationFrame(step)
  return () => cancelAnimationFrame(raf)
}

export default function PhotoDoll({ design, colors, reveal = false, className = '' }) {
  const canvasRef = useRef(null)
  const dataRef = useRef(null) // { base, mask, refs }
  const [ready, setReady] = useState(false)
  const revealedRef = useRef(false) // Pixel Reveal 은 처음 한 번만
  const src = PHOTO_DOLLS[design.id]

  // 사진·마스크 한 번 읽기 + 부위별 평균 밝기 계산
  useEffect(() => {
    let alive = true
    setReady(false)
    Promise.all([loadImage(src.base), loadImage(src.mask)]).then(([b, m]) => {
      if (!alive) return
      const base = readPixels(b)
      const mask = readPixels(m)
      const sum = {}
      const cnt = {}
      for (let i = 0; i < mask.data.length; i += 4) {
        const part = maskPart(mask.data[i])
        if (part < 0 || base.data[i + 3] < 255) continue
        sum[part] = (sum[part] ?? 0) + luma(base.data[i], base.data[i + 1], base.data[i + 2])
        cnt[part] = (cnt[part] ?? 0) + 1
      }
      const refs = {}
      Object.keys(sum).forEach((p) => (refs[p] = sum[p] / cnt[p]))
      dataRef.current = { base, mask, refs }
      setReady(true)
    })
    return () => {
      alive = false
    }
  }, [src.base, src.mask])

  // 고른 색이 바뀔 때마다 다시 칠하기
  const key = design.parts.map((_, i) => colors[i] ?? '').join(',')
  useEffect(() => {
    const data = dataRef.current
    const canvas = canvasRef.current
    if (!ready || !data || !canvas) return
    const { base, mask, refs } = data
    const targets = design.parts.map((_, i) => {
      const c = getColor(colors[i])
      return c ? rgbToHsl(...hexToRgb(c.hex)) : null
    })
    const out = new ImageData(new Uint8ClampedArray(base.data), base.width, base.height)
    const px = out.data
    for (let i = 0; i < px.length; i += 4) {
      const part = maskPart(mask.data[i])
      const t = part >= 0 ? targets[part] : null
      if (!t || px[i + 3] === 0) continue
      // 반투명 가장자리는 질감 없이 고른 색 그대로 → 밝은 테두리(헤일로)가 생기지 않게
      const l =
        px[i + 3] < 250
          ? t[2]
          : Math.min(1, Math.max(0, t[2] + (luma(px[i], px[i + 1], px[i + 2]) - refs[part]) * CONTRAST))
      const [r, g, b] = hslToRgb(t[0], t[1], l)
      px[i] = r
      px[i + 1] = g
      px[i + 2] = b
    }
    canvas.width = base.width
    canvas.height = base.height
    const ctx = canvas.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reveal && !revealedRef.current && !reduce) {
      revealedRef.current = true
      let done = false
      const cancel = pixelReveal(ctx, out, () => (done = true))
      // 중간에 정리되면(개발 모드 이중 실행 등) 다음에 다시 처음부터 나타나게
      return () => {
        cancel()
        if (!done) revealedRef.current = false
      }
    }
    ctx.putImageData(out, 0, 0)
    return undefined
  }, [ready, key]) // eslint-disable-line react-hooks/exhaustive-deps

  return <canvas ref={canvasRef} className={`photo-doll ${className}`} aria-hidden="true" />
}
