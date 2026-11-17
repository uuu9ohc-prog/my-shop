import { useId } from 'react'
import PhotoDoll, { PHOTO_DOLLS } from './PhotoDoll.jsx'
import DollArt from './DollArt.jsx'
import { Ball, Frayed, Strand, mix } from './YarnBalls.jsx'
import { getColor } from '../data/options.js'

/*
  P7 S7-2 — 털실이 쌓인 바구니 안에 고른 인형이 함께 있는 장면 (2026-11-17)
  층: 바구니 안쪽 + 뒤에 쌓인 털실 → 인형 사진(고른 색) → 바구니 앞면(엮은 무늬)
  털실 색은 고른 인형 색(바탕·포인트) + 어울리는 파스텔
  세 층 모두 viewBox 400×300, 컨테이너도 4:3 이라 정확히 겹침
*/

// 밝은 꿀색 라탄 — 어두운 부분도 밝게, 명암 차이는 아주 약간만 (2026-11-17 답변)
const W = { base: '#f0d4a8', deep: '#e3c08f', light: '#f9e8cb', dark: '#dfb985', inside: '#d2aa78' }

// 바구니 앞면: 윗변(테두리 아래) → 아래로 살짝 좁아지는 몸통
const FRONT = 'M52 176 Q200 214 348 176 L330 268 Q200 296 70 268 Z'
const ROWS = [190, 204, 218, 232, 246, 260, 274]

// 파스텔 털실 색: 고른 색을 흰색과 섞어 밝게, 그늘·결도 옅게
const pastelTone = (hex) => {
  const base = mix(hex, 'white', 0.3)
  const n = (c) => c.match(/\d+/g).map(Number)
  const toHex = (rgb) => '#' + n(rgb).map((v) => v.toString(16).padStart(2, '0')).join('')
  const b = toHex(base)
  return { base: b, deep: mix(b, 'black', 0.1), light: mix(b, 'white', 0.55) }
}
const SHADE = 0.14

function FuzzFilter({ id, seed }) {
  return (
    <filter id={id} x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed={seed} />
      <feDisplacementMap in="SourceGraphic" scale="1.2" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  )
}

function WickerFront({ uid }) {
  return (
    <>
      <defs>
        <clipPath id={`${uid}-front`}>
          <path d={FRONT} />
        </clipPath>
        <linearGradient id={`${uid}-shade`} x1="0" x2="1">
          <stop offset="0" stopColor="#7a5230" stopOpacity="0.05" />
          <stop offset="0.25" stopColor="#000" stopOpacity="0" />
          <stop offset="0.75" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#7a5230" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <ellipse cx="200" cy="286" rx="150" ry="9" fill="#2b1d16" opacity="0.08" />
      <path d={FRONT} fill={W.base} />
      <g clipPath={`url(#${uid}-front)`}>
        {/* 세로 살 */}
        {Array.from({ length: 21 }, (_, i) => {
          const x = 46 + i * 15.5
          return (
            <path
              key={`v${i}`}
              d={`M${x} 170 Q${200 + (x - 200) * 0.9} 230 ${200 + (x - 200) * 0.86} 300`}
              stroke={W.deep}
              strokeWidth="2.2"
              fill="none"
              opacity="0.25"
            />
          )
        })}
        {/* 가로로 엮은 띠 — 줄마다 엇갈린 무늬 */}
        {ROWS.map((y, r) => (
          <g key={`h${r}`}>
            <path d={`M40 ${y} Q200 ${y + 34} 360 ${y}`} stroke={W.deep} strokeWidth="13" fill="none" />
            <path
              d={`M40 ${y} Q200 ${y + 34} 360 ${y}`}
              stroke={W.light}
              strokeWidth="10"
              strokeDasharray="13 18"
              strokeDashoffset={r % 2 ? 15 : 0}
              strokeLinecap="round"
              fill="none"
            />
            <path
              d={`M40 ${y - 2} Q200 ${y + 32} 360 ${y - 2}`}
              stroke="#fff"
              strokeWidth="2"
              strokeDasharray="8 23"
              strokeDashoffset={r % 2 ? 12 : -3}
              strokeLinecap="round"
              fill="none"
              opacity="0.35"
            />
          </g>
        ))}
        <rect x="0" y="160" width="400" height="140" fill={`url(#${uid}-shade)`} />
      </g>
      {/* 앞쪽 테두리 (꼰 줄) */}
      <path d="M48 176 Q200 216 352 176" stroke={W.dark} strokeWidth="14" fill="none" strokeLinecap="round" />
      <path
        d="M48 176 Q200 216 352 176"
        stroke={W.light}
        strokeWidth="9"
        strokeDasharray="9 7"
        fill="none"
        strokeLinecap="round"
      />
    </>
  )
}

export default function BasketScene({ design, colors, label }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const pick = (i, fallback) => getColor(colors?.[i])?.hex ?? fallback
  // 바구니 속 털실: 인형 바탕색 · 포인트색 + 파스텔 — 모두 밝은 파스텔 톤으로 (2026-11-17 답변)
  const yarn = [pick(0, '#f4c2c8'), pick(2, '#a9c8e8'), '#f3e09c', '#b9d8b0'].map(pastelTone)

  return (
    <figure className="basket-scene" role="img" aria-label={label}>
      {/* 바구니 안쪽 + 뒤에 쌓인 털실 */}
      <svg className="basket-scene__layer" viewBox="0 0 400 300" aria-hidden="true">
        <defs>
          <FuzzFilter id={`${uid}-fuzz`} seed="7" />
        </defs>
        <ellipse cx="200" cy="176" rx="152" ry="30" fill={W.dark} />
        <ellipse cx="200" cy="180" rx="140" ry="22" fill={W.inside} />
        <g filter={`url(#${uid}-fuzz)`}>
          <Ball id={`${uid}-b1`} cx={96} cy={150} r={40} tone={yarn[0]} shade={SHADE} />
          <Ball id={`${uid}-b2`} cx={306} cy={148} r={42} tone={yarn[1]} shade={SHADE} />
          <Ball id={`${uid}-b3`} cx={140} cy={170} r={30} tone={yarn[2]} shade={SHADE} />
          <Ball id={`${uid}-b4`} cx={262} cy={172} r={30} tone={yarn[3]} shade={SHADE} />
        </g>
      </svg>

      {/* 고른 인형 (사진 인형, 없으면 일러스트) */}
      <div className="basket-scene__doll">
        {PHOTO_DOLLS[design.id] ? (
          <PhotoDoll design={design} colors={colors} />
        ) : (
          <DollArt design={design} colors={colors} />
        )}
      </div>

      {/* 바구니 앞면 + 바구니 밖으로 굴러 나온 털실 */}
      <svg className="basket-scene__layer" viewBox="0 0 400 300" aria-hidden="true">
        <defs>
          <FuzzFilter id={`${uid}-fuzz2`} seed="3" />
        </defs>
        <WickerFront uid={uid} />
        <g filter={`url(#${uid}-fuzz2)`}>
          <Strand d="M346 262 C356 276 340 284 358 290 C368 293 378 290 386 292" w={3} tone={yarn[0]} />
          <Frayed x={386} y={292} angle={6} tone={yarn[0]} w={3} />
          <Ball id={`${uid}-b5`} cx={352} cy={270} r={20} tone={yarn[0]} shade={SHADE} />
        </g>
      </svg>
    </figure>
  )
}
