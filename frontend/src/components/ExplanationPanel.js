export default function ExplanationPanel({ explanation, analogy, tags, allSteps }) {
  if (allSteps) {
    return (
      <div className="panel explanation-panel">
        <div className="panel-header">
          <span className="panel-header-icon">💡</span>
          AI Explanations — All Steps
        </div>
        <div className="explanation-body">
          {allSteps.map((s, i) => (
            <div key={i} className="step-block">
              <p className="step-num">Step {i + 1} — Line {s.lineNumber}</p>
              <p className="explanation-text">{s.explanation}</p>
              {s.analogy && <p className="analogy">💡 {s.analogy}</p>}
              <div className="tags">
                {(s.conceptTags || []).map((t) => (
                  <span key={t} className="tag-chip">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="panel explanation-panel">
      <div className="panel-header">
        <span className="panel-header-icon">💡</span>
        AI Explanation
      </div>
      <div className="explanation-body">
        {explanation ? (
          <>
            <p className="explanation-text">{explanation}</p>
            {analogy && <p className="analogy">💡 {analogy}</p>}
            <div className="tags">
              {(tags || []).map((t) => (
                <span key={t} className="tag-chip">{t}</span>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-explanation">
            <span className="empty-explanation-icon">🤖</span>
            <span>Generate code to see AI explanation</span>
          </div>
        )}
      </div>
    </div>
  );
} 