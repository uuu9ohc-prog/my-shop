// 가격·제작 기간 — [미정]. 금액이 정해지면 이 파일만 고치면 됩니다.
// PRICE_TABLE[크기 id][털실 id] = 원 단위 숫자 (null 이면 화면에 [미정] 표시)
export const PRICE_TABLE = {
  10: { fluffy: null, velvet: null, chunky: null },
  20: { fluffy: null, velvet: null, chunky: null },
  30: { fluffy: null, velvet: null, chunky: null },
}

// 예: '주문 후 2~3주' (null 이면 [미정] 표시)
export const PRODUCTION_PERIOD = null

export function getPrice(sizeId, yarnId) {
  return PRICE_TABLE[sizeId]?.[yarnId] ?? null
}

export function formatPrice(price) {
  return price == null ? '[미정]' : `${price.toLocaleString('ko-KR')}원`
}
