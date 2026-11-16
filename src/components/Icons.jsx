// 디자인 시스템 아이콘 — 24px 선 아이콘, 선 굵기 2, 끝 둥글게. 색은 글자색을 따라감.

export function ArrowRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function ArrowLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  )
}

// 털실 뭉치 = "인형 사진이 들어갈 자리"
export function YarnBall() {
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="20" cy="20" r="13" />
      <path d="M8 15h24M7 20h26M8 25h24M12 30.5c6 1 12 1 16-1" />
      <path d="M31 27c3 2 5 2 6 0" />
    </svg>
  )
}

// 임시 로고 마크 (실제 로고는 4단계에서 교체)
export function LogoMark() {
  return (
    <svg className="logo__mark" viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="14" fill="currentColor" />
      <path d="M8 15h24M7 20h26M9 25h22" stroke="#fffef3" strokeWidth="1.6" fill="none" />
      <path d="M30 29c3 2 6 2 8-1" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  )
}
