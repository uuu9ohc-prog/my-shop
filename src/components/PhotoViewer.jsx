import { useEffect, useRef } from 'react'

// 사진 크게 보기 레이어 — 바깥 클릭·Esc·닫기 버튼으로 닫힘, 닫으면 연 버튼으로 포커스 복귀
export default function PhotoViewer({ src, alt, onClose }) {
  const closeRef = useRef(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  // 열릴 때 한 번만: 포커스 이동, Esc, 뒤 페이지 스크롤 막기
  useEffect(() => {
    const opener = document.activeElement
    closeRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onCloseRef.current()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      if (opener instanceof HTMLElement) opener.focus()
    }
  }, [])

  return (
    <div className="overlay" onClick={onClose}>
      <figure
        className="photo-viewer"
        role="dialog"
        aria-modal="true"
        aria-label={alt}
        onClick={(e) => e.stopPropagation()}
      >
        <img className="photo-viewer__img" src={src} alt={alt} />
        <figcaption className="photo-viewer__caption">{alt}</figcaption>
        <button type="button" className="photo-viewer__close" ref={closeRef} onClick={onClose} aria-label="닫기">
          ×
        </button>
      </figure>
    </div>
  )
}
