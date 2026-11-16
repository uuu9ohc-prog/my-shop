import { useId } from 'react'
import { getColor } from '../data/options.js'

/*
  뜨개 인형 SVG 일러스트 (4단계 에셋, 2026-11-16 답변: 코드로 그린 SVG)
  - 부위별 색: colors = { 0: 색상 id, 1: ..., } (design.parts 순서)
  - 털실 질감: yarnId 가 있으면 fluffy / velvet / chunky 무늬를 덮음 (P3 미리보기는 질감 없음)
*/

const FALLBACK = ['#efe4d6', '#4a4542', '#e6cfc0', '#e6cfc0'] // 아직 고르지 않은 부위
const INK = '#3a3531'

// 디자인별 뜨개 부분(질감이 덮이는 부분). c = [바탕, 눈, 3번째 부위, 4번째 부위]
function KnitShapes({ id, c }) {
  const base = c[0]
  const accent = id === 'tiger' ? c[3] : c[2] // 귀·발바닥 / 부리·발
  const stripe = c[2] // 호랑이 줄무늬

  const roundFeet = (
    <>
      <ellipse cx="88" cy="252" rx="26" ry="16" fill={base} />
      <ellipse cx="152" cy="252" rx="26" ry="16" fill={base} />
      <ellipse cx="88" cy="256" rx="13" ry="7" fill={accent} />
      <ellipse cx="152" cy="256" rx="13" ry="7" fill={accent} />
    </>
  )
  const duckFeet = (
    <>
      <path d="M66 264 Q70 244 88 236 Q106 244 110 264 Q88 258 66 264 Z" fill={accent} />
      <path d="M130 264 Q134 244 152 236 Q170 244 174 264 Q152 258 130 264 Z" fill={accent} />
    </>
  )
  const arms = (
    <>
      <ellipse cx="68" cy="200" rx="15" ry="28" transform="rotate(25 68 200)" fill={base} />
      <ellipse cx="172" cy="200" rx="15" ry="28" transform="rotate(-25 172 200)" fill={base} />
    </>
  )
  const body = <ellipse cx="120" cy="205" rx="60" ry="52" fill={base} />
  const head = <ellipse cx="120" cy="112" rx="76" ry="66" fill={base} />

  // 머리 뒤에 오는 귀
  let earsBack = null
  // 머리 앞에 오는 귀·장식
  let front = null

  if (id === 'rabbit') {
    earsBack = (
      <>
        <ellipse cx="92" cy="48" rx="17" ry="46" transform="rotate(-8 92 48)" fill={base} />
        <ellipse cx="148" cy="48" rx="17" ry="46" transform="rotate(8 148 48)" fill={base} />
        <ellipse cx="92" cy="52" rx="8" ry="32" transform="rotate(-8 92 52)" fill={accent} />
        <ellipse cx="148" cy="52" rx="8" ry="32" transform="rotate(8 148 52)" fill={accent} />
      </>
    )
  } else if (id === 'cat') {
    earsBack = (
      <>
        <path d="M56 92 L66 30 L110 58 Z" fill={base} stroke={base} strokeWidth="12" strokeLinejoin="round" />
        <path d="M184 92 L174 30 L130 58 Z" fill={base} stroke={base} strokeWidth="12" strokeLinejoin="round" />
        <path d="M70 74 L74 44 L96 60 Z" fill={accent} stroke={accent} strokeWidth="6" strokeLinejoin="round" />
        <path d="M170 74 L166 44 L144 60 Z" fill={accent} stroke={accent} strokeWidth="6" strokeLinejoin="round" />
      </>
    )
  } else if (id === 'bear' || id === 'tiger') {
    earsBack = (
      <>
        <circle cx="62" cy="60" r="24" fill={base} />
        <circle cx="178" cy="60" r="24" fill={base} />
        <circle cx="62" cy="60" r="12" fill={accent} />
        <circle cx="178" cy="60" r="12" fill={accent} />
      </>
    )
  } else if (id === 'dog') {
    front = (
      <>
        <ellipse cx="50" cy="114" rx="20" ry="40" transform="rotate(18 50 114)" fill={accent} />
        <ellipse cx="190" cy="114" rx="20" ry="40" transform="rotate(-18 190 114)" fill={accent} />
      </>
    )
  } else if (id === 'duck') {
    earsBack = (
      <path d="M116 50 Q108 30 122 24 Q118 36 130 40 Q124 44 126 50 Z" fill={base} />
    )
    front = (
      <>
        <ellipse cx="120" cy="136" rx="26" ry="12" fill={accent} />
        <path d="M98 136 Q120 142 142 136" stroke="rgba(58,53,49,.35)" strokeWidth="2" fill="none" />
      </>
    )
  }

  if (id === 'tiger') {
    const s = { stroke: stripe, strokeWidth: 6, strokeLinecap: 'round', fill: 'none' }
    front = (
      <>
        <path d="M106 52 L111 70" {...s} />
        <path d="M120 48 L120 68" {...s} />
        <path d="M134 52 L129 70" {...s} />
        <path d="M48 108 L66 112" {...s} />
        <path d="M50 124 L66 124" {...s} />
        <path d="M192 108 L174 112" {...s} />
        <path d="M190 124 L174 124" {...s} />
        <path d="M96 178 Q120 186 144 178" {...s} />
        <path d="M100 198 Q120 204 140 198" {...s} />
      </>
    )
  }

  return (
    <>
      {earsBack}
      {arms}
      {id === 'duck' ? duckFeet : roundFeet}
      {body}
      {head}
      {front}
    </>
  )
}

// 눈·코·입 (단추·자수 부분이라 질감을 덮지 않음)
function Face({ id, eyes }) {
  return (
    <>
      <circle cx="94" cy="114" r="8.5" fill={eyes} />
      <circle cx="146" cy="114" r="8.5" fill={eyes} />
      <circle cx="97" cy="111" r="2.5" fill="#fff" opacity=".85" />
      <circle cx="149" cy="111" r="2.5" fill="#fff" opacity=".85" />
      {id !== 'duck' && (
        <>
          <ellipse cx="120" cy="131" rx="6" ry="4.5" fill={INK} />
          <path
            d="M111 138 Q115.5 145 120 138 Q124.5 145 129 138"
            stroke={INK}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}
    </>
  )
}

// 털실 질감 무늬
function YarnPattern({ id, yarnId }) {
  if (yarnId === 'fluffy') {
    return (
      <pattern id={id} width="10" height="10" patternUnits="userSpaceOnUse">
        <path d="M1 2 l3 -1 M6 5 l1 3 M2 8 l3 1 M8 1 l1 2" stroke="rgba(255,255,255,.55)" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M4 4 l2 1 M8 8 l1 -2" stroke="rgba(0,0,0,.10)" strokeWidth="1" strokeLinecap="round" />
      </pattern>
    )
  }
  const big = yarnId === 'chunky'
  const w = big ? 16 : 8
  const h = big ? 14 : 8
  const sw = big ? 2.4 : 1.2
  return (
    <pattern id={id} width={w} height={h} patternUnits="userSpaceOnUse">
      <path d={`M0 1 L${w / 2} ${h - 1} L${w} 1`} stroke="rgba(0,0,0,.13)" strokeWidth={sw} fill="none" />
      <path d={`M0 ${1 + sw} L${w / 2} ${h - 1 + sw} L${w} ${1 + sw}`} stroke="rgba(255,255,255,.28)" strokeWidth={sw * 0.7} fill="none" />
    </pattern>
  )
}

export default function DollArt({ design, colors, yarnId, className = '' }) {
  const uid = useId().replace(/:/g, '')
  const fill = design.parts.map((_, i) => {
    const colorId = colors ? colors[i] : design.sample?.[i]
    return getColor(colorId)?.hex ?? FALLBACK[i]
  })
  const white = fill.map(() => '#fff')
  const textured = Boolean(yarnId)

  return (
    <svg className={`doll-art ${className}`} viewBox="0 0 240 280" aria-hidden="true">
      {textured && (
        <defs>
          <YarnPattern id={`pat-${uid}`} yarnId={yarnId} />
          <mask id={`mask-${uid}`}>
            <KnitShapes id={design.id} c={white} />
          </mask>
          {yarnId === 'fluffy' && (
            <filter id={`fuzz-${uid}`} x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="3" />
              <feDisplacementMap in="SourceGraphic" scale="4" />
            </filter>
          )}
        </defs>
      )}
      <g filter={yarnId === 'fluffy' ? `url(#fuzz-${uid})` : undefined}>
        <KnitShapes id={design.id} c={fill} />
      </g>
      {textured && (
        <rect width="240" height="280" fill={`url(#pat-${uid})`} mask={`url(#mask-${uid})`} />
      )}
      <Face id={design.id} eyes={fill[1]} />
    </svg>
  )
}
