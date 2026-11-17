import { useNavigate } from 'react-router-dom'
import AlbumRail from './AlbumRail.tsx'
import { LogoMark } from './Icons.jsx'
import { getDesign } from '../data/designs.js'
import dogPhoto from '../images/browse-dog.jpg'
import catPhoto from '../images/browse-cat.jpg'
import rabbitPhoto from '../images/browse-rabbit.jpg'
import bearPhoto from '../images/browse-bear.jpg'
import tigerPhoto from '../images/browse-tiger.jpg'
import duckPhoto from '../images/browse-duck.jpg'
import YarnBalls from './YarnBalls.jsx'

// S1-2 디자인 둘러보기 — 여섯 친구 사진(원본 그대로)을 3D 곡면 캐러셀(AlbumRail)로.
// 가운데 카드를 누르거나 Enter → 그 디자인으로 꾸미기(P3). 버튼 색은 사진에서 뽑음
// 가운데 카드나 실타래 버튼에 마우스를 올리면 그 인형 색 실타래가 슬리브 옆으로 빠져나옴 (버튼을 누르면 고정)
// 사진 속 인형 색 (몸통 → 포인트 색 순서) — 꺼내면 이 색 실타래가 나옴
const YARN_COLORS = {
  dog: ['#a9cbe2', '#e6a5b8', '#ecd8c0'], // 하늘 몸통 · 분홍 귀·발 · 베이지 주둥이
  cat: ['#c6a9d8', '#f09a6c'], // 연보라 · 주황 귀·발
  rabbit: ['#f3e3c8', '#a6dcc3'], // 크림 · 민트 귀·발
  bear: ['#eea883', '#a9c7e0'], // 살구 · 하늘 귀·발
  tiger: ['#f2e7d0', '#f2cc62', '#a9a7a4'], // 크림 · 노랑 발 · 회색 줄무늬
  duck: ['#cbb8d8', '#ef6c58'], // 연보라 · 산호 부리·발
}

export const BROWSE_ALBUMS = [
  { id: 'dog', cover: dogPhoto },
  { id: 'cat', cover: catPhoto },
  { id: 'rabbit', cover: rabbitPhoto },
  { id: 'bear', cover: bearPhoto },
  { id: 'tiger', cover: tigerPhoto },
  { id: 'duck', cover: duckPhoto },
].map(({ id, cover }) => {
  const design = getDesign(id)
  return { id, cover, title: design?.name ?? id, artist: design ? design.parts.join(' · ') : '' }
})

export default function BrowseSlider({ title, ...railProps }) {
  const navigate = useNavigate()
  return (
    <>
      {title && <div className="section__head">{title}</div>}
      <AlbumRail
        className="browse-rail"
        albums={BROWSE_ALBUMS}
        aria-label="디자인 둘러보기 — 가운데 카드를 누르면 꾸미기로 이동"
        onSelect={(album) => navigate(`/custom/${album.id}`)}
        playIcon={<LogoMark />}
        tuckedItem={(album) => <YarnBalls colors={YARN_COLORS[album.id] ?? ['#d8cfc4']} />}
        tuckedName="실타래"
        {...railProps}
      />
    </>
  )
}
