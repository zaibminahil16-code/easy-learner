const TOPICS = [
  "for loops",
  "functions",
  "if conditions",
  "recursion",
  "lists",
  "dictionaries",
];

export default function ChipRow({ onSelect }) {
  return (
    <div className="chip-row">
      <span className="chip-label">Quick Topics:</span>
      {TOPICS.map((topic) => (
        <button
          key={topic}
          className="chip"
          onClick={() => onSelect(topic)}
        >
          {topic}
        </button>
      ))}
    </div>
  );
} 