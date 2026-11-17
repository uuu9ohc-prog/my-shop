import { useNavigate } from 'react-router-dom'
import AlbumRail from './AlbumRail.tsx'
import { getDesign } from '../data/designs.js'
import dogPhoto from '../images/browse-dog.jpg'
import catPhoto from '../images/browse-cat.jpg'
import rabbitPhoto from '../images/browse-rabbit.jpg'
import bearPhoto from '../images/browse-bear.jpg'
import tigerPhoto from '../images/browse-tiger.jpg'
import duckPhoto from '../images/browse-duck.jpg'

// S1-2 디자인 둘러보기 — 여섯 친구 사진(원본 그대로)을 3D 곡면 캐러셀(AlbumRail)로.
// 가운데 카드를 누르거나 Enter → 그 디자인으로 꾸미기(P3). 버튼·대표 색은 사진에서 뽑음
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

export default function BrowseSlider({ title }) {
  const navigate = useNavigate()
  return (
    <>
      <div className="section__head">{title}</div>
      <AlbumRail
        className="browse-rail"
        albums={BROWSE_ALBUMS}
        aria-label="디자인 둘러보기 — 가운데 카드를 누르면 꾸미기로 이동"
        onSelect={(album) => navigate(`/custom/${album.id}`)}
      />
    </>
  )
}
