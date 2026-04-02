import json
import os
import re
from datetime import datetime
from typing import Any, Dict, List, Optional

from flask import Flask, jsonify, render_template, request
from google import genai
from google.genai.types import GenerateContentConfig, GoogleSearch, HttpOptions, Tool

app = Flask(__name__)

PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT")
LOCATION = os.environ.get("GOOGLE_CLOUD_LOCATION", "global")
MODEL_NAME = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")

if not PROJECT_ID:
    raise RuntimeError(
        "Thiếu GOOGLE_CLOUD_PROJECT. "
        "Hãy set GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION=global, "
        "GOOGLE_GENAI_USE_VERTEXAI=True trước khi chạy app."
    )

client = genai.Client(
    vertexai=True,
    project=PROJECT_ID,
    location=LOCATION,
    http_options=HttpOptions(api_version="v1"),
)


def validate_date(date_str: str) -> str:
    try:
        datetime.strptime(date_str, "%Y-%m-%d")
        return date_str
    except ValueError as exc:
        raise ValueError("Ngày phải đúng định dạng YYYY-MM-DD. Ví dụ: 2026-04-02") from exc


def normalize_topic(topic: Optional[str]) -> str:
    return (topic or "").strip()


def build_prompt(date_str: str, topic: str, language: str = "vi") -> str:
    topic_text = (
        f'Chủ đề người dùng yêu cầu: "{topic}".'
        if topic
        else "Người dùng không nhập chủ đề cụ thể. Hãy ưu tiên các tin nổi bật nhất."
    )

    if language == "en":
        lang_instruction = "Respond in English."
    else:
        lang_instruction = "Trả lời bằng tiếng Việt."

    return f"""
Bạn là News Research Agent.

Nhiệm vụ:
1. Tìm tin tức mới nhất dựa trên ngày người dùng nhập.
2. Nếu có chủ đề, chỉ chọn các tin liên quan chặt chẽ đến chủ đề đó.
3. Nếu không có đủ tin đúng ngày, hãy lấy các tin gần nhất và nói rõ điều đó.
4. Ưu tiên nguồn đáng tin cậy, có ngày đăng rõ ràng.
5. Không bịa tiêu đề, không bịa nguồn, không bịa ngày.
6. {lang_instruction}

Đầu vào:
- Ngày yêu cầu: {date_str}
- {topic_text}

Chỉ trả về JSON hợp lệ, không thêm markdown, không thêm giải thích ngoài JSON.

Schema JSON:
{{
  "requested_date": "YYYY-MM-DD",
  "topic": "string",
  "effective_date_note": "string",
  "summary": "string",
  "news": [
    {{
      "title": "string",
      "source": "string",
      "published_date": "string",
      "why_relevant": "string",
      "summary": "string"
    }}
  ],
  "follow_up_suggestions": ["string", "string", "string"]
}}

Ràng buộc:
- news từ 3 đến 5 mục.
- summary là tóm tắt xu hướng chung.
- why_relevant giải thích ngắn vì sao tin phù hợp với ngày/chủ đề.
- Nếu topic rỗng thì để "topic": "".
"""


def extract_json(text: str) -> Dict[str, Any]:
    text = text.strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    fenced = re.search(r"```json\s*(\{.*\})\s*```", text, re.DOTALL)
    if fenced:
        return json.loads(fenced.group(1))

    brace_match = re.search(r"(\{.*\})", text, re.DOTALL)
    if brace_match:
        return json.loads(brace_match.group(1))

    raise ValueError("Không parse được JSON từ phản hồi của model.")


def extract_grounding_sources(response: Any) -> List[Dict[str, str]]:
    results: List[Dict[str, str]] = []

    try:
        candidates = getattr(response, "candidates", None) or []
        if not candidates:
            return results

        grounding_metadata = getattr(candidates[0], "grounding_metadata", None)
        if not grounding_metadata:
            return results

        chunks = getattr(grounding_metadata, "grounding_chunks", None) or []
        for chunk in chunks:
            web = getattr(chunk, "web", None)
            if web:
                results.append(
                    {
                        "title": getattr(web, "title", "") or "",
                        "uri": getattr(web, "uri", "") or "",
                    }
                )
    except Exception:
        return results

    unique_results = []
    seen = set()
    for item in results:
        key = (item.get("title", ""), item.get("uri", ""))
        if key not in seen:
            seen.add(key)
            unique_results.append(item)

    return unique_results


def run_news_agent(date_str: str, topic: str, language: str = "vi") -> Dict[str, Any]:
    prompt = build_prompt(date_str=date_str, topic=topic, language=language)

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=GenerateContentConfig(
            tools=[
                Tool(google_search=GoogleSearch())
            ]
        ),
    )

    parsed = extract_json(response.text)
    parsed["grounding_sources"] = extract_grounding_sources(response)
    parsed["model"] = MODEL_NAME
    return parsed


@app.get("/")
def index() -> Any:
    return render_template("index.html")


@app.get("/health")
def health() -> Any:
    return jsonify(
        {
            "message": "News Research Agent backend is running.",
            "project": PROJECT_ID,
            "location": LOCATION,
            "model": MODEL_NAME,
        }
    )


@app.post("/api/news")
def news_api() -> Any:
    try:
        payload = request.get_json(silent=True) or {}

        raw_date = (payload.get("date") or "").strip()
        raw_topic = payload.get("topic")
        language = (payload.get("language") or "vi").strip().lower()

        if not raw_date:
            return jsonify({"error": "Thiếu trường 'date'."}), 400

        date_str = validate_date(raw_date)
        topic = normalize_topic(raw_topic)

        result = run_news_agent(date_str=date_str, topic=topic, language=language)
        return jsonify(result), 200

    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        return jsonify(
            {
                "error": "Có lỗi khi xử lý yêu cầu.",
                "details": str(exc),
            }
        ), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=True)