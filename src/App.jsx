import { useEffect } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header.jsx'
import RequireComplete from './components/RequireComplete.jsx'
import P0Intro from './pages/P0Intro.jsx'
import P1Home from './pages/P1Home.jsx'
import P2Designs from './pages/P2Designs.jsx'
import P3Custom from './pages/P3Custom.jsx'
import P4Making from './pages/P4Making.jsx'
import P5Result from './pages/P5Result.jsx'
import P7Complete from './pages/P7Complete.jsx'
import AlbumRailDemo from './pages/AlbumRailDemo.tsx'

// 헤더가 있는 페이지 (P1, P2, P3, P5, P7)
function WithHeader() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  )
}

// 페이지를 옮길 때마다 맨 위에서 시작. 주소에 #구역 이 있으면 그 구역으로 이동 (예: /home#steps)
function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1))
      if (target) {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* 헤더 없음: P0, P4 */}
        <Route path="/" element={<P0Intro />} />
        <Route path="/album-rail" element={<AlbumRailDemo />} />
        <Route
          path="/making"
          element={
            <RequireComplete>
              <P4Making />
            </RequireComplete>
          }
        />

        <Route element={<WithHeader />}>
          <Route path="/home" element={<P1Home />} />
          <Route path="/designs" element={<P2Designs />} />
          <Route path="/custom/:designId" element={<P3Custom />} />
          <Route element={<RequireComplete><Outlet /></RequireComplete>}>
            <Route path="/result" element={<P5Result />} />
            {/* P6 주문 확인은 없앰 — 예전 주소로 들어오면 P7로 */}
            <Route path="/order" element={<Navigate to="/complete" replace />} />
            <Route path="/complete" element={<P7Complete />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </>
  )
}
