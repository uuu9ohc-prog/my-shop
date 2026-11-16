import { useEffect, useRef, useState } from 'react'
import { copyText } from '../state/share.js'

const SIZE = 1080 // 저장 이미지 크기 (정사각형 px)

// 미리보기 영역의 인형 그림(SVG)을 파스텔 바탕 PNG로 만들어 내려받음
async function saveAsPng(previewEl, fileName) {
  const figure = previewEl.querySelector('.doll')
  const svg = previewEl.querySelector('svg.doll-art')
  if (!figure || !svg) return false

  const clone = svg.cloneNode(true)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('width', '240')
  clone.setAttribute('height', '280')
  const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)

  try {
    const img = new Image()
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = url
    })
    const canvas = document.createElement('canvas')
    canvas.width = SIZE
    canvas.height = SIZE
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = getComputedStyle(figure).backgroundColor
    ctx.fillRect(0, 0, SIZE, SIZE)
    const h = SIZE * 0.8
    const w = (h * 240) / 280
    ctx.drawImage(img, (SIZE - w) / 2, (SIZE - h) / 2, w, h)

    const png = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
    const link = document.createElement('a')
    link.href = URL.createObjectURL(png)
    link.download = fileName
    link.click()
    setTimeout(() => URL.revokeObjectURL(link.href), 1000)
    return true
  } catch {
    return false
  } finally {
    URL.revokeObjectURL(url)
  }
}

// 버튼 위에 잠깐 뜨는 완료 문구
function useFlash() {
  const [message, setMessage] = useState(null)
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])
  const flash = (text) => {
    setMessage(text)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setMessage(null), 2000)
  }
  return [message, flash]
}

// OV-01 저장·공유 레이어 — P5 위에 뜨고 배경을 어둡게. 헤더 없음.
export default function ShareLayer({ onClose, fileName, shareUrl, children }) {
  const closeRef = useRef(null)
  const previewRef = useRef(null)
  const [message, flash] = useFlash()

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  // BO1-1 이미지 저장
  const save = async () => {
    const ok = await saveAsPng(previewRef.current, fileName)
    flash(ok ? '저장했어요' : '저장하지 못했어요. 다시 눌러 주세요')
  }

  // BO1-2 링크 복사
  const copy = async () => {
    const ok = await copyText(shareUrl)
    flash(ok ? '링크를 복사했어요' : '복사하지 못했어요. 다시 눌러 주세요')
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="overlay__window"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="share-title" className="sr-only">저장·공유</h2>
        {/* SO1-1 완성 인형 미리보기 */}
        <div className="overlay__preview" ref={previewRef}>
          {children}
        </div>
        {/* SO1-2 저장·공유 버튼 */}
        <p className="overlay__flash" role="status" aria-live="polite">
          {message}
        </p>
        <div className="actions__buttons">
          <button type="button" className="btn btn--outline" onClick={save}>
            이미지 저장
          </button>
          <button type="button" className="btn btn--outline" onClick={copy}>
            링크 복사
          </button>
          {/* BO1-3 닫기 → P5 */}
          <button type="button" className="btn btn--outline" ref={closeRef} onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}
