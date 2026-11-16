import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// P0 시작 로딩 / P4 완성 로딩 공통 틀 — 헤더 없음, 끝나면 자동 이동
// 연출: 털실 쌓임(P0) → 뽑힘(P4), 2.4초 (2026-11-16 답변).
const DURATION = 2400

export default function LoadingScreen({ art, imageLabel, message, to }) {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const timer = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / DURATION) * 100)
      setProgress(p)
      if (p >= 100) {
        clearInterval(timer)
        navigate(to, { replace: true })
      }
    }, 50)
    return () => clearInterval(timer)
  }, [navigate, to])

  return (
    <main className="loading">
      <div className="loading__image" role="img" aria-label={imageLabel}>
        {art}
      </div>
      <p className="loading__message">{message}</p>
      <div
        className="progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        aria-label="불러오는 중"
      >
        <div className="progress__bar" style={{ width: `${progress}%` }} />
      </div>
    </main>
  )
}
