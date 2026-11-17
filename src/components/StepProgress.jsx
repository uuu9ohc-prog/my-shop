// P3 고르기 진행 막대 (2026-11-17)
// 색상(부위 수만큼) → 털실 → 크기. 하나 고를 때마다 칸이 하나씩 채워짐
// 단계 이름을 누르면 그 항목으로 이동
export default function StepProgress({ groups, onJump }) {
  const total = groups.reduce((n, g) => n + g.items.length, 0)
  const done = groups.reduce((n, g) => n + g.items.filter(Boolean).length, 0)
  const allDone = done === total

  return (
    <div className="step-progress">
      <p className="step-progress__status" aria-live="polite">
        {allDone ? (
          <>
            <strong>모두 골랐어요!</strong> 아래 완성하기를 눌러 주세요.
          </>
        ) : (
          <>
            <strong>
              {done} / {total}
            </strong>{' '}
            골랐어요
          </>
        )}
      </p>

      <div
        className="step-progress__bar"
        role="progressbar"
        aria-label="고르기 진행"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
      >
        {groups.map((g) => (
          <div key={g.key} className="step-progress__group" style={{ flexGrow: g.items.length }}>
            {g.items.map((filled, i) => (
              <span key={i} className={`step-progress__cell ${filled ? 'is-filled' : ''}`} />
            ))}
          </div>
        ))}
      </div>

      <ol className="step-progress__steps">
        {groups.map((g, i) => {
          const n = g.items.filter(Boolean).length
          const complete = n === g.items.length
          return (
            <li key={g.key} style={{ flexGrow: g.items.length }}>
              <button
                type="button"
                className={`step-progress__step ${complete ? 'is-complete' : ''}`}
                onClick={() => onJump(g.key)}
              >
                <span className="step-progress__num" aria-hidden="true">
                  {complete ? '✓' : i + 1}
                </span>
                {g.label}
                {g.items.length > 1 && (
                  <span className="step-progress__count">
                    {n}/{g.items.length}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
