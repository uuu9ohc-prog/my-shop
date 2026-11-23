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
const clamp01 = (v) => Math.min(1, Math.max(0, v))

// 털실 느낌 (P5·P6 최종 이미지, 2026-11-23) — 털실을 안 넘기면(P3 미리보기) 기본값
// contrast: 뜨개 질감(밝기 차이)을 얼마나 살릴지 · blur: 질감을 얼마나 뭉갤지(px)
// light/sat: 밝기·채도 조정 · fibers: 보풀 그리기 · stitch: 큰 뜨개 코 크기(px, 사진 폭 500 기준)
const YARN_LOOK = {
  default: { contrast: 1.15, blur: 0, light: 0, sat: 1 },
  // 벨벳: 코가 거의 안 보일 만큼 매끈하고 색이 진하고 부드러움
  velvet: { contrast: 0.9, blur: 4, light: -0.01, sat: 1.05 },
  // 부슬부슬: 코가 보풀에 덮여 흐릿하고 살짝 밝음 + 가장자리로 삐져나온 털
  fluffy: { contrast: 0.55, blur: 3, light: 0.03, sat: 0.92, fibers: true },
  // 두툼: 사진의 작은 코는 지우고(큰 명암만 남김) 큰 뜨개 코를 새로 그림
  chunky: { contrast: 1, blur: 6, light: 0.03, sat: 1, stitch: 22 },
}

// 칸 번호 → 0~1 고정 난수 (코마다 조금씩 다르게)
const cellRand = (a, b) => {
  const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453
  return n - Math.floor(n)
}
const smooth = (e0, e1, x) => {
  const t = clamp01((x - e0) / (e1 - e0))
  return t * t * (3 - 2 * t)
}

// 큰 뜨개 코의 밝기 변화(대략 -0.16 ~ +0.04): V 모양 두 갈래, 줄마다 반 칸 어긋남
// 손뜨개처럼 보이도록: 줄이 살짝 물결치고, 코마다 크기·기울기·밝기가 조금씩 다르고,
// 코 테두리는 부드럽게, 코 안에는 꼬인 실 결이 비스듬히 보임
function stitchShade(x, y, s) {
  // 줄 물결 — 낮은 주파수의 흔들림으로 반듯한 격자 느낌을 없앰
  const wx = Math.sin(y * 0.021 + x * 0.006) * s * 0.22 + Math.sin(y * 0.057 + 1.3) * s * 0.08
  const wy = Math.sin(x * 0.018 + y * 0.004 + 0.7) * s * 0.18 + Math.sin(x * 0.049) * s * 0.06
  const X = x + wx
  const Y = y + wy
  const h = s * 0.8
  const row = Math.floor(Y / h)
  const xo = X + (row & 1) * s * 0.5
  const col = Math.floor(xo / s)
  const u = xo / s - col - 0.5
  const v = Y / h - row - 0.5
  const left = u < 0
  const side = left ? 0 : 1
  const r1 = cellRand(row, col * 2 + side)
  const r2 = cellRand(col * 2 + side + 17, row + 5)
  const r3 = cellRand(row + 31, col * 2 + side + 9)
  // 갈래마다 위치·기울기·굵기를 조금씩 흔듦
  const du = u - (left ? -0.25 : 0.25) + (r1 - 0.5) * 0.05
  const dv = v + (r2 - 0.5) * 0.08
  const a = (left ? 0.45 : -0.45) + (r3 - 0.5) * 0.22 // 왼쪽 갈래는 \, 오른쪽 갈래는 /
  const ru = du * Math.cos(a) - dv * Math.sin(a)
  const rv = du * Math.sin(a) + dv * Math.cos(a)
  const d2 = (ru / (0.23 + r1 * 0.04)) ** 2 + (rv / (0.48 + r2 * 0.06)) ** 2
  const body = 1 - smooth(0.55, 1.08, d2) // 코 몸통(1) → 틈(0), 부드럽게 이어짐
  const bump = Math.sqrt(Math.max(0, 1 - Math.min(d2, 1)))
  // 꼬인 실 결: 갈래 방향에 비스듬한 가는 줄
  const twist = Math.sin((rv * 5.5 + ru * (left ? 9 : -9)) * Math.PI) * 0.25 * bump
  const lit = bump * 0.6 - rv * 0.3 + twist + (r3 - 0.5) * 0.3 // 볼록 + 위가 조금 밝게 + 결 + 코마다 밝기 차이
  // 코는 거의 원래 밝기, 틈만 어둡게 → 하얗게 뜨지 않음
  return body * (lit * 0.05 - 0.035) + (1 - body) * -0.13
}

const STITCH_MEAN = -0.065 // stitchShade 의 대략적인 평균값

// 각 픽셀이 인형 테두리(투명한 곳)에서 얼마나 떨어져 있는지(px) — 두 번 훑는 거리 계산
function edgeDistance(alpha, W, H) {
  const d = new Float32Array(W * H)
  for (let i = 0; i < d.length; i++) d[i] = alpha[i] < 128 ? 0 : 1e6
  const D = Math.SQRT2
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x
      if (d[i] === 0) continue
      let m = d[i]
      if (x > 0) m = Math.min(m, d[i - 1] + 1)
      if (y > 0) {
        m = Math.min(m, d[i - W] + 1)
        if (x > 0) m = Math.min(m, d[i - W - 1] + D)
        if (x < W - 1) m = Math.min(m, d[i - W + 1] + D)
      }
      d[i] = m
    }
  }
  for (let y = H - 1; y >= 0; y--) {
    for (let x = W - 1; x >= 0; x--) {
      const i = y * W + x
      if (d[i] === 0) continue
      let m = d[i]
      if (x < W - 1) m = Math.min(m, d[i + 1] + 1)
      if (y < H - 1) {
        m = Math.min(m, d[i + W] + 1)
        if (x < W - 1) m = Math.min(m, d[i + W + 1] + D)
        if (x > 0) m = Math.min(m, d[i + W - 1] + D)
      }
      d[i] = m
    }
  }
  return d
}

// 같은 그림이 매번 같게 나오도록 고정 난수
const seeded = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

// 부위 안에서만 평균을 내는 상자 흐림 (가로 → 세로)
function blurInParts(values, inPart, W, H, r) {
  const tmp = new Float32Array(values.length)
  const pass = (src, dst, horizontal) => {
    for (let a = 0; a < (horizontal ? H : W); a++) {
      for (let b = 0; b < (horizontal ? W : H); b++) {
        const idx = horizontal ? a * W + b : b * W + a
        if (inPart[idx] < 0) continue
        let sum = 0
        let n = 0
        for (let k = -r; k <= r; k++) {
          const bb = b + k
          if (bb < 0 || bb >= (horizontal ? W : H)) continue
          const j = horizontal ? a * W + bb : bb * W + a
          if (inPart[j] !== inPart[idx]) continue
          sum += src[j]
          n++
        }
        dst[idx] = sum / n
      }
    }
  }
  pass(values, tmp, true)
  pass(tmp, values, false)
}

// 부슬부슬 털실의 보풀: 몸 위의 잔털 + 가장자리 밖으로 삐져나온 털
function drawFibers(ctx, { W, H, alpha, inPart, targets, partPixels, edgePixels }) {
  const rand = seeded(7)
  const k = W / 500 // 사진 크기에 맞춰 털 길이 조정
  const stroke = (x, y, angle, len, t, lift, a, w) => {
    const bend = (rand() - 0.5) * len * 0.8
    const ex = x + Math.cos(angle) * len
    const ey = y + Math.sin(angle) * len
    const mx = (x + ex) / 2 - Math.sin(angle) * bend
    const my = (y + ey) / 2 + Math.cos(angle) * bend
    ctx.strokeStyle = `hsla(${t[0] * 360},${t[1] * 85}%,${clamp01(t[2] + lift) * 100}%,${a})`
    ctx.lineWidth = w
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.quadraticCurveTo(mx, my, ex, ey)
    ctx.stroke()
  }
  ctx.lineCap = 'round'
  // 몸 위의 잔털
  const bodyCount = Math.floor(partPixels.length / 110)
  for (let n = 0; n < bodyCount; n++) {
    const idx = partPixels[Math.floor(rand() * partPixels.length)]
    const t = targets[inPart[idx]]
    stroke(idx % W, Math.floor(idx / W), rand() * Math.PI * 2, (3 + rand() * 6) * k, t, 0.14, 0.3 + rand() * 0.25, (0.5 + rand() * 0.5) * k)
  }
  // 가장자리 밖으로 삐져나온 털 (바깥 방향 = 투명한 쪽)
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : alpha[y * W + x])
  const edgeCount = Math.floor(edgePixels.length / 2)
  for (let n = 0; n < edgeCount; n++) {
    const idx = edgePixels[Math.floor(rand() * edgePixels.length)]
    const x = idx % W
    const y = Math.floor(idx / W)
    const nx = at(x - 3, y) - at(x + 3, y)
    const ny = at(x, y - 3) - at(x, y + 3)
    if (nx === 0 && ny === 0) continue
    const t = targets[inPart[idx]]
    const angle = Math.atan2(ny, nx) + (rand() - 0.5) * 1.3
    stroke(x, y, angle, (4 + rand() * 8) * k, t, 0.08, 0.45 + rand() * 0.3, (0.5 + rand() * 0.6) * k)
  }
}

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

export default function PhotoDoll({ design, colors, yarnId, reveal = false, className = '' }) {
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
    const look = YARN_LOOK[yarnId] ?? YARN_LOOK.default
    const W = base.width
    const H = base.height
    const bd = base.data
    const targets = design.parts.map((_, i) => {
      const c = getColor(colors[i])
      return c ? rgbToHsl(...hexToRgb(c.hex)) : null
    })

    // 1) 칠할 곳(부위) 표시 + 뜨개 질감(부위 평균보다 얼마나 밝고 어두운지) 읽기
    const inPart = new Int8Array(W * H).fill(-1)
    const detail = new Float32Array(W * H)
    const alpha = new Uint8Array(W * H)
    const partPixels = []
    for (let idx = 0; idx < W * H; idx++) {
      const i = idx * 4
      alpha[idx] = bd[i + 3]
      const part = maskPart(mask.data[i])
      if (part < 0 || !targets[part] || bd[i + 3] === 0) continue
      inPart[idx] = part
      if (bd[i + 3] < 250) continue // 반투명 가장자리는 질감 0
      partPixels.push(idx)
      detail[idx] = luma(bd[i], bd[i + 1], bd[i + 2]) - refs[part]
    }
    if (look.blur > 0) blurInParts(detail, inPart, W, H, look.blur)
    if (look.stitch) {
      const s = look.stitch * (W / 500)
      // 인형 테두리 쪽은 둥글게 넘어가는 곳이라 코가 옅고 작게 보임 → 테두리에서 멀수록 진하게
      const dist = edgeDistance(alpha, W, H)
      for (const idx of partPixels) {
        // 평균 밝기(STITCH_MEAN)는 그대로 두고 무늬 대비만 줄임 → 테두리가 하얗게 번지지 않음
        const amp = 0.6 + 0.4 * smooth(0, s * 0.8, dist[idx])
        detail[idx] += STITCH_MEAN + (stitchShade(idx % W, Math.floor(idx / W), s) - STITCH_MEAN) * amp
      }
    }

    // 2) 고른 색으로 칠하기 — 질감은 털실에 맞춰 살리거나 뭉갬
    const out = new ImageData(new Uint8ClampedArray(bd), W, H)
    const px = out.data
    const edgePixels = []
    for (let idx = 0; idx < W * H; idx++) {
      const part = inPart[idx]
      if (part < 0) continue
      const i = idx * 4
      const t = targets[part]
      // 반투명 가장자리는 질감 없이 고른 색 그대로 → 밝은 테두리(헤일로)가 생기지 않게
      const l = px[i + 3] < 250 ? t[2] : clamp01(t[2] + look.light + detail[idx] * look.contrast)
      const [r, g, b] = hslToRgb(t[0], clamp01(t[1] * look.sat), l)
      px[i] = r
      px[i + 1] = g
      px[i + 2] = b
      if (look.fibers && px[i + 3] > 200) {
        const x = idx % W
        const y = Math.floor(idx / W)
        if (x > 2 && y > 2 && x < W - 3 && y < H - 3 &&
          (alpha[idx - 3] === 0 || alpha[idx + 3] === 0 || alpha[idx - 3 * W] === 0 || alpha[idx + 3 * W] === 0)) {
          edgePixels.push(idx)
        }
      }
    }

    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    let finalImage = out
    // 3) 부슬부슬한 털실: 보풀을 덧그림 (따로 그린 뒤 한 장으로 합침)
    if (look.fibers && partPixels.length) {
      const work = document.createElement('canvas')
      work.width = W
      work.height = H
      const wctx = work.getContext('2d', { willReadFrequently: true })
      wctx.putImageData(out, 0, 0)
      drawFibers(wctx, { W, H, alpha, inPart, targets, partPixels, edgePixels })
      finalImage = wctx.getImageData(0, 0, W, H)
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reveal && !revealedRef.current && !reduce) {
      revealedRef.current = true
      let done = false
      const cancel = pixelReveal(ctx, finalImage, () => (done = true))
      // 중간에 정리되면(개발 모드 이중 실행 등) 다음에 다시 처음부터 나타나게
      return () => {
        cancel()
        if (!done) revealedRef.current = false
      }
    }
    ctx.putImageData(finalImage, 0, 0)
    return undefined
  }, [ready, key, yarnId]) // eslint-disable-line react-hooks/exhaustive-deps

  return <canvas ref={canvasRef} className={`photo-doll ${className}`} aria-hidden="true" />
}
