// 디자인 6종과 디자인별 색상 부위 (출처: PROJECT_CONTEXT 2번, 2026-11-16 답변)
// tone = 카드 이미지·미리보기 뒤 파스텔 바탕 (pink / sky / peach)
// sample = P1·P2 카드 등 소개용 그림에 쓰는 부위별 색 (색상 id, parts 순서)
const BASIC_PARTS = ['전체 바탕', '눈', '귀·발바닥']

export const DESIGNS = [
  { id: 'dog', name: '강아지', tone: 'pink', parts: BASIC_PARTS, sample: ['white', 'black', 'gray'] },
  { id: 'cat', name: '고양이', tone: 'sky', parts: BASIC_PARTS, sample: ['gray', 'black', 'pink'] },
  { id: 'rabbit', name: '토끼', tone: 'peach', parts: BASIC_PARTS, sample: ['pink', 'black', 'white'] },
  { id: 'bear', name: '곰', tone: 'pink', parts: BASIC_PARTS, sample: ['orange', 'black', 'white'] },
  { id: 'duck', name: '오리', tone: 'sky', parts: ['전체 바탕', '눈', '부리·발'], sample: ['yellow', 'black', 'orange'] },
  { id: 'tiger', name: '호랑이', tone: 'peach', parts: ['전체 바탕', '눈', '줄무늬', '귀·발바닥'], sample: ['orange', 'black', 'black', 'white'] },
]

export const getDesign = (id) => DESIGNS.find((d) => d.id === id)
