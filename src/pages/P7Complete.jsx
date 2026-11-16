import { useNavigate } from 'react-router-dom'
import Placeholder from '../components/Placeholder.jsx'
import { YarnPull } from '../components/YarnArt.jsx'
import { formatPrice, getPrice } from '../data/pricing.js'
import { getSize, getYarn } from '../data/options.js'
import { getSummary, useOrder } from '../state/OrderContext.jsx'

// P7 주문 완료 — 실제 결제 없이 완료 안내
export default function P7Complete() {
  const navigate = useNavigate()
  const { order, reset } = useOrder()
  const summary = getSummary(order)
  const yarn = getYarn(order.yarnId)

  // B7-1 처음으로 → P1, 고른 값 초기화
  const goHome = () => {
    navigate('/home')
    reset()
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
          <div className="summary__row">
            <dt>결제 금액</dt>
            <dd>{formatPrice(getPrice(order.sizeId, order.yarnId))}</dd>
          </div>
        </dl>
      </section>

      {/* S7-2 주문 완료 안내 */}
      <section className="page-title complete-message">
        <h1>주문이 완료되었습니다.</h1>
        <p>소중한 인형 친구는 손뜬 스튜디오가 한 땀 한 땀 만들고 있어요 ♬</p>
        <Placeholder label={`고른 털실(${yarn?.name})이 뽑히는 연출 이미지`} tone="peach" className="complete-message__image">
          <YarnPull colorId={order.colors[0]} />
        </Placeholder>
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
