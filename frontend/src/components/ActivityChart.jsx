const points = [24, 38, 31, 55, 48, 72, 63, 84, 71, 96, 82, 108];

export default function ActivityChart() {
  return (
    <section className="activity-card" aria-label="Translation activity this week">
      <div className="card-heading"><div><p className="eyebrow">WEEKLY ACTIVITY</p><h2>More voices, more visibility.</h2></div><strong>12 <small>sessions</small></strong></div>
      <div className="chart" role="img" aria-label="A rising line chart showing 12 translation sessions this week">
        <div className="chart-grid"><span /><span /><span /><span /></div>
        <svg viewBox="0 0 480 130" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="activity-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#e26d4d" stopOpacity=".3" /><stop offset="1" stopColor="#e26d4d" stopOpacity="0" /></linearGradient></defs><path className="chart-area" d="M0 106 L44 91 L87 97 L131 70 L175 78 L218 52 L262 61 L305 35 L349 51 L393 21 L436 38 L480 8 L480 130 L0 130 Z" /><path className="chart-line" d="M0 106 L44 91 L87 97 L131 70 L175 78 L218 52 L262 61 L305 35 L349 51 L393 21 L436 38 L480 8" /></svg>
      </div>
      <div className="chart-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
    </section>
  );
}
