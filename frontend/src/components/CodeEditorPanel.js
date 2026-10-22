const KEYWORDS = ['for', 'while', 'if', 'elif', 'else', 'def', 'return',
  'in', 'not', 'and', 'or', 'True', 'False', 'None', 'import', 'from',
  'class', 'try', 'except', 'finally', 'with', 'as', 'pass', 'break',
  'continue', 'lambda', 'yield', 'global', 'print', 'range', 'len'];

function highlightLine(line) {
  const parts = [];
  let remaining = line;
  let key = 0;

  // Handle comments
  const commentIdx = remaining.indexOf('#');
  if (commentIdx !== -1) {
    const before = remaining.slice(0, commentIdx);
    const comment = remaining.slice(commentIdx);
    if (before) parts.push(<span key={key++}>{highlightCode(before)}</span>);
    parts.push(<span key={key++} style={{color: '#6a9955'}}>{comment}</span>);
    return parts;
  }

  return highlightCode(remaining);
}

function highlightCode(text) {
  const tokens = text.split(/(\s+|[(){}[\],.:=+\-*/<>!%]|"[^"]*"|'[^']*'|\b\w+\b)/);
  return tokens.map((token, i) => {
    if (!token) return null;
    if (/^"[^"]*"$/.test(token) || /^'[^']*'$/.test(token))
      return <span key={i} style={{color: '#ce9178'}}>{token}</span>;
    if (/^\d+(\.\d+)?$/.test(token))
      return <span key={i} style={{color: '#b5cea8'}}>{token}</span>;
    if (KEYWORDS.includes(token))
      return <span key={i} style={{color: '#569cd6', fontWeight: '600'}}>{token}</span>;
    if (/^[(){}[\],.:=+\-*/<>!%]$/.test(token))
      return <span key={i} style={{color: '#d4d4d4'}}>{token}</span>;
    return <span key={i}>{token}</span>;
  });
}

export default function CodeEditorPanel({ code, currentLine }) {
  const lines = (code || "").split("\n");

  return (
    <div className="panel code-panel">
      <div className="panel-header">
        <span className="panel-header-icon">📝</span>
        Code Editor
        {currentLine && (
          <span style={{
            marginLeft: 'auto', fontSize: '10px',
            color: 'var(--accent)', background: 'var(--accent-glow)',
            padding: '2px 8px', borderRadius: '10px'
          }}>
            Line {currentLine}
          </span>
        )}
      </div>
      <div className="code-body">
        {lines.map((line, i) => (
          <div
            key={i}
            className={`code-line ${i + 1 === currentLine ? "active-line" : ""}`}
          >
            <span className="line-num">{i + 1}</span>
            <span className="code-text">{highlightLine(line)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}