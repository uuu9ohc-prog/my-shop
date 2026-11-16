import { createContext, useContext, useEffect, useState } from 'react'
import { getDesign } from '../data/designs.js'
import { getColor, getSize, getYarn } from '../data/options.js'

// 방문자가 고른 값: 디자인, 부위별 색, 털실, 크기
// 새로고침해도 유지되도록 sessionStorage 에 함께 보관합니다.
const STORAGE_KEY = 'sonttuen-order'
const EMPTY = { designId: null, colors: {}, yarnId: null, sizeId: null }

function load() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY
  } catch {
    return EMPTY
  }
}

const OrderContext = createContext(null)

export function OrderProvider({ children }) {
  const [order, setOrder] = useState(load)

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(order))
    } catch {
      /* 저장할 수 없어도 화면은 그대로 동작 */
    }
  }, [order])

  const actions = {
    // 다른 디자인으로 바꾸면 색은 새로 고르고, 같은 디자인이면 고른 값을 유지
    startDesign: (designId) =>
      setOrder((o) => (o.designId === designId ? o : { ...o, designId, colors: {} })),
    setColor: (partIndex, colorId) =>
      setOrder((o) => ({ ...o, colors: { ...o.colors, [partIndex]: colorId } })),
    setYarn: (yarnId) => setOrder((o) => ({ ...o, yarnId })),
    setSize: (sizeId) => setOrder((o) => ({ ...o, sizeId })),
    // 공유 링크로 들어온 값으로 한꺼번에 채움
    loadShared: (shared) => setOrder({ ...EMPTY, ...shared }),
    reset: () => setOrder(EMPTY),
  }

  return <OrderContext.Provider value={{ order, ...actions }}>{children}</OrderContext.Provider>
}

export function useOrder() {
  return useContext(OrderContext)
}

// 아직 고르지 않은 항목 이름 목록 (B3-2 완성하기 검사에 사용)
export function getMissing(order) {
  const design = getDesign(order.designId)
  if (!design) return ['디자인']
  const missing = design.parts
    .filter((_, i) => !order.colors[i])
    .map((part) => `색상 (${part})`)
  if (!order.yarnId) missing.push('털실')
  if (!order.sizeId) missing.push('크기')
  return missing
}

// P5·P6·P7 요약에 쓰는 줄 목록
export function getSummary(order) {
  const design = getDesign(order.designId)
  if (!design) return null
  const colorRows = design.parts.map((part, i) => ({
    label: `색상 ${i + 1}`,
    value: `${getColor(order.colors[i])?.name ?? '-'} (${part})`,
    colorName: getColor(order.colors[i])?.name ?? '-',
  }))
  return {
    design,
    rows: [
      { label: '디자인', value: design.name },
      ...colorRows,
      { label: '털실', value: getYarn(order.yarnId)?.name ?? '-' },
      { label: '크기', value: getSize(order.sizeId)?.name ?? '-' },
    ],
    colorNames: colorRows.map((r) => r.colorName),
  }
}
