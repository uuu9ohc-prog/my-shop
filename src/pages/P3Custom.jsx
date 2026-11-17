import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import DollPreview from '../components/DollPreview.jsx'
import PhotoViewer from '../components/PhotoViewer.jsx'
import yarnFluffy from '../images/yarn-fluffy.jpg'
import yarnVelvet from '../images/yarn-velvet.jpg'
import yarnChunky from '../images/yarn-chunky.jpg'
import { ArrowRight } from '../components/Icons.jsx'
import { getDesign } from '../data/designs.js'
import { COLORS, SIZES, YARNS, getYarn } from '../data/options.js'
import { getMissing, useOrder } from '../state/OrderContext.jsx'
import { parseShare } from '../state/share.js'

// S3-4 털실 사진 (Figma 137:26) — 누르면 크게 보기
const YARN_PHOTOS = { fluffy: yarnFluffy, velvet: yarnVelvet, chunky: yarnChunky }

// 빠진 항목 표시 (5단계: 알림 + 해당 섹션 표시)
function NeedBadge({ show }) {
  return show ? <span className="need-badge">골라 주세요</span> : null
}

// P3 커스텀 — 색상·털실·크기를 한 페이지에서 선택
export default function P3Custom() {
  const { designId } = useParams()
  const design = getDesign(designId)
  const navigate = useNavigate()
  const { search } = useLocation()
  const { order, startDesign, loadShared, setColor, setYarn, setSize } = useOrder()
  const [part, setPart] = useState(0)
  const [checked, setChecked] = useState(false) // 완성하기를 한 번 눌렀는지
  const [viewYarn, setViewYarn] = useState(false) // 털실 사진 크게 보기
  const refs = { color: useRef(null), yarn: useRef(null), size: useRef(null) }

  // 주소로 바로 들어온 경우에도 그 디자인으로 시작 (같은 디자인이면 고른 값 유지)
  // 공유 링크(?c=…&y=…&s=…)로 들어오면 그 값으로 채운 뒤 주소를 정리
  useEffect(() => {
    if (!design) return
    const shared = parseShare(design.id, search)
    if (shared) {
      loadShared(shared)
      navigate(`/custom/${design.id}`, { replace: true })
    } else {
      startDesign(design.id)
    }
  }, [design?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!design) return <Navigate to="/designs" replace />
  // startDesign 이 반영되기 전 한 번의 렌더에서는 빈 값으로 보여 줌
  const colors = order.designId === design.id ? order.colors : {}
  const yarn = getYarn(order.yarnId)
  const current = { ...order, designId: design.id, colors }

  const missing = checked ? getMissing(current) : []
  const missingParts = checked ? design.parts.map((_, i) => !colors[i]) : []
  const needColor = missingParts.some(Boolean)
  const needYarn = checked && !order.yarnId
  const needSize = checked && !order.sizeId

  // B3-2 완성하기 — 모든 항목을 골라야 P4로 이동, 아니면 첫 빈 항목으로 스크롤
  const complete = () => {
    const list = getMissing(current)
    if (list.length === 0) {
      navigate('/making')
      return
    }
    setChecked(true)
    const firstPart = design.parts.findIndex((_, i) => !colors[i])
    if (firstPart >= 0) setPart(firstPart)
    const target = firstPart >= 0 ? refs.color : !order.yarnId ? refs.yarn : refs.size
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
  }

  return (
    <main className="container page">
      {/* S3-1 진행 안내 */}
      <section className="page-title">
        <h1>{design.name} 꾸미기</h1>
        <p>색 → 털실 → 크기 순서로 골라 주세요. 고른 색은 미리보기에 바로 보여요.</p>
      </section>

      <div className="custom">
        {/* S3-2 인형 미리보기 (왼쪽) */}
        <section className="custom__preview" aria-label="인형 미리보기">
          <DollPreview design={design} colors={colors} label={`${design.name} 인형 미리보기`} showParts />
          <p className="note">털실 느낌은 완성 화면에서 확인할 수 있어요.</p>
        </section>

        <div className="custom__options">
          {/* S3-3 색상 선택 */}
          <section
            ref={refs.color}
            className={`option-group ${needColor ? 'is-missing' : ''}`}
            aria-labelledby="color-title"
          >
            <h2 id="color-title">
              색상 <NeedBadge show={needColor} />
            </h2>
            <div className="tabs" role="tablist" aria-label="색을 바꿀 부위">
              {design.parts.map((name, i) => (
                <button
                  key={name}
                  type="button"
                  role="tab"
                  aria-selected={part === i}
                  className={`tab ${missingParts[i] ? 'tab--missing' : ''}`}
                  onClick={() => setPart(i)}
                >
                  {name}
                  {missingParts[i] && <span className="sr-only"> (고르지 않음)</span>}
                </button>
              ))}
            </div>
            <div className="chips" role="radiogroup" aria-label={`${design.parts[part]} 색상`}>
              {COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={colors[part] === c.id}
                  className="chip"
                  onClick={() => setColor(part, c.id)}
                >
                  <span className="swatch" style={{ background: c.hex }} aria-hidden="true" />
                  {c.name}
                </button>
              ))}
            </div>
          </section>

          {/* S3-4 털실 선택 */}
          <section
            ref={refs.yarn}
            className={`option-group ${needYarn ? 'is-missing' : ''}`}
            aria-labelledby="yarn-title"
          >
            <h2 id="yarn-title">
              털실 <NeedBadge show={needYarn} />
            </h2>
            <div className="choice-row" role="radiogroup" aria-label="털실">
              {YARNS.map((y) => (
                <button
                  key={y.id}
                  type="button"
                  role="radio"
                  aria-checked={order.yarnId === y.id}
                  className="choice"
                  onClick={() => setYarn(y.id)}
                >
                  {y.name}
                </button>
              ))}
            </div>
            {/* 털실 설명 (Figma 137:26) — 왼쪽 이름·설명·안내, 오른쪽 사진(누르면 크게) */}
            <div className={`yarn-info ${yarn ? 'yarn-info--photo' : ''}`} aria-live="polite">
              {yarn ? (
                <>
                  <div className="yarn-info__text">
                    <p className="yarn-info__title">{yarn.name}</p>
                    <p>{yarn.description}</p>
                    <p className="yarn-info__hint">
                      <span aria-hidden="true">♥</span> 사진을 클릭하면 크게 볼 수 있어요!
                    </p>
                  </div>
                  <button
                    type="button"
                    className="yarn-info__photo"
                    aria-label={`${yarn.name} 사진 크게 보기`}
                    onClick={() => setViewYarn(true)}
                  >
                    <img src={YARN_PHOTOS[yarn.id]} alt="" />
                    <span className="yarn-info__photo-label">털실 사진</span>
                  </button>
                </>
              ) : (
                <p className="note">털실을 고르면 설명과 사진이 나와요.</p>
              )}
            </div>
            {viewYarn && yarn && (
              <PhotoViewer src={YARN_PHOTOS[yarn.id]} alt={`${yarn.name} 사진`} onClose={() => setViewYarn(false)} />
            )}
          </section>

          {/* S3-5 크기 선택 */}
          <section
            ref={refs.size}
            className={`option-group ${needSize ? 'is-missing' : ''}`}
            aria-labelledby="size-title"
          >
            <h2 id="size-title">
              크기 <NeedBadge show={needSize} />
            </h2>
            <div className="choice-row" role="radiogroup" aria-label="크기">
              {SIZES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={order.sizeId === s.id}
                  className="choice"
                  onClick={() => setSize(s.id)}
                >
                  {s.name}
                </button>
              ))}
            </div>
            <p className="note">크기 기준: 높이</p>
          </section>
        </div>
      </div>

      {/* S3-6 하단 버튼 */}
      <section className="actions">
        {missing.length > 0 && (
          <div className="alert" role="alert">
            아직 고르지 않은 항목이 있어요: {missing.join(', ')}
          </div>
        )}
        <div className="actions__buttons">
          {/* B3-1 → P2 */}
          <Link to="/designs" className="btn btn--outline">
            디자인 다시 고르기
          </Link>
          {/* B3-2 핵심 행동 → P4 */}
          <button type="button" className="btn btn--primary" onClick={complete}>
            완성하기
            <span className="btn__arrow">
              <ArrowRight />
            </span>
          </button>
        </div>
      </section>
    </main>
  )
}
