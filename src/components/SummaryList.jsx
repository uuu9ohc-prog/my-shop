// 선택 요약 (항목명: 선택값) — P5 S5-2, P6 S6-1
export default function SummaryList({ rows }) {
  return (
    <dl className="summary">
      {rows.map((row) => (
        <div className="summary__row" key={row.label}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}
