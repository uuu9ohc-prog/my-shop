import { YarnBall } from './Icons.jsx'

// 이미지 자리 — 옅은 파스텔 블록 + 털실 뭉치 아이콘 + 라벨.
// tone: 'pink' | 'sky' | 'peach' (없으면 pink-100)
// knit: 뜨개 모양 틀(KnitFrame) — 한 화면에 한두 번만
// 실제 이미지는 4단계 에셋 삽입에서 교체합니다.
export default function Placeholder({ label, tone, knit = false, className = '', children }) {
  const classes = ['placeholder', tone && `placeholder--${tone}`, knit && 'placeholder--knit', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} role="img" aria-label={label}>
      {children ?? (
        <>
          <YarnBall />
          <span className="placeholder__label">{label}</span>
        </>
      )}
    </div>
  )
}
