import { useNavigate } from 'react-router-dom'
import BasketScene from '../components/BasketScene.jsx'
import { getSize, getYarn } from '../data/options.js'
import { getSummary, useOrder } from '../state/OrderContext.jsx'

// P7 주문 완료 — 실제 결제 없이 완료 안내
export default function P7Complete() {
  const navigate = useNavigate()
  const { order } = useOrder()
  const summary = getSummary(order)
  const yarn = getYarn(order.yarnId)

  // B7-1 처음으로 → P1, 고른 값 초기화
  // 여기서 바로 reset()하면 페이지가 바뀌기 전에 값이 비어, 아직 P7(RequireComplete)에 있는 채로
  // '고른 디자인 없음 → P2' 이동이 먼저 일어남 (TC-03 실패, 2026-11-26). 그래서 P1에 도착한 뒤 지움
  const goHome = () => {
    navigate('/home', { state: { resetOrder: true } })
  }

  return (
    <main className="container page">
      {/* S7-1 주문 요약 */}
      <section className="complete-summary" aria-label="주문 요약">
        <dl className="summary">
          <div className="summary__row">
            <dt>상품</dt>
            <dd>손뜬 인형 · {summary.design.name}</dd>
          </div>
          <div className="summary__row">
            <dt>옵션</dt>
            <dd>
              {summary.colorNames.join('·')} / {yarn?.name} / {getSize(order.sizeId)?.name}
            </dd>
          </div>
        </dl>
      </section>

      {/* S7-2 주문 완료 안내 */}
      <section className="page-title complete-message">
        <h1>주문이 완료되었습니다.</h1>
        <p>소중한 인형 친구는 손뜬 스튜디오가 한 땀 한 땀 만들고 있어요 ♬</p>
        {/* 털실이 쌓인 바구니에 고른 인형이 함께 있는 이미지 (2026-11-17 답변) */}
        <div className="complete-message__image">
          <BasketScene
            design={summary.design}
            colors={order.colors}
            label={`털실이 쌓인 바구니 안의 ${summary.design.name} 인형`}
          />
        </div>
      </section>

      {/* S7-3 하단 버튼 */}
      <section className="actions">
        <div className="actions__buttons">
          <button type="button" className="btn btn--outline" onClick={goHome}>
            처음으로
          </button>
        </div>
      </section>
    </main>
  )
}
