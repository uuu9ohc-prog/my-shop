// 색상 10색 — 약간 파스텔 톤 (값: 2026-11-16 답변으로 확정한 제안 팔레트)
export const COLORS = [
  { id: 'red', name: '빨강', hex: '#e8a09a' },
  { id: 'pink', name: '분홍', hex: '#f4c2c8' },
  { id: 'orange', name: '주황', hex: '#f3c19a' },
  { id: 'yellow', name: '노랑', hex: '#f3e09c' },
  { id: 'green', name: '초록', hex: '#b9d8b0' },
  { id: 'blue', name: '파랑', hex: '#a9c8e8' },
  { id: 'navy', name: '남색', hex: '#8e9cc4' },
  { id: 'black', name: '검정', hex: '#4a4542' },
  { id: 'gray', name: '회색', hex: '#b8b3ad' },
  { id: 'white', name: '흰색', hex: '#fbf8f1' },
]

// 털실 3종 (출처: 01, 04)
export const YARNS = [
  { id: 'fluffy', name: '부슬부슬한 털실', description: '털이 보송하게 일어나 포근한 느낌을 줘요.' },
  { id: 'velvet', name: '벨벳형 부드러운 털실', description: '가장 기본이 되는 부드러운 털실이에요.' },
  { id: 'chunky', name: '두툼한 털실', description: '뜨개 모양이 가장 크게 보여요.' },
]

// 크기 3종 — 높이 기준 (출처: 01, 답변)
export const SIZES = [
  { id: '10', name: '10cm' },
  { id: '20', name: '20cm' },
  { id: '30', name: '30cm' },
]

export const getColor = (id) => COLORS.find((c) => c.id === id)
export const getYarn = (id) => YARNS.find((y) => y.id === id)
export const getSize = (id) => SIZES.find((s) => s.id === id)
