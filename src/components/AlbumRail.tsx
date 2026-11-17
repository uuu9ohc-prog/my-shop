import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from 'motion/react'
import './AlbumRail.css'

export type Album = {
  id: string
  title: string
  artist: string
  cover: string
  accent?: string
}

export type AlbumRailProps = {
  albums: Album[]
  /** --card-size 값. 숫자는 px. 비우면 clamp(180px, 22vw, 260px) */
  cardSize?: number | string
  /** 가운데 카드와 첫 이웃 사이 간격(px). 그 바깥은 약 70/150 비율로 촘촘해짐 */
  spacing?: number
  /** 옆 카드 최대 회전각(deg) */
  maxRotation?: number
  /** 가운데에서 이 칸 수를 넘는 카드는 숨김 (1.5칸 전부터 서서히 사라짐) */
  visibleRange?: number
  initialIndex?: number
  onChange?: (index: number, album: Album) => void
  /** 가운데 카드를 누르거나 Enter를 누르면 호출 (예: 상세 페이지로 이동) */
  onSelect?: (album: Album, index: number) => void
  /** 가운데 버튼 아이콘 (비우면 재생/일시정지 아이콘) */
  playIcon?: ReactNode
  /** 레코드판 대신 슬리브에서 빠져나올 것 (비우면 레코드판). 함수면 앨범마다 다르게 */
  tuckedItem?: ReactNode | ((album: Album, index: number) => ReactNode)
  /** 버튼 읽기용 이름 (예: '실타래' → '강아지 실타래 꺼내기') */
  tuckedName?: string
  className?: string
  'aria-label'?: string
}

const ROTATE_PER_STEP = 28 // deg
const DEPTH_PER_STEP = 90 // px
const SCALE_PER_STEP = 0.08
const MAX_SCALE_LOSS = 0.35
const OUTER_SPACING_RATIO = 70 / 150
const PX_PER_ITEM = 180 // 드래그 180px = 1칸
const MAX_TILT = 12 // deg
const TILT_FULL_VELOCITY = 1500 // px/s 에서 최대 기울기
const MOMENTUM_TIME = 0.25 // s — 놓을 때 속도로 이동 거리 예측
const RUBBER_BAND = 0.3
const MOBILE_QUERY = '(max-width: 640px)'
const MOBILE_FACTOR = 0.7
const SNAP_SPRING = { type: 'spring', stiffness: 260, damping: 30 } as const
const RECORD_TUCK_MS = 320
const WHEEL_THRESHOLD = 24
const WHEEL_GESTURE_GAP_MS = 180
const FALLBACK_ACCENT = '#737373'

type Layout = { near: number; far: number; maxRotation: number; visibleRange: number }

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/** 가운데에서 멀수록 간격이 좁아지는 부채꼴 배치: 첫 이웃은 near, 그 뒤로는 far씩 */
function railX(offset: number, layout: Layout) {
  const a = Math.abs(offset)
  const d = a <= 1 ? a * layout.near : layout.near + (a - 1) * layout.far
  return Math.sign(offset) * d
}

function rubberBand(p: number, max: number) {
  if (p < 0) return p * RUBBER_BAND
  if (p > max) return max + (p - max) * RUBBER_BAND
  return p
}

type Sample = { t: number; x: number }

function velocityOf(samples: Sample[], now: number) {
  const recent = samples.filter((s) => now - s.t <= 100)
  if (recent.length < 2) return 0
  const first = recent[0]
  const last = recent[recent.length - 1]
  const dt = last.t - first.t
  return dt > 0 ? ((last.x - first.x) / dt) * 1000 : 0
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  )
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setMatches(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])
  return matches
}

/** 커버 이미지에서 대표 색 뽑기 — 작게 줄여 그린 뒤 색을 묶어 세고, 채도 높은 색에 가중치 */
function dominantColor(img: HTMLImageElement): string | null {
  const size = 40
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  let data: Uint8ClampedArray
  try {
    ctx.drawImage(img, 0, 0, size, size)
    data = ctx.getImageData(0, 0, size, size).data
  } catch {
    return null // CORS로 캔버스가 막힌 경우
  }
  const bins = new Map<number, { w: number; r: number; g: number; b: number }>()
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const light = (max + min) / 510
    if (light < 0.1 || light > 0.9) continue
    const sat = max === min ? 0 : (max - min) / (255 - Math.abs(max + min - 255))
    // 흰·회색 배경(채도 낮음)은 건너뛰고 물체 색을 고름
    if (sat < 0.2) continue
    const w = sat * sat
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4)
    const bin = bins.get(key) ?? { w: 0, r: 0, g: 0, b: 0 }
    bin.w += w
    bin.r += r * w
    bin.g += g * w
    bin.b += b * w
    bins.set(key, bin)
  }
  let best: { w: number; r: number; g: number; b: number } | null = null
  for (const bin of bins.values()) if (!best || bin.w > best.w) best = bin
  if (!best) return null
  return `rgb(${Math.round(best.r / best.w)}, ${Math.round(best.g / best.w)}, ${Math.round(best.b / best.w)})`
}

/** accent가 없는 앨범만 커버에서 색을 뽑아 둠 */
function useExtractedAccents(albums: Album[]) {
  const [accents, setAccents] = useState<Record<string, string>>({})
  const key = albums.map((a) => `${a.id}\u0000${a.cover}\u0000${a.accent ?? ''}`).join('\u0001')
  const albumsRef = useRef(albums)
  albumsRef.current = albums

  useEffect(() => {
    let cancelled = false
    const images: HTMLImageElement[] = []
    for (const album of albumsRef.current) {
      if (album.accent) continue
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.decoding = 'async'
      img.onload = () => {
        if (cancelled) return
        const color = dominantColor(img)
        if (color) setAccents((prev) => (prev[album.id] === color ? prev : { ...prev, [album.id]: color }))
      }
      img.src = album.cover
      images.push(img)
    }
    return () => {
      cancelled = true
      for (const img of images) img.onload = null
    }
  }, [key])

  return accents
}

type HoverProps = {
  onPointerEnter: (e: ReactPointerEvent<HTMLElement>) => void
  onPointerLeave: (e: ReactPointerEvent<HTMLElement>) => void
}

type RailCardProps = {
  album: Album
  index: number
  position: MotionValue<number>
  tilt: MotionValue<number>
  layout: MotionValue<Layout>
  isActive: boolean
  recordOut: boolean
  tuckedItem?: ReactNode
  hoverProps?: HoverProps
  total: number
}

function RailCard({
  album,
  index,
  position,
  tilt,
  layout,
  isActive,
  recordOut,
  tuckedItem,
  hoverProps,
  total,
}: RailCardProps) {
  // 모든 값은 position(연속 실수) 하나에서 계산 — 프레임마다 React 렌더 없음
  // useTransform(() => …) 은 안에서 .get() 한 motion value를 자동으로 따라감
  const transform = useTransform(() => {
    const L = layout.get()
    const offset = index - position.get()
    const a = Math.abs(offset)
    const x = railX(offset, L)
    const rotate =
      clamp(-offset * ROTATE_PER_STEP, -L.maxRotation, L.maxRotation) + tilt.get() * Math.max(0, 1 - a)
    const z = -a * DEPTH_PER_STEP
    const scale = 1 - Math.min(a * SCALE_PER_STEP, MAX_SCALE_LOSS)
    return `translateX(${x}px) translateZ(${z}px) rotateY(${rotate}deg) scale(${scale})`
  })
  const zIndex = useTransform(position, (p: number) => 1000 - Math.round(Math.abs(index - p) * 10))
  const opacity = useTransform(() => {
    const { visibleRange } = layout.get()
    const a = Math.abs(index - position.get())
    const fadeStart = visibleRange - 1.5
    return 1 - clamp((a - fadeStart) / (visibleRange - fadeStart), 0, 1)
  })
  const visibility = useTransform(opacity, (o: number) => (o <= 0.001 ? 'hidden' : 'visible'))
  const shade = useTransform(position, (p: number) => Math.min(Math.abs(index - p) * 0.22, 0.55))

  return (
    <motion.div
      className="album-rail__card"
      data-index={index}
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} / ${total}: ${album.title}`}
      aria-hidden={!isActive}
      style={{ transform, zIndex, opacity, visibility }}
      {...hoverProps}
    >
      <div
        className={`album-rail__record${tuckedItem ? ' album-rail__record--custom' : ''}${recordOut ? ' is-out' : ''}`}
        aria-hidden="true"
      >
        {tuckedItem ? <div className="album-rail__record-item">{tuckedItem}</div> : <div className="album-rail__record-disc" />}
      </div>
      <div className="album-rail__sleeve">
        <img src={album.cover} alt={`${album.title} 커버`} draggable={false} />
        <motion.div className="album-rail__shade" style={{ opacity: shade }} />
      </div>
    </motion.div>
  )
}

const ChevronLeft = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const ChevronRight = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" fill="currentColor" />
  </svg>
)
const PauseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" />
    <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" />
  </svg>
)

export default function AlbumRail({
  albums,
  cardSize,
  spacing = 150,
  maxRotation = 65,
  visibleRange = 6,
  initialIndex = 0,
  onChange,
  onSelect,
  playIcon,
  tuckedItem,
  tuckedName = '레코드',
  className,
  'aria-label': ariaLabel = '앨범 캐러셀',
}: AlbumRailProps) {
  const count = albums.length
  const maxIndex = Math.max(0, count - 1)
  const reduced = useReducedMotion() ?? false
  const isMobile = useMediaQuery(MOBILE_QUERY)
  const factor = isMobile ? MOBILE_FACTOR : 1
  const startIndex = clamp(Math.round(initialIndex), 0, maxIndex)

  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  // 위치: 인덱스 단위 연속값 (드래그 중에는 1.37 같은 값)
  const position = useMotionValue(startIndex)
  const tiltTarget = useMotionValue(0)
  const tilt = useSpring(tiltTarget, { stiffness: 220, damping: 22 })
  const stageFade = useMotionValue(1)
  const makeLayout = (): Layout => ({
    near: spacing * factor,
    far: spacing * OUTER_SPACING_RATIO * factor,
    maxRotation,
    visibleRange,
  })
  const layout = useMotionValue<Layout>(makeLayout())
  useEffect(() => {
    layout.set(makeLayout())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spacing, factor, maxRotation, visibleRange])

  // 진행 막대: 지금 몇 번째인지 (1번째 = 1/n, 마지막 = 가득). 드래그 중에도 연속으로 따라감
  const countRef = useRef(count)
  countRef.current = count
  const progress = useTransform(position, (p: number) => clamp((p + 1) / Math.max(1, countRef.current), 0, 1))

  const [active, setActive] = useState(startIndex)
  const [playing, setPlaying] = useState(false)
  const [dragging, setDragging] = useState(false)
  const accents = useExtractedAccents(albums)

  const playingRef = useRef(false)
  const targetRef = useRef(startIndex) // 마지막으로 요청된 목표 인덱스 (연속 입력 누적용)
  const animRef = useRef<AnimationPlaybackControls | null>(null)
  const tuckTimer = useRef<number | undefined>(undefined)
  const drag = useRef<{
    id: number
    startX: number
    startPos: number
    moved: boolean
    samples: Sample[]
    cardIndex: number | null
  } | null>(null)

  const setPlay = (value: boolean) => {
    playingRef.current = value
    setPlaying(value)
  }

  // 마우스를 가운데 카드나 버튼에 올리면 잠깐 꺼내 보여 주기 (누르면 고정)
  const [peek, setPeekState] = useState(false)
  const peekRef = useRef(false)
  const peekTimer = useRef<number | undefined>(undefined)
  const peekBlocked = useRef(false) // 버튼으로 막 넣었을 때는 마우스가 떠날 때까지 다시 안 나옴
  const clearPeek = () => {
    window.clearTimeout(peekTimer.current)
    peekRef.current = false
    setPeekState(false)
  }
  const setPeek = (value: boolean) => {
    window.clearTimeout(peekTimer.current)
    if (value) {
      if (peekBlocked.current || drag.current) return
      peekRef.current = true
      setPeekState(true)
    } else {
      // 카드 → 버튼처럼 옮겨 갈 때 깜빡이지 않게 살짝 기다림
      peekTimer.current = window.setTimeout(clearPeek, 120)
    }
  }
  const hoverProps: HoverProps = {
    onPointerEnter: (e) => {
      if (e.pointerType === 'mouse') setPeek(true)
    },
    onPointerLeave: (e) => {
      if (e.pointerType !== 'mouse') return
      peekBlocked.current = false
      setPeek(false)
    },
  }

  // 인덱스가 바뀔 때만 React 렌더
  useMotionValueEvent(position, 'change', (v) => {
    setActive(clamp(Math.round(v), 0, maxIndex))
  })

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const album = albums[active]
    if (album) onChangeRef.current?.(active, album)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  // 앨범 수가 줄어들면 범위 안으로
  useEffect(() => {
    if (position.get() > maxIndex) {
      position.set(maxIndex)
      targetRef.current = maxIndex
    }
  }, [maxIndex, position])

  useEffect(
    () => () => {
      animRef.current?.stop()
      window.clearTimeout(tuckTimer.current)
      window.clearTimeout(peekTimer.current)
    },
    [],
  )

  const stopAnimation = () => {
    animRef.current?.stop()
    animRef.current = null
  }

  const settle = (target: number, velocity = 0) => {
    stopAnimation()
    targetRef.current = target
    if (reduced) {
      // 동작 줄이기: 튕김·관성 없이 바로 옮기고 살짝 페이드
      const moved = Math.round(position.get()) !== target
      position.set(target)
      if (moved) animRef.current = animate(stageFade, [0.4, 1], { duration: 0.25, ease: 'easeOut' })
      return
    }
    animRef.current = animate(position, target, { ...SNAP_SPRING, velocity })
  }

  const goTo = (index: number) => {
    const target = clamp(index, 0, maxIndex)
    window.clearTimeout(tuckTimer.current)
    targetRef.current = target
    // 레코드가 나와 있으면 먼저 집어넣고 이동
    if ((playingRef.current || peekRef.current) && target !== Math.round(position.get())) {
      setPlay(false)
      clearPeek()
      if (!reduced) {
        tuckTimer.current = window.setTimeout(() => settle(target), RECORD_TUCK_MS)
        return
      }
    }
    settle(target)
  }

  const step = (dir: number) => goTo(targetRef.current + dir)
  const stepRef = useRef(step)
  stepRef.current = step
  const maxIndexRef = useRef(maxIndex)
  maxIndexRef.current = maxIndex

  // 휠 / 트랙패드: 한 제스처에 한 칸 (이벤트가 잠깐 끊겨야 다음 제스처로 인정 — 관성 스크롤 흡수)
  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    let locked = false
    let acc = 0
    let timer: number | undefined
    const onWheel = (e: WheelEvent) => {
      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY)
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1
      const delta = (horizontal ? e.deltaX : e.deltaY) * unit
      if (delta === 0) return
      // 세로 휠은 양 끝에서 더 갈 곳이 없으면 페이지 스크롤에 양보
      const next = targetRef.current + Math.sign(delta)
      if (!horizontal && !locked && (next < 0 || next > maxIndexRef.current)) return
      e.preventDefault()
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        locked = false
        acc = 0
      }, WHEEL_GESTURE_GAP_MS)
      if (locked) return
      acc += delta
      if (Math.abs(acc) >= WHEEL_THRESHOLD) {
        locked = true
        acc = 0
        stepRef.current(Math.sign(delta))
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', onWheel)
      window.clearTimeout(timer)
    }
  }, [])

  // ---------- 드래그 (마우스 + 터치) ----------
  const pxPerItem = PX_PER_ITEM * factor

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || count === 0) return
    stopAnimation()
    window.clearTimeout(tuckTimer.current)
    rootRef.current?.focus({ preventScroll: true })
    const cardEl = (e.target as HTMLElement).closest<HTMLElement>('[data-index]')
    drag.current = {
      id: e.pointerId,
      startX: e.clientX,
      startPos: position.get(),
      moved: false,
      samples: [{ t: e.timeStamp, x: e.clientX }],
      cardIndex: cardEl ? Number(cardEl.dataset.index) : null,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || e.pointerId !== d.id) return
    if (!d.moved) {
      if (Math.abs(e.clientX - d.startX) < 5) return
      d.moved = true
      d.startX = e.clientX // 문턱만큼 튀지 않게 여기서부터 계산
      setDragging(true)
      if (playingRef.current) setPlay(false)
      clearPeek()
    }
    position.set(rubberBand(d.startPos - (e.clientX - d.startX) / pxPerItem, maxIndex))
    d.samples.push({ t: e.timeStamp, x: e.clientX })
    if (d.samples.length > 20) d.samples.shift()
    if (!reduced) {
      const v = velocityOf(d.samples, e.timeStamp)
      tiltTarget.set(clamp((v / TILT_FULL_VELOCITY) * MAX_TILT, -MAX_TILT, MAX_TILT))
    }
  }

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || e.pointerId !== d.id) return
    drag.current = null
    tiltTarget.set(0)

    if (!d.moved) {
      const p = position.get()
      const clicked = e.type === 'pointerup' ? d.cardIndex : null
      // 멈춰 있는 가운데 카드를 클릭 → onSelect
      if (clicked !== null && onSelect && Math.abs(p - clicked) < 0.05) {
        position.set(clicked)
        onSelect(albums[clicked], clicked)
        return
      }
      // 옆 카드면 가운데로, 아니면 하던 이동 마무리
      goTo(clicked ?? Math.round(p))
      return
    }

    setDragging(false)
    const vIdx = reduced ? 0 : -velocityOf(d.samples, e.timeStamp) / pxPerItem
    const projected = position.get() + vIdx * MOMENTUM_TIME
    settle(clamp(Math.round(projected), 0, maxIndex), vIdx)
  }

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      step(-1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      step(1)
    } else if (e.key === 'Enter' && onSelect && e.target === e.currentTarget) {
      e.preventDefault()
      const index = clamp(targetRef.current, 0, maxIndex)
      onSelect(albums[index], index)
    }
  }

  const togglePlay = () => {
    if (playingRef.current) {
      setPlay(false)
      clearPeek()
      peekBlocked.current = true
    } else {
      setPlay(true)
    }
  }

  if (count === 0) return null

  const current = albums[active] ?? albums[0]
  const accent = current.accent ?? accents[current.id] ?? FALLBACK_ACCENT
  const rootStyle = {
    '--accent': accent,
    ...(cardSize !== undefined && {
      '--card-size-base': typeof cardSize === 'number' ? `${cardSize}px` : cardSize,
    }),
  } as CSSProperties

  return (
    <div
      ref={rootRef}
      className={`album-rail${onSelect ? ' has-select' : ''}${className ? ` ${className}` : ''}`}
      style={rootStyle}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <motion.div
        ref={stageRef}
        className={`album-rail__stage${dragging ? ' is-dragging' : ''}`}
        style={{ opacity: stageFade }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {albums.map((album, i) => (
          <RailCard
            key={album.id}
            album={album}
            index={i}
            total={count}
            position={position}
            tilt={tilt}
            layout={layout}
            isActive={i === active}
            recordOut={i === active && (playing || peek)}
            hoverProps={i === active ? hoverProps : undefined}
            tuckedItem={typeof tuckedItem === 'function' ? tuckedItem(album, i) : tuckedItem}
          />
        ))}
      </motion.div>

      <motion.div
        className="album-rail__info"
        aria-live="polite"
        animate={{ opacity: dragging ? 0.3 : 1 }}
        transition={{ duration: 0.2 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: reduced ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <p className="album-rail__title">{current.title}</p>
            <p className="album-rail__artist">{current.artist}</p>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <div className="album-rail__controls">
        <button
          type="button"
          className="album-rail__arrow"
          aria-label="이전 앨범"
          disabled={active === 0}
          onClick={() => step(-1)}
        >
          <ChevronLeft />
        </button>

        <div className="album-rail__ruler">
          <div className="album-rail__progress" aria-hidden="true">
            <motion.div className="album-rail__progress-fill" style={{ scaleX: progress }} />
          </div>
          <button
            type="button"
            className="album-rail__play"
            aria-label={`${current.title} ${tuckedName} ${playing ? '넣기' : '꺼내기'}`}
            aria-pressed={playing}
            onClick={togglePlay}
            {...hoverProps}
          >
            <span className="album-rail__play-face">{playIcon ?? (playing ? <PauseIcon /> : <PlayIcon />)}</span>
          </button>
        </div>

        <button
          type="button"
          className="album-rail__arrow"
          aria-label="다음 앨범"
          disabled={active === maxIndex}
          onClick={() => step(1)}
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  )
}
