import AlbumRail from '../components/AlbumRail'
import { BROWSE_ALBUMS } from '../components/BrowseSlider.jsx'

// 어두운 배경 단독 데모 — 홈 디자인 둘러보기와 같은 사진 6장
export default function AlbumRailDemo() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        background: '#0b0b0b',
      }}
    >
      <AlbumRail albums={BROWSE_ALBUMS} aria-label="디자인 둘러보기" />
    </main>
  )
}
