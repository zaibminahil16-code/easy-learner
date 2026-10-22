export default function TopBar() {
  return (
    <div className="top-bar">
      <div className="top-logo">
        <div className="top-logo-icon">🐍</div>
        <h1>Easy Learner</h1>
        <span className="top-subtitle">Interactive Python Platform</span>
      </div>
      <div className="top-bar-right">
        <div className="status-dot"></div>
        <span className="status-text">AI Ready</span>
      </div>
    </div>
  );
}