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

// 스크롤 등장 효과 — root 안의 [data-reveal] 요소가 화면에 들어오면 'is-revealed'를 붙임 (한 번만)
// 숨김 스타일은 root에 'reveal-ready'가 붙은 뒤에만 적용 → JS가 없거나 실패해도 내용은 보임
// 동작 줄이기 설정이면 효과 없이 바로 보여 줌
export function useScrollReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined
    const items = Array.from(root.querySelectorAll('[data-reveal]'))
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-revealed'))
      return undefined
    }
    root.classList.add('reveal-ready')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-revealed')
          io.unobserve(entry.target)
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    )
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [rootRef])
}
