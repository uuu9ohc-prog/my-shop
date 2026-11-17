import BrowseSlider from '../components/BrowseSlider.jsx'

// P2 디자인 선택
// S2-2: 여섯 친구 실제 사진 3D 캐러셀(P1 S1-2에서 옮겨 옴, 2026-11-17) — 가운데 카드를 누르면 그 디자인의 P3
export default function P2Designs() {
  return (
    <main className="container page">
      {/* S2-1 페이지 제목 */}
      <section className="page-title">
        <h1>어떤 친구를 떠 드릴까요?</h1>
        <p>디자인을 고르면 색과 털실, 크기를 정하는 단계로 넘어가요.</p>
      </section>

      {/* S2-2 디자인 둘러보기 캐러셀 (B2-1 ~ B2-6) */}
      <section id="browse" aria-label="디자인 둘러보기">
        <BrowseSlider />
      </section>
    </main>
  )
}
