import { Link } from 'react-router-dom'
import DollPreview from '../components/DollPreview.jsx'
import SummaryList from '../components/SummaryList.jsx'
import { ArrowRight } from '../components/Icons.jsx'
import { PRODUCTION_PERIOD, formatPrice, getPrice } from '../data/pricing.js'
import { getYarn } from '../data/options.js'
import { getSummary, useOrder } from '../state/OrderContext.jsx'

// P6 주문 확인 — 실제 결제 없음
export default function P6Order() {
  const { order } = useOrder()
  const summary = getSummary(order)
  const price = getPrice(order.sizeId, order.yarnId)

  return (
    <main className="container page">
      <h1 className="sr-only">주문 확인</h1>

      {/* S6-1 주문 요약 */}
      <section className="order-summary" aria-label="주문 요약">
        <DollPreview
          design={summary.design}
          colors={order.colors}
          yarnId={order.yarnId}
          label={`완성 인형 이미지 (${getYarn(order.yarnId)?.name})`}
          className="doll--small"
          photo
        />
        <SummaryList rows={summary.rows} />
      </section>

      {/* S6-2 가격 */}
      <section className="order-info" aria-labelledby="price-title">
        <h2 id="price-title">가격</h2>
        <p className="price">{formatPrice(price)}</p>
      </section>

      {/* S6-3 제작 기간 */}
      <section className="order-info" aria-labelledby="period-title">
        <h2 id="period-title">제작 기간</h2>
        <p>{PRODUCTION_PERIOD ?? '[미정]'}</p>
      </section>

      {/* S6-4 하단 버튼 */}
      <section className="actions">
        <div className="actions__buttons">
          {/* B6-1 → P5 (고른 값 유지) */}
          <Link to="/result" className="btn btn--outline">
            이전
          </Link>
          {/* B6-2 핵심 행동 → P7 */}
          <Link to="/complete" className="btn btn--primary">
            확인
            <span className="btn__arrow"><ArrowRight /></span>
          </Link>
        </div>
      </section>
    </main>
  )
}
