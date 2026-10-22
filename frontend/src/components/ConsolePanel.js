export default function ConsolePanel({ output, error }) {
  return (
    <div className="panel console-panel">
      <div className="panel-header">
        <span className="panel-header-icon">⌨️</span>
        Console Output
      </div>
      <pre className="console-body">
        {error ? (
          <span className="console-error">{error}</span>
        ) : output ? (
          output
        ) : (
          <span className="console-empty">
            No output yet...
          </span>
        )}
      </pre>
    </div>
  );
} 