import { Link, NavLink } from 'react-router-dom'
import { LogoMark } from './Icons.jsx'

// 공통 GNB 헤더 — P1, P2, P3, P5, P6, P7
export default function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        {/* M-01 로고 → P1 (로고 이미지는 4단계에서 교체) */}
        <Link to="/home" className="logo" aria-label="손뜬 스튜디오 첫 화면">
          <LogoMark />
          손뜬 스튜디오
        </Link>
        <nav className="site-header__nav" aria-label="주 메뉴">
          {/* M-02 디자인 → P2 */}
          <NavLink to="/designs">디자인</NavLink>
        </nav>
        <span aria-hidden="true" />
      </div>
    </header>
  )
}
