import { useState } from 'react'
import { Link } from 'react-router-dom'
import Placeholder from '../components/Placeholder.jsx'
import Footer from '../components/Footer.jsx'
import { ArrowRight } from '../components/Icons.jsx'
import TextType from '../components/TextType.jsx'
import heroPhoto from '../images/hero-direction-animal.jpg'
import BrowseSlider from '../components/BrowseSlider.jsx'
import PixelSnow from '../components/PixelSnow.jsx'
import { useSwipe } from '../hooks.js'

// S1-1 소개 문구 타이핑 효과: 첫 문단을 다 친 뒤 잠깐 쉬고 두 번째 문단을 이어서 침
const HERO_LINE_1 = '디자인을 고르고 색과 털실, 크기를 정하면\n손뜬 스튜디오가 정성껏 떠서 보내 드려요.'
const HERO_LINE_2 = '내 공간에 오래 두고 아낄,\n하나뿐인 인형을 만들어 보세요.'
const HERO_START = 400
const HERO_SPEED = 55
const HERO_HIGHLIGHT = '#fffed3' // 형광펜 색
const HERO_LINE_2_START = HERO_START + Array.from(HERO_LINE_1).length * HERO_SPEED + 500

const SCENES = ['책상 위', '침대 머리맡', '선반 위', '창가', '소파 위', '선물 상자 속']

export default function P1Home() {
  const [scene, setScene] = useState(0)

  const nextScene = (scene + 1) % SCENES.length
  const prevScene = (scene - 1 + SCENES.length) % SCENES.length
  const sceneSwipe = useSwipe({ onPrev: () => setScene(prevScene), onNext: () => setScene(nextScene) })

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
          >
            <img className="hero__photo" src={heroPhoto} alt="" />
            <PixelSnow className="hero__snow" variant="round" density={0.35} />
          </Placeholder>
        </section>

        {/* S1-2 디자인 둘러보기 */}
        <section id="browse" className="section container" aria-labelledby="browse-title">
          {/* S1-2 디자인 둘러보기 — 여섯 친구 사진 가로 슬라이드, 누르면 그 디자인으로 꾸미기 (2026-11-16 답변) */}
          <BrowseSlider
            title={
              <h2 id="browse-title" className="section-title">
                <span className="spark" aria-hidden="true">
                  ✦
                </span>
                디자인 둘러보기
                <span className="spark" aria-hidden="true">
                  ✦
                </span>
              </h2>
            }
          />
        </section>

        {/* S1-4 인형 인테리어나 실 사용예 (3분할) */}
        <section id="reviews" className="section container scenes" aria-labelledby="scenes-title">
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
