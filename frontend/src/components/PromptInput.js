export default function PromptInput({ value, onChange, onSubmit, isLoading }) {
  return (
    <div className="prompt-row">
      <input
        className="prompt-input"
        type="text"
        placeholder='e.g. "Show me how a for loop works"'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        disabled={isLoading}
      />
      <button
        className="btn-generate"
        onClick={onSubmit}
        disabled={isLoading || !value.trim()}
      >
        {isLoading ? "Loading..." : "Generate"}
      </button>
    </div>
  );
} 