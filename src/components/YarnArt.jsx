import { COLORS } from '../data/options.js'

// 털실 뭉치 일러스트 (4단계 에셋) + 움직임 (5단계, CSS: site.css '털실 움직임')
// P0 쌓임 → P4 뽑힘이 같은 뭉치 그림으로 이어지는 연출

const hex = (id) => COLORS.find((c) => c.id === id)?.hex

// 털실 뭉치 하나 — 감긴 실 무늬 + (선택) 풀려 나오는 실
function Ball({ cx, cy, r, color, strand = false, order }) {
  return (
    <g className="yarn-ball" style={order != null ? { '--i': order } : undefined}>
      {strand && (
        <path
          className="yarn-strand"
          d={`M${cx + r * 0.7} ${cy + r * 0.6} C ${cx + r * 1.6} ${cy + r * 1.4}, ${cx + r * 2.2} ${cy - r * 0.2}, ${cx + r * 3.2} ${cy + r * 0.5}`}
          stroke={color}
          strokeWidth={r * 0.12}
          strokeLinecap="round"
          fill="none"
        />
      )}
      <g className="yarn-ball__body" style={{ transformOrigin: `${cx}px ${cy}px` }}>
        <circle cx={cx} cy={cy} r={r} fill={color} />
        <g stroke="rgba(0,0,0,.14)" strokeWidth={r * 0.06} fill="none" strokeLinecap="round">
          <path
            d={`M${cx - r * 0.9} ${cy - r * 0.2} Q${cx} ${cy - r * 0.9} ${cx + r * 0.9} ${cy - r * 0.3}`}
          />
          <path
            d={`M${cx - r * 0.95} ${cy + r * 0.15} Q${cx} ${cy - r * 0.5} ${cx + r * 0.95} ${cy + r * 0.05}`}
          />
          <path
            d={`M${cx - r * 0.85} ${cy + r * 0.5} Q${cx} ${cy - r * 0.1} ${cx + r * 0.85} ${cy + r * 0.45}`}
          />
          <path
            d={`M${cx - r * 0.3} ${cy - r * 0.95} Q${cx + r * 0.6} ${cy} ${cx - r * 0.1} ${cy + r * 0.98}`}
          />
        </g>
        <g stroke="rgba(255,255,255,.35)" strokeWidth={r * 0.04} fill="none" strokeLinecap="round">
          <path
            d={`M${cx - r * 0.7} ${cy - r * 0.45} Q${cx - r * 0.1} ${cy - r * 0.95} ${cx + r * 0.6} ${cy - r * 0.65}`}
          />
        </g>
      </g>
    </g>
  )
}

// P0 — 털실이 소복이 쌓인 모습
export function YarnPile({ className = '' }) {
  return (
    <svg className={`yarn-art yarn-art--pile ${className}`} viewBox="0 0 280 240" aria-hidden="true">
      <ellipse cx="140" cy="218" rx="118" ry="10" fill="rgba(46,42,38,.06)" />
      <Ball cx={70} cy={176} order={0} r={42} color={hex('pink')} />
      <Ball cx={150} cy={180} order={1} r={40} color={hex('yellow')} />
      <Ball cx={222} cy={182} order={2} r={36} color={hex('blue')} />
      <Ball cx={108} cy={112} order={3} r={38} color={hex('green')} />
      <Ball cx={184} cy={118} order={4} r={36} color={hex('red')} />
      <Ball cx={146} cy={56} order={5} r={32} color={hex('white')} />
    </svg>
  )
}

// P4 · P7 — 고른 털실이 뽑혀 나오는 모습
export function YarnPull({ colorId, className = '' }) {
  return (
    <svg className={`yarn-art yarn-art--pull ${className}`} viewBox="0 0 280 200" aria-hidden="true">
      <ellipse cx="80" cy="176" rx="64" ry="8" fill="rgba(46,42,38,.06)" />
      <Ball cx={80} cy={110} r={60} color={hex(colorId) ?? hex('pink')} strand />
    </svg>
  )
}
