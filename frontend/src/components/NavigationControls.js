export default function NavigationControls({ current, total, onNext, onPrev }) {
  const pct = total > 1 ? (current / (total - 1)) * 100 : 0;

  return (
    <div className="nav-bar">
      <button className="nav-btn" onClick={onPrev} disabled={current === 0}>
        ◂ Previous
      </button>
      <div className="progress-wrap">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="progress-text">
          Step {current + 1} of {total}
        </span>
      </div>
      <button className="nav-btn" onClick={onNext} disabled={current === total - 1}>
        Next ▸
      </button>
    </div>
  );
} 