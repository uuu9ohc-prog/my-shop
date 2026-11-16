import { useEffect, useRef, useState } from 'react'

// 화면 너비 조건 (예: '(max-width: 768px)')
export function useMediaQuery(query) {
  const get = () => typeof window !== 'undefined' && window.matchMedia(query).matches
  const [matches, setMatches] = useState(get)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setMatches(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])
  return matches
}

// 손가락으로 좌우 넘기기 — 40px 이상 밀면 onPrev / onNext
// 세로 스크롤은 그대로 두도록 가로 이동이 더 클 때만 반응
export function useSwipe({ onPrev, onNext, threshold = 40 }) {
  const start = useRef(null)
  return {
    onTouchStart: (e) => {
      const t = e.touches[0]
      start.current = { x: t.clientX, y: t.clientY }
    },
    onTouchEnd: (e) => {
      if (!start.current) return
      const t = e.changedTouches[0]
      const dx = t.clientX - start.current.x
      const dy = t.clientY - start.current.y
      start.current = null
      if (Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy)) return
      if (dx < 0) onNext()
      else onPrev()
    },
  }
}
