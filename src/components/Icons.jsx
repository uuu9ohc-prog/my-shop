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

// 검색 (돋보기)
export function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15l4.5 4.5" />
    </svg>
  )
}

// 좋아요 (하트)
export function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 19.5s-7-4.3-7-9.4A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.1c0 5.1-7 9.4-7 9.4z" />
    </svg>
  )
}

// 장바구니 (쇼핑백)
export function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      <path d="M6 8.5h12l-.8 11H6.8z" />
      <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" />
    </svg>
  )
}

// 메뉴 (줄 세 개)
export function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M5 8h14M5 12h14M5 16h14" />
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
