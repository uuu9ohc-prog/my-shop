import { getDesign } from '../data/designs.js'
import { getColor, getSize, getYarn } from '../data/options.js'

// 고른 값을 주소에 담아 공유 (서버 없음)
// 예: /custom/rabbit?c=pink,black,white&y=fluffy&s=20

export function buildShareUrl(order) {
  const design = getDesign(order.designId)
  const colors = design.parts.map((_, i) => order.colors[i] ?? '').join(',')
  const params = new URLSearchParams({ c: colors, y: order.yarnId ?? '', s: order.sizeId ?? '' })
  // BASE_URL('/my-shop/')을 꼭 넣어야 배포 주소(GitHub Pages)에서 열림 (2026-11-26)
  return `${window.location.origin}${import.meta.env.BASE_URL}custom/${design.id}?${params.toString()}`
}

// 주소의 값 중 올바른 것만 꺼냄. 공유 값이 없으면 null
export function parseShare(designId, search) {
  const params = new URLSearchParams(search)
  if (!params.has('c') && !params.has('y') && !params.has('s')) return null
  const design = getDesign(designId)
  const colors = {}
  ;(params.get('c') ?? '').split(',').forEach((id, i) => {
    if (i < design.parts.length && getColor(id)) colors[i] = id
  })
  return {
    designId,
    colors,
    yarnId: getYarn(params.get('y')) ? params.get('y') : null,
    sizeId: getSize(params.get('s')) ? params.get('s') : null,
  }
}

// 클립보드 복사 (지원하지 않는 브라우저는 예전 방식으로)
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    let ok = false
    try {
      ok = document.execCommand('copy')
    } catch {
      ok = false
    }
    area.remove()
    return ok
  }
}
