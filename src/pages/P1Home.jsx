import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Placeholder from '../components/Placeholder.jsx'
import Footer from '../components/Footer.jsx'
import DollArt from '../components/DollArt.jsx'
import { ArrowLeft, ArrowRight } from '../components/Icons.jsx'
import { DESIGNS, getDesign } from '../data/designs.js'
import { COLORS } from '../data/options.js'
import yarnPhoto from '../assets/woolen-yarn.jpg'
import { useOrder } from '../state/OrderContext.jsx'
import { useMediaQuery, useSwipe } from '../hooks.js'

const STEPS = [
  { no: '01', title: '디자인 고르기', text: '여섯 동물 중 하나를 골라요' },
  { no: '02', title: '색상 고르기', text: '세 군데 색을 고르면 바로 보여요' },
  { no: '03', title: '털실 고르기', text: '보송한 느낌부터 도톰한 느낌까지' },
  { no: '04', title: '크기 고르기', text: '10cm · 20cm · 30cm 중에서 골라요' },
]

const rabbit = getDesign('rabbit')

// S1-3 단계별 그림 (4단계 에셋: SVG 일러스트 + 털실 사진)
function StepArt({ no }) {
  if (no === '01') {
    return (
      <div className="step-art step-art--trio">
        {['cat', 'rabbit', 'bear'].map((id) => (
          <DollArt key={id} design={getDesign(id)} />
        ))}
      </div>
    )
  }
  if (no === '02') {
    return (
      <div className="step-art step-art--colors">
        <DollArt design={rabbit} />
        <span className="step-art__swatches">
          {COLORS.slice(0, 5).map((c) => (
            <span key={c.id} className="swatch" style={{ background: c.hex }} />
          ))}
        </span>
      </div>
    )
  }
  if (no === '03') {
    return <img className="step-art__photo" src={yarnPhoto} alt="" />
  }
  return (
    <div className="step-art step-art--sizes">
      {[48, 68, 88].map((h) => (
        <DollArt key={h} design={rabbit} className={`size-${h}`} />
      ))}
    </div>
  )
}

const SCENES = ['책상 위', '침대 머리맡', '선반 위', '창가', '소파 위', '선물 상자 속']

export default function P1Home() {
  const navigate = useNavigate()
  const { startDesign } = useOrder()
  const [slideState, setSlide] = useState(0)
  const [scene, setScene] = useState(0)

  // 한 화면에 카드 4개 (작은 화면 2개)
  const perView = useMediaQuery('(max-width: 768px)') ? 2 : 4
  const maxSlide = DESIGNS.length - perView
  const slide = Math.min(slideState, maxSlide)
  const prevSlide = () => setSlide(Math.max(0, slide - 1))
  const nextSlide = () => setSlide(Math.min(maxSlide, slide + 1))
  const cardSwipe = useSwipe({ onPrev: prevSlide, onNext: nextSlide })

  const nextScene = (scene + 1) % SCENES.length
  const prevScene = (scene - 1 + SCENES.length) % SCENES.length
  const sceneSwipe = useSwipe({ onPrev: () => setScene(prevScene), onNext: () => setScene(nextScene) })

  const choose = (id) => {
    startDesign(id)
    navigate(`/custom/${id}`)
  }

  return (
    <>
      <main>
        {/* S1-1 브랜드 인상 영역 (2분할) */}
        <section className="section container hero" aria-labelledby="hero-title">
          <div className="hero__text">
            <h1 id="hero-title" className="display-hero">
              한 땀 한 땀,
              <br />
              소중한 인형을 위하여
            </h1>
            <p>
              디자인을 고르고 색과 털실, 크기를 정하면 손뜬 스튜디오가
              <br />
              정성껏 떠서 보내 드려요.
            </p>
            <p>내 공간에 오래 두고 아낄, 하나뿐인 인형을 만들어 보세요.</p>
            {/* B1-1 핵심 행동 → P2 */}
            <Link to="/designs" className="btn btn--primary">
              나만의 인형 만들기
              <span className="btn__arrow">
                <ArrowRight />
              </span>
            </Link>
          </div>
          <Placeholder label="손뜬 인형 세 친구 — 고양이, 토끼, 곰" knit className="hero__image">
            <div className="hero__dolls">
              <DollArt design={getDesign('cat')} />
              <DollArt design={rabbit} yarnId="velvet" />
              <DollArt design={getDesign('bear')} />
            </div>
          </Placeholder>
        </section>

        {/* S1-2 디자인 둘러보기 (카드 슬라이드) */}
        <section className="section container" aria-labelledby="browse-title">
          <div className="section__head">
            <h2 id="browse-title" className="section-title">
              <span className="spark" aria-hidden="true">
                ✦
              </span>
              디자인 둘러보기
              <span className="spark" aria-hidden="true">
                ✦
              </span>
            </h2>
            <div className="arrows">
              <button
                type="button"
                className="icon-btn"
                aria-label="이전 디자인"
                disabled={slide === 0}
                onClick={prevSlide}
              >
                <ArrowLeft />
              </button>
              <button
                type="button"
                className="icon-btn"
                aria-label="다음 디자인"
                disabled={slide === maxSlide}
                onClick={nextSlide}
              >
                <ArrowRight />
              </button>
            </div>
          </div>
          <div className="slider" {...cardSwipe}>
            <ul className="card-row" style={{ '--per-view': perView, '--slide': slide }}>
              {DESIGNS.map((d, i) => {
                const hidden = i < slide || i >= slide + perView
                return (
                  <li key={d.id} aria-hidden={hidden || undefined}>
                    {/* B1-2 ~ B1-7 → P3 (그 디자인으로 시작) */}
                    <button
                      type="button"
                      className="design-card"
                      tabIndex={hidden ? -1 : undefined}
                      onClick={() => choose(d.id)}
                    >
                      <Placeholder
                        label={`${d.name} 인형 이미지`}
                        tone={d.tone}
                        className="design-card__image"
                      >
                        <DollArt design={d} />
                      </Placeholder>
                      <span className="design-card__foot">
                        <span className="design-card__name">{d.name}</span>
                        <span className="design-card__go" aria-hidden="true">
                          <ArrowRight />
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
          <div
            className="progress"
            role="progressbar"
            aria-label="디자인 카드 위치"
            aria-valuemin={1}
            aria-valuemax={maxSlide + 1}
            aria-valuenow={slide + 1}
          >
            <div
              className="progress__bar"
              style={{
                width: `${(perView / DESIGNS.length) * 100}%`,
                marginLeft: `${(slide / DESIGNS.length) * 100}%`,
              }}
            />
          </div>
        </section>

        {/* S1-3 만드는 순서 안내 */}
        <section className="section container" aria-labelledby="steps-title">
          <h2 id="steps-title" className="section-title section-title--center">
            <span className="spark" aria-hidden="true">
              ✦
            </span>
            이렇게 만들어져요
            <span className="spark" aria-hidden="true">
              ✦
            </span>
          </h2>
          <ol className="steps">
            {STEPS.map((s) => (
              <li key={s.no} className="step">
                <Placeholder label={`${s.title} 이미지`} className="step__image">
                  <StepArt no={s.no} />
                </Placeholder>
                <p className="step__title">
                  <span className="step__no">{s.no}</span> {s.title}
                </p>
                <p className="step__text">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* S1-4 인형 인테리어나 실 사용예 (3분할) */}
        <section className="section container scenes" aria-labelledby="scenes-title">
          <div className="scenes__main-wrap" {...sceneSwipe}>
            <Placeholder
              key={scene}
              label={`사용 예시 사진 — ${SCENES[scene]}`}
              knit
              className="scenes__main fade-in"
            />
          </div>
          <div className="scenes__text">
            <h2 id="scenes-title" className="display-sub">
              어디에 두어도 포근하게
            </h2>
            <p>
              책상 위, 침대 머리맡, 창가에.
              <br />내 공간에 오래 두고 아낄 인형을 만나 보세요.
            </p>
            {/* B1-8 → P2 */}
            <Link to="/designs" className="btn btn--outline">
              디자인 보러 가기
            </Link>
          </div>
          <div className="scenes__side">
            <button
              type="button"
              className="scenes__next"
              aria-label={`다음 장면 보기: ${SCENES[nextScene]}`}
              onClick={() => setScene(nextScene)}
            >
              <Placeholder
                key={nextScene}
                label={`다음 장면 — ${SCENES[nextScene]}`}
                tone="pink"
                className="scenes__thumb fade-in"
              />
            </button>
            <div className="dots" role="group" aria-label="사용 예시 장면">
              {SCENES.map((name, i) => (
                <button
                  key={name}
                  type="button"
                  className="dot"
                  aria-label={name}
                  aria-current={i === scene ? 'true' : undefined}
                  onClick={() => setScene(i)}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
