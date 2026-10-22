from flask import Flask, request, jsonify
from flask_cors import CORS
from executor import execute_code
from llm_service import generate_trace, generate_explanations
import os

app = Flask(__name__)
ALLOWED = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
CORS(app, origins=ALLOWED)
@app.route("/health")
def health():
    return jsonify({"status": "ok"})

@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()
    prompt = data.get("prompt", "").strip()
    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400
    try:
        trace = generate_trace(prompt)
        return jsonify(trace)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/execute", methods=["POST"])
def execute():
    data = request.get_json()
    code = data.get("code", "").strip()
    if not code:
        return jsonify({"error": "Code is required"}), 400
    try:
        exec_result = execute_code(code)
        exec_result = generate_explanations(code, exec_result)
        return jsonify(exec_result)
    except TimeoutError:
        return jsonify({"error": "Execution timed out"}), 408
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
