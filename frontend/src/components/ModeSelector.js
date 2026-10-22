export default function ModeSelector({ mode, onSelect }) {
  return (
    <div className="mode-selector">
      <button
        className={`mode-tab ${mode === "prompt" ? "active" : ""}`}
        onClick={() => onSelect("prompt")}
      >
        Prompt-Based Mode
      </button>
      <button
        className={`mode-tab ${mode === "custom" ? "active" : ""}`}
        onClick={() => onSelect("custom")}
      >
        Custom Code Mode
      </button>
      <button
        className={`mode-tab ${mode === "practice" ? "active" : ""}`}
        onClick={() => onSelect("practice")}
      >
        Practice Mode
      </button>
    </div>
  );
} 