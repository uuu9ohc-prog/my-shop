import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Placeholder from '../components/Placeholder.jsx'
import Footer from '../components/Footer.jsx'
import { ArrowLeft, ArrowRight } from '../components/Icons.jsx'
import TextType from '../components/TextType.jsx'
import heroPhoto from '../images/hero-direction-animal.jpg'
import scenePicnic from '../images/scene-picnic.webp'
import sceneWindow from '../images/scene-window.jpg'
import sceneBed from '../images/scene-bed.jpg'
import sceneBeach from '../images/scene-beach.jpg'
import PixelSnow from '../components/PixelSnow.jsx'
import { useScrollReveal, useSwipe } from '../hooks.js'

// S1-1 소개 문구 타이핑 효과: 첫 문단을 다 친 뒤 잠깐 쉬고 두 번째 문단을 이어서 침
const HERO_LINE_1 = '디자인을 고르고 색과 털실, 크기를 정하면\n손뜬 스튜디오가 정성껏 떠서 보내 드려요.'
const HERO_LINE_2 = '내 공간에 오래 두고 아낄,\n하나뿐인 인형을 만들어 보세요.'
const HERO_START = 400
const HERO_SPEED = 55
const HERO_HIGHLIGHT = '#fffed3' // 형광펜 색
const HERO_LINE_2_START = HERO_START + Array.from(HERO_LINE_1).length * HERO_SPEED + 500

// S1-4 사용 예시 장면 — photo 가 있으면 사진, 없으면 자리 표시. 사진이 생기면 photo 만 채우면 됨
const SCENES = [
  { name: '잔디 위 소풍', photo: scenePicnic },
  { name: '창가', photo: sceneWindow },
  { name: '침대 위', photo: sceneBed },
  { name: '바닷가', photo: sceneBeach },
]

export default function P1Home() {
  const [scene, setScene] = useState(0)

  const nextScene = (scene + 1) % SCENES.length
  const prevScene = (scene - 1 + SCENES.length) % SCENES.length
  const sceneSwipe = useSwipe({ onPrev: () => setScene(prevScene), onNext: () => setScene(nextScene) })

  // S1-4 키보드 ←/→ 로 장면 넘기기 — 이 구역이 화면에 절반 이상 보일 때만.
  // 글 입력 중이거나 캐러셀(.album-rail)에 포커스가 있으면 그쪽 동작을 따름
  const scenesRef = useRef(null)
  const scenesVisible = useRef(false)
  useEffect(() => {
    const el = scenesRef.current
    if (!el) return undefined
    const io = new IntersectionObserver(
      ([entry]) => {
        scenesVisible.current = entry.isIntersecting
      },
      { threshold: 0.5 },
    )
    io.observe(el)
    const onKey = (e) => {
      if (!scenesVisible.current || e.altKey || e.ctrlKey || e.metaKey) return
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      const t = e.target
      if (t instanceof Element && t.closest('input, textarea, select, [contenteditable="true"], .album-rail')) return
      e.preventDefault()
      setScene((i) => (e.key === 'ArrowRight' ? (i + 1) % SCENES.length : (i - 1 + SCENES.length) % SCENES.length))
    }
    window.addEventListener('keydown', onKey)
    return () => {
      io.disconnect()
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  // 섹션 스크롤 등장 효과 (Scroll Reveal, 2026-11-17) — 순서는 --reveal-order 로 차례차례
  const mainRef = useRef(null)
  useScrollReveal(mainRef)

  return (
    <>
      <main ref={mainRef}>
        {/* S1-1 브랜드 인상 영역 (2분할) */}
        <section className="section container hero" aria-labelledby="hero-title">
          <div className="hero__text" data-reveal>
            <h1 id="hero-title" className="display-hero">
              한 땀 한 땀,
              <br />
              소중한 인형을 위하여
            </h1>
            <TextType
              text={HERO_LINE_1}
              startDelay={HERO_START}
              typingSpeed={HERO_SPEED}
              hideCursorWhenDone
              highlights={['디자인을 고르고 색과 털실, 크기를 정하면', '정성껏 떠서 보내 드려요.']}
              highlightColor={HERO_HIGHLIGHT}
            />
            <TextType
              text={HERO_LINE_2}
              startDelay={HERO_LINE_2_START}
              typingSpeed={HERO_SPEED}
              highlights={['하나뿐인 인형']}
              highlightColor={HERO_HIGHLIGHT}
            />
            {/* B1-1 핵심 행동 → P2 */}
            <Link to="/designs" className="btn btn--primary">
              나만의 인형 만들기
              <span className="btn__arrow">
                <ArrowRight />
              </span>
            </Link>
          </div>
          <Placeholder
            label="파스텔 털실 뭉치와 뜨개바늘, 레이스 도일리 대표 이미지"
            className="hero__image"
            data-reveal
            style={{ '--reveal-order': 1 }}
          >
            <img className="hero__photo" src={heroPhoto} alt="" />
            <PixelSnow className="hero__snow" variant="round" density={0.35} />
          </Placeholder>
        </section>

        {/* S1-4 인형 인테리어나 실 사용예 (3분할) */}
        <section ref={scenesRef} id="reviews" className="section container scenes" aria-labelledby="scenes-title">
          <div className="scenes__main-wrap" data-reveal {...sceneSwipe}>
            <Placeholder
              key={scene}
              label={`사용 예시 사진 — ${SCENES[scene].name}`}
              knit
              className="scenes__main fade-in"
            >
              {SCENES[scene].photo && <img className="scenes__photo" src={SCENES[scene].photo} alt="" />}
            </Placeholder>
            <button
              type="button"
              className="scenes__arrow scenes__arrow--prev"
              aria-label={`이전 장면 보기: ${SCENES[prevScene].name}`}
              onClick={() => setScene(prevScene)}
            >
              <ArrowLeft />
            </button>
            <button
              type="button"
              className="scenes__arrow scenes__arrow--next"
              aria-label={`다음 장면 보기: ${SCENES[nextScene].name}`}
              onClick={() => setScene(nextScene)}
            >
              <ArrowRight />
            </button>
          </div>
          <div className="scenes__text" data-reveal style={{ '--reveal-order': 1 }}>
            <h2 id="scenes-title" className="display-sub">
              어디에 두어도 포근하게
            </h2>
            <p>
              소풍 가는 잔디밭부터 창가, 침대 위, 노을 지는 바닷가까지.
              <br />어디든 함께하며 오래 아낄 인형을 만나 보세요.
            </p>
            {/* B1-8 → P2 */}
            <Link to="/designs" className="btn btn--outline">
              디자인 보러 가기
            </Link>
          </div>
          <div className="scenes__side" data-reveal style={{ '--reveal-order': 2 }}>
            <button
              type="button"
              className="scenes__next"
              aria-label={`다음 장면 보기: ${SCENES[nextScene].name}`}
              onClick={() => setScene(nextScene)}
            >
              <Placeholder
                key={nextScene}
                label={`다음 장면 — ${SCENES[nextScene].name}`}
                tone="pink"
                className="scenes__thumb fade-in"
              >
                {SCENES[nextScene].photo && (
                  <img className="scenes__photo" src={SCENES[nextScene].photo} alt="" />
                )}
              </Placeholder>
            </button>
            <div className="dots" role="group" aria-label="사용 예시 장면">
              {SCENES.map(({ name }, i) => (
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
