export default function MemoryPanel({ stack, heap }) {
  return (
    <div className="panel memory-panel">
      <div className="panel-header">
        <span className="panel-header-icon">🧠</span>
        Memory Visualization
      </div>
      <div className="memory-body">
        <p className="section-label">Stack</p>
        {stack.length === 0 ? (
          <p className="empty-msg">No variables yet</p>
        ) : (
          <table className="mem-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Value</th>
                <th>Type</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {stack.map((v, i) => (
                <tr
                  key={i}
                  className={
                    v.isNew ? "var-new" :
                    v.isModified ? "var-modified" : ""
                  }
                >
                  <td><strong>{v.name}</strong></td>
                  <td style={{fontFamily: 'JetBrains Mono, monospace'}}>
                    {String(v.value).length > 30
                      ? String(v.value).slice(0, 30) + "..."
                      : String(v.value)}
                  </td>
                  <td>
                    <span style={{
                      background: 'var(--surface3)',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      color: 'var(--accent2)'
                    }}>
                      {v.type}
                    </span>
                  </td>
                  <td style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '11px',
                    color: 'var(--text3)'
                  }}>
                    {v.address}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p className="section-label">Heap</p>
        {heap.length === 0 ? (
          <p className="empty-msg">No heap objects at this step</p>
        ) : (
          heap.map((obj, i) => (
            <div key={i} className="heap-obj">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '4px'
              }}>
                <span style={{
                  background: 'var(--accent2)',
                  color: 'var(--bg)',
                  padding: '1px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: '700',
                  textTransform: 'uppercase'
                }}>
                  {obj.type}
                </span>
                <span style={{
                  fontSize: '11px',
                  color: 'var(--text3)',
                  fontFamily: 'JetBrains Mono, monospace'
                }}>
                  {obj.address}
                </span>
              </div>
              <span className="heap-contents">
                {String(obj.contents).length > 60
                  ? String(obj.contents).slice(0, 60) + "..."
                  : obj.contents}
              </span>
            </div>
          ))
        )}

        {stack.length > 0 && (
          <div className="mem-legend">
            <div className="legend-item">
              <div className="legend-dot new"></div>
              New variable
            </div>
            <div className="legend-item">
              <div className="legend-dot modified"></div>
              Modified
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
