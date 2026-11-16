import { useEffect, useId, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BagIcon, HeartIcon, LogoMark, MenuIcon, SearchIcon } from './Icons.jsx'

// 헤더 아이콘 — 모양만 있고 기능 없음 (2026-11-16 답변, 기능은 [미정])
const PLAIN_ICONS = [
  { label: '검색', Icon: SearchIcon },
  { label: '좋아요', Icon: HeartIcon },
  { label: '장바구니', Icon: BagIcon },
]

// 메뉴 창 — 첫 화면(P1)의 각 구역으로 이동 (2026-11-16 답변)
const MENU_LINKS = [
  { to: '/home#browse', label: '디자인 둘러보기' }, // S1-2
  { to: '/home#steps', label: '이렇게 만들어져요' }, // S1-3
  { to: '/home#reviews', label: '사진 후기' }, // S1-4 사용 예시 사진
]

// 공통 GNB 헤더 — P1, P2, P3, P5, P6, P7
// 오른쪽 원형 메뉴 버튼: Figma 91:37 (2026-11-16 답변: 검색·찜·장바구니는 넣지 않음)
export default function Header() {
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const wrapRef = useRef(null)
  const buttonRef = useRef(null)
  const location = useLocation()

  // 페이지를 옮기면 닫기
  useEffect(() => {
    setOpen(false)
  }, [location.pathname, location.hash])

  // 바깥을 누르거나 Esc를 누르면 닫기
  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // 이미 같은 주소(#구역)에 있으면 주소가 바뀌지 않아 이동이 일어나지 않으므로 직접 스크롤
  const goToSection = (to) => {
    setOpen(false)
    if (location.pathname + location.hash !== to) return
    const target = document.getElementById(to.split('#')[1])
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        {/* M-01 로고 → P1 (로고 이미지는 임시 마크) */}
        <Link to="/home" className="logo" aria-label="손뜬 스튜디오 첫 화면">
          <LogoMark />
          손뜬 스튜디오
        </Link>
        <div className="site-header__actions" ref={wrapRef}>
          {PLAIN_ICONS.map(({ label, Icon }) => (
            <button key={label} type="button" className="header-icon" aria-label={label}>
              <Icon />
            </button>
          ))}
          <button
            ref={buttonRef}
            type="button"
            className="icon-btn"
            aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((v) => !v)}
          >
            <MenuIcon />
          </button>
          {open && (
            <nav id={menuId} className="menu-panel" aria-label="전체 메뉴">
              <ul>
                {MENU_LINKS.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} onClick={() => goToSection(item.to)}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>
    </header>
  )
}
