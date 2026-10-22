from groq import Groq
import json
import os
import re
from dotenv import load_dotenv
from executor import execute_code

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

MODEL = "openai/gpt-oss-120b"
MAX_STEPS = 40

# Reliable beginner programs for the quick-topic chips (code only)
EXAMPLES = {
    "for loops": "total = 0\nfor i in range(5):\n    total = total + i\n    print(total)",
    "functions": "def add(a, b):\n    result = a + b\n    return result\n\nans = add(3, 4)\nprint(ans)",
    "if conditions": "score = 75\nif score >= 90:\n    grade = 'A'\nelif score >= 70:\n    grade = 'B'\nelse:\n    grade = 'C'\nprint(grade)",
    "lists": "fruits = ['apple', 'banana', 'mango']\nprint(fruits[0])\nfruits.append('orange')\nprint(len(fruits))\nfor fruit in fruits:\n    print(fruit)",
    "recursion": "def factorial(n):\n    if n == 1:\n        return 1\n    return n * factorial(n - 1)\n\nresult = factorial(4)\nprint(result)",
    "dictionaries": "student = {'name': 'Ali', 'age': 20}\nprint(student['name'])\nstudent['age'] = 21\nstudent['city'] = 'Lahore'\nprint(student)",
}

PROMPT_MAP = {
    "for loop": "for loops", "for loops": "for loops", "loop": "for loops", "loops": "for loops",
    "function": "functions", "functions": "functions", "def": "functions",
    "if condition": "if conditions", "if conditions": "if conditions",
    "if statement": "if conditions", "conditionals": "if conditions", "conditional": "if conditions",
    "list": "lists", "lists": "lists", "array": "lists",
    "recursion": "recursion", "recursive": "recursion", "factorial": "recursion",
    "dictionary": "dictionaries", "dictionaries": "dictionaries", "dict": "dictionaries",
}

DEFAULT_CODE = "x = 10\ny = 20\ntotal = x + y\nprint(total)"


def strip_fences(text: str) -> str:
    text = re.sub(r"```[a-zA-Z]*\s*", "", text)
    return text.replace("```", "").strip()


def ask_ai_for_code(prompt: str) -> str:
    """Ask the AI for plain beginner Python code only (no trace)."""
    try:
        response = client.chat.completions.create(
            model=MODEL,
            max_tokens=800,
            temperature=0.3,
            messages=[
                {"role": "system", "content": "You write tiny Python examples for first-week beginners. Reply with ONLY the Python code. No markdown, no explanation."},
                {"role": "user", "content": f"Write a simple Python example for: {prompt}\n\nRules: max 8 lines, no imports, no classes, no input(), no regex. Use variables, print(), basic math, if/else, for/while loops, lists, dictionaries or simple functions. It must print something."},
            ],
        )
        return strip_fences(response.choices[0].message.content)
    except Exception:
        return ""


def get_code(prompt: str) -> str:
    key = PROMPT_MAP.get(prompt.lower().strip())
    if key:
        return EXAMPLES[key]
    code = ask_ai_for_code(prompt)
    return code if code else DEFAULT_CODE


def fallback_explanation(line_text: str, is_final: bool):
    """Rule-based explanation used when the AI is unavailable."""
    t = line_text.strip()
    if is_final:
        return ("The program has finished. The console now shows everything it printed.",
                "Like reading the final receipt after shopping.", ["Output"])
    if t.startswith("def "):
        return ("This defines a function. Python remembers it but does not run it yet.",
                "Like writing a recipe on a card before cooking.", ["Function Definition"])
    if t.startswith("for "):
        return ("This starts a for loop. Python takes the next value and stores it in the loop variable.",
                "Like going through a list of tasks one by one.", ["for loop", "Iteration"])
    if t.startswith("while "):
        return ("Python checks the while condition. If it is True, the loop body runs again.",
                "Like repeating a task until a goal is reached.", ["while loop", "Condition"])
    if t.startswith(("if ", "elif ", "else")):
        return ("Python checks this condition to decide which block of code runs.",
                "Like choosing a path at a fork in the road.", ["Conditional"])
    if t.startswith("return"):
        return ("The function sends a value back to the place that called it.",
                "Like handing back the finished dish to the customer.", ["return"])
    if "print(" in t:
        return ("print() sends a value to the console so you can see it.",
                "Like reading a result out loud.", ["print()", "Output"])
    if "=" in t:
        return ("This line stores a value in a variable, creating or updating it in memory.",
                "Like putting something in a labeled box.", ["Variable Assignment"])
    return ("Python runs this line.", "", [])


def generate_explanations(code: str, exec_result: dict) -> dict:
    steps = exec_result.get("steps", [])
    if not steps:
        return exec_result

    lines = code.split("\n")

    def line_of(step):
        n = step["lineNumber"]
        return lines[n - 1] if 0 < n <= len(lines) else ""

    def is_final(i):
        return i > 0 and i == len(steps) - 1 and steps[i]["lineNumber"] == steps[i - 1]["lineNumber"]

    summary = []
    for i, s in enumerate(steps):
        summary.append({
            "step": i,
            "lineAboutToRun": line_of(s).strip(),
            "isFinalStep": is_final(i),
            "variables": {v["name"]: v["value"] for v in s["stack"]},
            "consoleOutput": s["consoleOutput"][-80:],
        })

    ai_map = {}
    try:
        response = client.chat.completions.create(
            model=MODEL,
            max_tokens=3500,
            temperature=0.3,
            messages=[
                {"role": "system", "content": (
                    "You are a Python tutor for absolute beginners. Each step shows program state just BEFORE the given line runs. "
                    "Explain what that line is about to do, in 1-2 plain sentences. If isFinalStep is true, say the program finished and what was printed. "
                    "Give a short real-world analogy and 1-3 concept tags. No LaTeX. "
                    "Return ONLY a JSON array, no markdown: "
                    '[{"step":0,"explanation":"...","analogy":"...","conceptTags":["..."]}]'
                )},
                {"role": "user", "content": f"Code:\n{code}\n\nSteps:\n{json.dumps(summary)}"},
            ],
        )
        raw = strip_fences(response.choices[0].message.content)
        start, end = raw.find("["), raw.rfind("]")
        if start != -1 and end != -1:
            raw = re.sub(r",(\s*[}\]])", r"\1", raw[start:end + 1])
            for item in json.loads(raw):
                ai_map[int(item["step"])] = item
    except Exception:
        ai_map = {}

    for i, step in enumerate(steps):
        item = ai_map.get(i)
        if item and item.get("explanation"):
            step["explanation"] = item["explanation"]
            step["analogy"] = item.get("analogy", "")
            step["conceptTags"] = item.get("conceptTags", [])
        else:
            exp, ana, tags = fallback_explanation(line_of(step), is_final(i))
            step["explanation"], step["analogy"], step["conceptTags"] = exp, ana, tags

    return exec_result


def generate_trace(prompt: str) -> dict:
    """Prompt-Based Mode: pick code, run it for real, then explain it."""
    code = get_code(prompt)
    result = execute_code(code)

    # If the AI's code failed or produced nothing, use the safe default
    if result.get("error") or not result.get("steps"):
        code = DEFAULT_CODE
        result = execute_code(code)

    result["steps"] = result["steps"][:MAX_STEPS]
    return generate_explanations(code, result)