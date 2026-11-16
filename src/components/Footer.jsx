import { LogoMark } from './Icons.jsx'

// P1 푸터 (문구: 2026-11-16 답변 초안)
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p className="logo">
          <LogoMark />
          손뜬 스튜디오
        </p>
        <div className="site-footer__text">
          <p>한 땀 한 땀, 소중한 인형을 위하여</p>
          <p>© 2026 손뜬 스튜디오</p>
        </div>
      </div>
    </footer>
  )
}
