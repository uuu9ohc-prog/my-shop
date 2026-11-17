import { useId } from 'react'

/*
  인형 색 실타래 (디자인 둘러보기 — 슬리브 옆으로 빠져나오는 그림)
  colors[0] = 몸통(가장 큰 뭉치), 나머지 = 귀·발·부리 같은 포인트 색
  사진처럼 보이도록: 두꺼운 털실 가닥(꼬임 결) + 공 모양 음영 + 바닥 그림자
  + 반쯤 풀려 바닥에 놓인 실(짧게 잘린 끝은 올이 풀림)
  외부 사진은 쓰지 않고 SVG로 직접 그림 — 색만 바꿔 인형마다 다르게
*/

function mix(hex, target, amount) {
  const n = parseInt(hex.slice(1), 16)
  const t = target === 'white' ? 255 : 0
  const ch = (shift) => Math.round(((n >> shift) & 255) * (1 - amount) + t * amount)
  return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`
}

/** 털실 한 가닥: 테두리 그늘 → 바탕 → 꼬임 결 → 윗면 빛 */
function Strand({ d, w, tone, transform }) {
  return (
    <g transform={transform} fill="none" strokeLinecap="round">
      <path d={d} stroke={tone.deep} strokeWidth={w} />
      <path d={d} stroke={tone.base} strokeWidth={w * 0.78} />
      <path d={d} stroke={tone.deep} strokeWidth={w * 0.62} strokeDasharray={`${w * 0.16} ${w * 0.38}`} opacity="0.45" />
      <path
        d={d}
        stroke={tone.light}
        strokeWidth={w * 0.22}
        strokeDasharray={`${w * 0.3} ${w * 0.24}`}
        opacity="0.75"
        transform={`translate(0 ${-w * 0.16})`}
      />
    </g>
  )
}

/** 공 둘레를 감은 실 한 묶음 — 앞쪽 반원만 그려서 실제로 감긴 것처럼 */
function Band({ r, angle, tone, count, w, flip = false }) {
  const arcs = []
  for (let i = 0; i < count; i++) {
    const ry = r * (0.08 + (0.9 * i) / Math.max(1, count - 1))
    const sweep = flip ? 1 : 0
    arcs.push(<Strand key={i} d={`M${-r} 0 A${r} ${ry} 0 0 ${sweep} ${r} 0`} w={w} tone={tone} />)
  }
  return <g transform={`rotate(${angle})`}>{arcs}</g>
}

function Ball({ id, cx, cy, r, tone }) {
  const w = r * 0.13 // 굵은 털실
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <defs>
        <clipPath id={`${id}-clip`}>
          <circle r={r} />
        </clipPath>
        {/* 공 모양 음영: 가장자리 어둡게 */}
        <radialGradient id={`${id}-shade`} cx="0.4" cy="0.36" r="0.7">
          <stop offset="0.45" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#1e140f" stopOpacity="0.38" />
        </radialGradient>
        <radialGradient id={`${id}-shine`} cx="0.34" cy="0.28" r="0.42">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* 실 사이 틈 (안쪽 실) */}
      <circle r={r} fill={tone.deep} />
      <g clipPath={`url(#${id}-clip)`}>
        <Band r={r * 1.02} angle={-100} tone={tone} count={8} w={w} flip />
        <Band r={r * 1.02} angle={-35} tone={tone} count={9} w={w} />
        <Band r={r * 1.02} angle={58} tone={tone} count={7} w={w} flip />
        <Band r={r * 1.02} angle={10} tone={tone} count={4} w={w} />
      </g>
      <circle r={r} fill={`url(#${id}-shade)`} />
      <circle r={r} fill={`url(#${id}-shine)`} />
    </g>
  )
}

/** 짧게 잘린 실 끝 — 올이 몇 가닥 풀림 */
function Frayed({ x, y, angle, tone, w }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`} stroke={tone.base} strokeLinecap="round" fill="none">
      <path d={`M0 0 L${w * 1.1} ${-w * 0.35}`} strokeWidth={w * 0.22} />
      <path d={`M0 0 L${w * 1.25} ${w * 0.05}`} strokeWidth={w * 0.2} />
      <path d={`M0 0 L${w * 1.0} ${w * 0.4}`} strokeWidth={w * 0.2} />
    </g>
  )
}

const toneOf = (hex) => ({
  base: hex,
  deep: mix(hex, 'black', 0.3),
  light: mix(hex, 'white', 0.5),
})

export default function YarnBalls({ colors }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const [main, second, third] = colors.map(toneOf)
  const mw = 46 * 0.13
  const sw = 30 * 0.13

  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <defs>
        <filter id={`${uid}-soft`} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        {/* 털실 보풀 */}
        <filter id={`${uid}-fuzz`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" seed="5" />
          <feDisplacementMap in="SourceGraphic" scale="1.2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>

      {/* 슬리브에서 반쯤 빠져나오므로 오른쪽 절반에 모아 둠 */}
      {/* 바닥 그림자 */}
      <g fill="#2b1d16" filter={`url(#${uid}-soft)`}>
        <ellipse cx="152" cy="140" rx="40" ry="6" opacity="0.18" />
        <ellipse cx="138" cy="186" rx="30" ry="5" opacity="0.22" />
        {third && <ellipse cx="184" cy="184" rx="15" ry="3.5" opacity="0.2" />}
      </g>

      <g filter={`url(#${uid}-fuzz)`}>
        {/* 큰 공에서 풀려 내려와 바닥에 놓인 실 (짧게 잘림) */}
        <Strand d="M118 116 C104 134 112 158 100 176 C94 186 104 192 116 190" w={mw} tone={main} />
        <Frayed x={116} y={190} angle={-8} tone={main} w={mw} />

        <Ball id={`${uid}-1`} cx={150} cy={92} r={46} tone={main} />

        {third && <Ball id={`${uid}-3`} cx={184} cy={170} r={15} tone={third} />}

        {second && (
          <>
            {/* 작은 공에서 풀려 오른쪽 바닥으로 */}
            <Strand d="M158 168 C170 186 160 194 176 194 C184 194 190 190 196 192" w={sw} tone={second} />
            <Frayed x={196} y={192} angle={8} tone={second} w={sw} />
            <Ball id={`${uid}-2`} cx={136} cy={156} r={30} tone={second} />
          </>
        )}
      </g>
    </svg>
  )
}
