import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import DollPreview from '../components/DollPreview.jsx'
import SummaryList from '../components/SummaryList.jsx'
import ShareLayer from '../components/ShareLayer.jsx'
import { ArrowRight } from '../components/Icons.jsx'
import { getYarn } from '../data/options.js'
import { getSummary, useOrder } from '../state/OrderContext.jsx'
import { buildShareUrl } from '../state/share.js'

// P5 완성 페이지
export default function P5Result() {
  const { order } = useOrder()
  const summary = getSummary(order)
  const [shareOpen, setShareOpen] = useState(false)
  const closeShare = useCallback(() => setShareOpen(false), [])
  const imageLabel = `최종 완성 이미지 (고른 색 + ${getYarn(order.yarnId)?.name} 질감)`

  return (
    <main className="container page">
      <h1 className="sr-only">완성 페이지</h1>
      {/* S5-1 최종 이미지 — 크게 단독으로 */}
      <section className="result__image" aria-label="최종 완성 이미지">
        <DollPreview
          design={summary.design}
          colors={order.colors}
          yarnId={order.yarnId}
          label={imageLabel}
          className="doll--large"
        />
      </section>

      {/* S5-2 선택 요약 */}
      <section className="result__summary" aria-label="선택 요약">
        <SummaryList rows={summary.rows} />
      </section>

      {/* S5-3 하단 버튼 */}
      <section className="actions">
        <div className="actions__buttons">
          {/* B5-2 → P3 (고른 값 유지) */}
          <Link to={`/custom/${order.designId}`} className="btn btn--outline">
            다시 꾸미기
          </Link>
          {/* B5-3 → OV-01 */}
          <button type="button" className="btn btn--outline" onClick={() => setShareOpen(true)}>
            저장·공유
          </button>
          {/* B5-1 핵심 행동 → P6 */}
          <Link to="/order" className="btn btn--primary">
            주문하기
            <span className="btn__arrow"><ArrowRight /></span>
          </Link>
        </div>
      </section>

      {shareOpen && (
        <ShareLayer
          onClose={closeShare}
          fileName={`손뜬-${summary.design.name}.png`}
          shareUrl={buildShareUrl(order)}
        >
          <DollPreview design={summary.design} colors={order.colors} yarnId={order.yarnId} label={imageLabel} />
        </ShareLayer>
      )}
    </main>
  )
}
