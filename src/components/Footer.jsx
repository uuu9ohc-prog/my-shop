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
          {/* 차이 활짝체 출처 표기 — 라이선스(public/fonts/ChaiHwaljjak-LICENSE.txt) 권장 문구 그대로 (2026-11-26) */}
          <p className="site-footer__credit">이 페이지에는 차이에서 제공한 차이 활짝체가 적용되어 있습니다.</p>
        </div>
      </div>
    </footer>
  )
}
