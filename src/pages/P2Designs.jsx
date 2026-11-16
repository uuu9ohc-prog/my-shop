import { useNavigate } from 'react-router-dom'
import Placeholder from '../components/Placeholder.jsx'
import DollArt from '../components/DollArt.jsx'
import { DESIGNS } from '../data/designs.js'
import { useOrder } from '../state/OrderContext.jsx'

// P2 디자인 선택
export default function P2Designs() {
  const navigate = useNavigate()
  const { startDesign } = useOrder()

  const choose = (id) => {
    startDesign(id)
    navigate(`/custom/${id}`)
  }

  return (
    <main className="container page">
      {/* S2-1 페이지 제목 */}
      <section className="page-title">
        <h1>어떤 친구를 떠 드릴까요?</h1>
        <p>디자인을 고르면 색과 털실, 크기를 정하는 단계로 넘어가요.</p>
      </section>

      {/* S2-2 디자인 목록 — 3열 × 2행, 카드 전체가 버튼 (B2-1 ~ B2-6) */}
      <section aria-label="디자인 목록">
        <ul className="design-grid">
          {DESIGNS.map((d) => (
            <li key={d.id}>
              <button type="button" className="design-card" onClick={() => choose(d.id)}>
                <Placeholder
                  label={`${d.name} 인형 이미지`}
                  tone={d.tone}
                  className="design-card__image design-card__image--large"
                >
                  <DollArt design={d} />
                </Placeholder>
                <span className="design-card__name">{d.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
