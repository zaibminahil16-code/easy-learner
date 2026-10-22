import sys
import io
import threading
import copy


def make_safe_builtins():
    return {
        "print": print,
        "range": range,
        "len": len,
        "int": int,
        "str": str,
        "float": float,
        "list": list,
        "dict": dict,
        "set": set,
        "tuple": tuple,
        "bool": bool,
        "enumerate": enumerate,
        "zip": zip,
        "min": min,
        "max": max,
        "sum": sum,
        "abs": abs,
        "sorted": sorted,
        "reversed": reversed,
        "type": type,
        "isinstance": isinstance,
        "map": map,
        "filter": filter,
        "any": any,
        "all": all,
        "round": round,
        "pow": pow,
        "input": lambda prompt="": "5",
    }


def execute_code(code: str, timeout: int = 5) -> dict:
    steps = []
    error = None
    captured_output = {"text": ""}
    prev_vars = {}

    class CapturingStdout(io.StringIO):
        def write(self, s):
            captured_output["text"] += s
            return super().write(s)

    old_stdout = sys.stdout
    sys.stdout = CapturingStdout()

    def trace_calls(frame, event, arg):
        # Only trace the user's code
        if frame.f_code.co_filename != "<user_code>":
            return None

        if event == "line":
            stack = []
            heap = []

            for name, value in list(frame.f_locals.items()):
                if name.startswith("__"):
                    continue
                if callable(value):
                    continue
                try:
                    addr = hex(id(value))
                    text = repr(value)
                    is_container = isinstance(value, (list, dict, set, tuple))

                    if is_container:
                        heap.append({
                            "address": addr,
                            "type": type(value).__name__,
                            "contents": text[:80],
                        })

                    stack.append({
                        "name": name,
                        "value": f"ref -> {addr}" if is_container else text[:60],
                        "type": type(value).__name__,
                        "address": addr,
                        "isNew": name not in prev_vars,
                        "isModified": name in prev_vars and prev_vars[name] != text,
                    })
                    prev_vars[name] = text
                except Exception:
                    continue

            steps.append({
                "lineNumber": frame.f_lineno,
                "stack": stack,
                "heap": heap,
                "consoleOutput": captured_output["text"],
                "explanation": "",
                "analogy": "",
                "conceptTags": [],
            })

        return trace_calls

    def run():
        nonlocal error
        try:
            sys.settrace(trace_calls)
            user_globals = {"__builtins__": make_safe_builtins()}
            compiled = compile(code, "<user_code>", "exec")
            exec(compiled, user_globals)
        except Exception as e:
            error = f"{type(e).__name__}: {str(e)}"
        finally:
            sys.settrace(None)

    t = threading.Thread(target=run, daemon=True)
    t.start()
    t.join(timeout)

    sys.stdout = old_stdout

    if t.is_alive():
        raise TimeoutError("Code execution exceeded 5 second limit")

    # Add a final step so the last line's output is visible
    if steps and captured_output["text"] != steps[-1]["consoleOutput"]:
        final = copy.deepcopy(steps[-1])
        final["consoleOutput"] = captured_output["text"]
        for v in final["stack"]:
            v["isNew"] = False
            v["isModified"] = False
        steps.append(final)

    steps = deduplicate_steps(steps)

    return {"code": code, "steps": steps, "error": error}


def deduplicate_steps(steps):
    """Remove consecutive steps where nothing changed"""
    if not steps:
        return steps
    result = [steps[0]]
    for curr, prev in zip(steps[1:], steps):
        same_line = curr["lineNumber"] == prev["lineNumber"]
        same_stack = [(v["name"], v["value"]) for v in curr["stack"]] == \
                     [(v["name"], v["value"]) for v in prev["stack"]]
        same_output = curr["consoleOutput"] == prev["consoleOutput"]
        if not (same_line and same_stack and same_output):
            result.append(curr)
    return result 