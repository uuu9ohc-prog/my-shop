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
// 숨김 스타일은 root의 'reveal-ready' 클래스로 적용 — 첫 화면부터 숨긴 채 그리도록 JSX에 직접 붙여 둠
// (JS로 나중에 붙이면 잠깐 보였다가 숨겨진 뒤 다시 나타나는 깜빡임이 생김)
// 동작 줄이기 설정이면 효과 없이 바로 보여 줌
// trigger: 'scroll' = 화면에 들어올 때, 'load' = 페이지에 들어오자마자 (차례는 CSS --reveal-order)
export function useScrollReveal(rootRef, { trigger = 'scroll', delay = 400 } = {}) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined
    const items = Array.from(root.querySelectorAll('[data-reveal]'))
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-revealed'))
      return undefined
    }
    if (trigger === 'load') {
      // 들어오자마자 잠깐 쉬고 한꺼번에 시작 — 차례(지연)는 CSS 가 맡음
      const t = window.setTimeout(() => items.forEach((el) => el.classList.add('is-revealed')), delay)
      return () => window.clearTimeout(t)
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-revealed')
          io.unobserve(entry.target)
        })
      },
      // 화면 아래쪽 15%는 빼고, 요소가 30% 이상 보일 때 — 충분히 화면에 들어온 뒤 올라오게
      { threshold: 0.3, rootMargin: '0px 0px -15% 0px' },
    )
    // 첫 화면은 페이지가 그려진 뒤 잠깐 쉬고 시작 → 들어오자마자 올라오는 모습이 보이게
    const timer = window.setTimeout(() => {
      items.forEach((el) => io.observe(el))
    }, delay)
    return () => {
      window.clearTimeout(timer)
      io.disconnect()
    }
  }, [rootRef, trigger, delay])
}
