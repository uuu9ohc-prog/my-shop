import DollArt from './DollArt.jsx'
import { getColor } from '../data/options.js'

// 인형 이미지 — 디자인별 파스텔 바탕 위에 SVG 인형.
// yarnId 를 주면 털실 질감까지 반영 (P5·P6·OV-01 최종 이미지)
// showParts: 부위별 고른 색 목록을 함께 보여 줌 (P3 미리보기)
export default function DollPreview({ design, colors, yarnId, label, showParts = false, className = '' }) {
  return (
    <figure className={`doll doll--${design.tone} ${className}`} role="img" aria-label={label}>
      <DollArt design={design} colors={colors} yarnId={yarnId} />
      {showParts && (
        <ul className="doll__parts" aria-hidden="true">
          {design.parts.map((part, i) => {
            const color = getColor(colors[i])
            return (
              <li key={part}>
                <span
                  className={`swatch ${color ? '' : 'swatch--empty'}`}
                  style={color ? { background: color.hex } : undefined}
                />
                {part} · {color?.name ?? '고르지 않음'}
              </li>
            )
          })}
        </ul>
      )}
    </figure>
  )
}
