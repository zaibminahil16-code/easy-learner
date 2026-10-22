import { useState } from "react";
import TopBar from "./components/TopBar";
import ModeSelector from "./components/ModeSelector";
import PromptInput from "./components/PromptInput";
import ChipRow from "./components/ChipRow";
import CodeEditorPanel from "./components/CodeEditorPanel";
import MemoryPanel from "./components/MemoryPanel";
import ConsolePanel from "./components/ConsolePanel";
import ExplanationPanel from "./components/ExplanationPanel";
import NavigationControls from "./components/NavigationControls";
import { generateTrace, executeCode } from "./services/api";
import "./App.css";

export default function App() {
  const [mode, setMode] = useState("prompt");
  const [prompt, setPrompt] = useState("");
  const [userCode, setUserCode] = useState("");
  const [trace, setTrace] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const step = trace
  ? trace.steps[mode === "practice" ? trace.steps.length - 1 : currentStep]
  : null;

  const handleGenerate = async () => {
    if (mode === "prompt" && !prompt.trim()) return;
    if (mode === "custom" && !userCode.trim()) return;

    setIsLoading(true);
    setError(null);
    setCurrentStep(0);
    setTrace(null);

    try {
      let result;
      if (mode === "prompt" || mode === "practice") {
        result = await generateTrace(prompt);
      } else {
        result = await executeCode(userCode);
      }
      setTrace(result);
    } catch (err) {
      setError(
        err.response?.data?.error || "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (trace && currentStep < trace.steps.length - 1)
      setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="app">
      <TopBar />
      <ModeSelector mode={mode} onSelect={setMode} />

      <div className="prompt-area">
        {(mode === "prompt" || mode === "practice") && (
          <>
            <PromptInput
              value={prompt}
              onChange={setPrompt}
              onSubmit={handleGenerate}
              isLoading={isLoading}
            />
            <ChipRow onSelect={setPrompt} />
          </>
        )}

        {mode === "custom" && (
          <div className="custom-code-area">
            <textarea
              className="code-textarea"
              placeholder="Write your Python code here..."
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              rows={4}
            />
            <button
              className="btn-generate"
              onClick={handleGenerate}
              disabled={isLoading || !userCode.trim()}
            >
              {isLoading ? "Running..." : "▶ Run Code"}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button className="error-close" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {isLoading && (
        <div className="loading-bar">
          <div className="loading-spinner"></div>
          AI is generating your explanation...
        </div>
      )}

      {trace ? (
        <>
          <div className="panels-grid">
            <CodeEditorPanel
              code={trace.code}
              currentLine={mode === "practice" ? null : step?.lineNumber}
            />
            <MemoryPanel
              stack={step?.stack || []}
              heap={step?.heap || []}
            />
            <ExplanationPanel
              explanation={step?.explanation}
              analogy={step?.analogy}
              tags={step?.conceptTags}
              allSteps={mode === "practice" ? trace.steps : null}
            />
            <ConsolePanel
              output={step?.consoleOutput}
              error={trace.error}
            />
          </div>
          {mode !== "practice" && trace && (
  <NavigationControls
    current={currentStep}
    total={trace.steps.length}
    onNext={handleNext}
    onPrev={handlePrev}
  />
)}

        
        </>
      ) : (
        !isLoading && (
          <div className="welcome-screen">
            <div className="welcome-icon">🐍</div>
            <h2>Welcome to Easy Learner</h2>
            <p>
              Learn Python step by step with AI-powered explanations
              and real-time memory visualization.
            </p>
            <div className="welcome-steps">
              <div className="welcome-step">
                <div className="welcome-step-icon">💬</div>
                <div className="welcome-step-title">Type a Topic</div>
                <div className="welcome-step-desc">
                  Ask about any Python concept in plain English
                </div>
              </div>
              <div className="welcome-step">
                <div className="welcome-step-icon">🧠</div>
                <div className="welcome-step-title">See Memory</div>
                <div className="welcome-step-desc">
                  Watch variables appear and change in real time
                </div>
              </div>
              <div className="welcome-step">
                <div className="welcome-step-icon">💡</div>
                <div className="welcome-step-title">Understand</div>
                <div className="welcome-step-desc">
                  Get plain English explanations for every step
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}  
