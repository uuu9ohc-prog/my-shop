import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import './TextType.css'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/*
  타이핑 효과 (클래스 구조는 React Bits TextType CSS 기준)
  - text: 줄바꿈은 '\n'
  - startDelay: 시작 전 대기(ms), typingSpeed: 글자당 간격(ms)
  - hideCursorWhenDone: 다 친 뒤 커서 숨김 (여러 문단을 이어 칠 때 앞 문단용)
  - 화면 읽기 프로그램에는 처음부터 전체 문장을 읽어 주고, 아직 안 친 글자도 자리를 차지해 레이아웃이 흔들리지 않음
*/
export default function TextType({
  as: Tag = 'p',
  text,
  startDelay = 0,
  typingSpeed = 60,
  cursor = 'bar',
  hideCursorWhenDone = false,
  highlights = [],
  highlightColor,
  onComplete,
  className = '',
}) {
  const chars = Array.from(text)

  // 형광펜 구간: 각 문구가 처음 나오는 위치(글자 단위)
  const ranges = highlights
    .map((phrase) => {
      const at = Array.from(text.slice(0, Math.max(0, text.indexOf(phrase)))).length
      return text.includes(phrase) ? { start: at, end: at + Array.from(phrase).length } : null
    })
    .filter(Boolean)
  const rangeAt = (i) => ranges.findIndex((r) => i >= r.start && i < r.end)
  const reduced = prefersReducedMotion()
  const [count, setCount] = useState(reduced ? chars.length : 0)
  const [started, setStarted] = useState(reduced)
  const rootRef = useRef(null)
  const cursorRef = useRef(null)
  const blinkRef = useRef(null)
  const done = count >= chars.length

  // 타이핑 진행
  useEffect(() => {
    if (reduced) return
    const id = setTimeout(
      () => {
        if (!started) setStarted(true)
        else if (!done) setCount((c) => c + 1)
      },
      started ? typingSpeed : startDelay,
    )
    return () => clearTimeout(id)
  }, [reduced, started, done, count, startDelay, typingSpeed])

  useEffect(() => {
    if (done && started) onComplete?.()
    // onComplete는 끝날 때 한 번만 부르면 되므로 의존성에서 제외
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, started])

  // 커서를 방금 친 글자 바로 오른쪽(글자 높이 가운데)에 둠. 창 크기가 바뀌어도 따라감
  useLayoutEffect(() => {
    const place = () => {
      const root = rootRef.current
      const cur = cursorRef.current
      if (!root || !cur) return
      const els = root.querySelectorAll('.text-type__char')
      const prev = els[count - 1]
      const next = els[count]
      // 앞 글자가 줄바꿈이거나 아직 아무것도 안 쳤으면 다음 글자의 왼쪽에 둠
      const useNext = !prev || chars[count - 1] === '\n'
      const ref = useNext ? next : prev
      if (!ref) return
      const r = ref.getBoundingClientRect()
      const base = root.getBoundingClientRect()
      const x = (useNext ? r.left : r.right) - base.left
      const y = r.top - base.top
      cur.style.height = `${r.height}px`
      cur.style.transform = `translate(${x}px, ${y}px)`
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [count])

  // 커서 깜빡임
  useEffect(() => {
    const el = blinkRef.current
    if (!el || reduced || !el.animate) return
    const anim = el.animate([{ opacity: 1 }, { opacity: 1, offset: 0.5 }, { opacity: 0, offset: 0.5 }, { opacity: 0 }], {
      duration: 1000,
      iterations: Infinity,
    })
    return () => anim.cancel()
  }, [reduced])

  const cursorHidden = !started || reduced || (done && hideCursorWhenDone)

  // 글자를 형광펜 구간별로 묶음. 아직 안 친 글자는 보이지 않게 자리만 차지
  const groups = []
  chars.forEach((ch, i) => {
    const r = rangeAt(i)
    const last = groups[groups.length - 1]
    if (last && last.range === r) last.items.push(i)
    else groups.push({ range: r, items: [i] })
  })
  const renderChar = (i) => (
    <span key={i} className="text-type__char" style={i < count ? undefined : { visibility: 'hidden' }}>
      {chars[i]}
    </span>
  )

  return (
    <Tag
      ref={rootRef}
      className={`text-type ${className}`.trim()}
      style={highlightColor ? { '--text-type-highlight': highlightColor } : undefined}
    >
      <span className="text-type__sr">{text}</span>
      <span aria-hidden="true">
        {groups.map((g) =>
          g.range === -1 ? (
            g.items.map(renderChar)
          ) : (
            <span
              key={`m${g.items[0]}`}
              className={`text-type__mark${count >= ranges[g.range].end ? ' text-type__mark--on' : ''}`}
            >
              {g.items.map(renderChar)}
            </span>
          ),
        )}
      </span>
      <span
        ref={cursorRef}
        aria-hidden="true"
        style={{ display: 'flex', alignItems: 'center', lineHeight: 0 }}
        className={`text-type__cursor text-type__cursor--${cursor}${cursorHidden ? ' text-type__cursor--hidden' : ''}`}
      >
        <span ref={blinkRef} className="text-type__blink">
          <span className="text-type__shape" style={{ verticalAlign: 'middle' }} />
        </span>
      </span>
    </Tag>
  )
}
