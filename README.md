# News Research Agent

> **AI-powered news research assistant** sử dụng Google Gemini + Google Search Grounding để tìm kiếm, tổng hợp và phân tích tin tức theo thời gian thực.

![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.1.0-000000?logo=flask&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?logo=google&logoColor=white)
![Vertex AI](https://img.shields.io/badge/Vertex_AI-Enabled-34A853?logo=googlecloud&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## Giới thiệu

**News Research Agent** là một ứng dụng web giúp người dùng nghiên cứu tin tức một cách thông minh. Thay vì phải đọc hàng chục bài báo, agent sẽ:

- **Tìm kiếm** tin tức từ nhiều nguồn đáng tin cậy qua Google Search
- **Phân tích & Tổng hợp** nội dung bằng mô hình Gemini 2.5 Flash
- **Trả về kết quả có cấu trúc** dưới dạng JSON với tiêu đề, nguồn, ngày đăng và lý do liên quan
- **Gợi ý theo dõi** các chủ đề liên quan để nghiên cứu sâu hơn

## Tính năng chính

| Tính năng | Mô tả |
|---|---|
| Google Search Grounding | Tìm kiếm tin tức real-time từ Internet, không phải dữ liệu huấn luyện cũ |
| Prompt Engineering | Prompt được thiết kế chi tiết để đảm bảo kết quả chính xác, có nguồn dẫn |
| Đa ngôn ngữ | Hỗ trợ Tiếng Việt và Tiếng Anh |
| Tra cứu theo ngày | Cho phép chọn ngày cụ thể để tìm tin tức |
| Lọc theo chủ đề | Tìm tin theo chủ đề cụ thể hoặc xem tin nổi bật |
| Nguồn dẫn minh bạch | Hiển thị grounding sources - các URL nguồn tin gốc |
| Giao diện Cyberpunk | UI hiện đại với hiệu ứng neon, animation và dark mode |

## Kiến trúc hệ thống

```
┌─────────────────┐     HTTP POST      ┌──────────────────┐
│                  │  ───────────────▶  │                  │
│   Frontend UI    │   /api/news        │   Flask Backend  │
│   (HTML/CSS/JS)  │  ◀───────────────  │   (app.py)       │
│                  │     JSON Response  │                  │
└─────────────────┘                    └────────┬─────────┘
                                                │
                                                │ Google GenAI SDK
                                                │ (Vertex AI)
                                                ▼
                                       ┌──────────────────┐
                                       │  Gemini 2.5 Flash│
                                       │  + Google Search  │
                                       │    Grounding      │
                                       └──────────────────┘
```

## Cấu trúc dự án

```
news-research-agent/
├── app.py                 # Backend Flask - logic chính của agent
├── requirements.txt       # Các thư viện Python cần thiết
├── Dockerfile             # Cấu hình Docker để deploy
├── .dockerignore          # Các file Docker bỏ qua
├── .env                   # Biến môi trường (không commit)
├── templates/
│   └── index.html         # Trang HTML chính
└── static/
    ├── style.css           # Stylesheet với theme Cyberpunk
    ├── app.js              # Logic frontend JavaScript
    └── vlu.png             # Logo trường
```

## Hướng dẫn cài đặt

### Yêu cầu

- **Python** 3.11+
- **Google Cloud Project** đã bật [Vertex AI API](https://console.cloud.google.com/apis/library/aiplatform.googleapis.com)
- **Google Cloud CLI** đã xác thực (`gcloud auth application-default login`)

### Bước 1: Clone dự án

```bash
git clone https://github.com/huyryan220806/news-research-agent.git
cd news-research-agent
```

### Bước 2: Tạo môi trường ảo

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
```

### Bước 3: Cài đặt thư viện

```bash
pip install -r requirements.txt
```

### Bước 4: Cấu hình biến môi trường

Tạo file `.env` hoặc set biến môi trường:

```env
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=global
GOOGLE_GENAI_USE_VERTEXAI=True
GEMINI_MODEL=gemini-2.5-flash
```

> [!IMPORTANT]
> Bạn cần xác thực Google Cloud trước khi chạy:
> ```bash
> gcloud auth application-default login
> gcloud config set project your-project-id
> ```

### Bước 5: Chạy ứng dụng

```bash
python app.py
```

Truy cập: **http://localhost:8080**

## Deploy với Docker

```bash
# Build image
docker build -t news-research-agent .

# Chạy container
docker run -p 8080:8080 \
  -e GOOGLE_CLOUD_PROJECT=your-project-id \
  -e GOOGLE_CLOUD_LOCATION=global \
  -e GOOGLE_GENAI_USE_VERTEXAI=True \
  news-research-agent
```

## API Reference

### `POST /api/news`

Tìm kiếm và tổng hợp tin tức.

**Request Body:**

```json
{
  "date": "2026-04-06",
  "topic": "artificial intelligence",
  "language": "vi"
}
```

| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `date` | string | Có | Ngày tìm tin (YYYY-MM-DD) |
| `topic` | string | Không | Chủ đề cần tìm (để trống = tin nổi bật) |
| `language` | string | Không | Ngôn ngữ phản hồi: `vi` (mặc định) hoặc `en` |

**Response (200 OK):**

```json
{
  "requested_date": "2026-04-06",
  "topic": "artificial intelligence",
  "effective_date_note": "Tin tức ngày 06/04/2026",
  "summary": "Tóm tắt xu hướng chung...",
  "news": [
    {
      "title": "Tiêu đề bài báo",
      "source": "Tên nguồn",
      "published_date": "2026-04-06",
      "why_relevant": "Lý do tin này liên quan",
      "summary": "Tóm tắt nội dung"
    }
  ],
  "follow_up_suggestions": [
    "Gợi ý 1",
    "Gợi ý 2",
    "Gợi ý 3"
  ],
  "grounding_sources": [
    {
      "title": "Tiêu đề nguồn",
      "uri": "https://example.com/article"
    }
  ],
  "model": "gemini-2.5-flash"
}
```

### `GET /health`

Kiểm tra trạng thái backend.

**Response:**

```json
{
  "message": "News Research Agent backend is running.",
  "project": "your-project-id",
  "location": "global",
  "model": "gemini-2.5-flash"
}
```

## Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| **Backend** | Python, Flask |
| **AI Model** | Google Gemini 2.5 Flash (via Vertex AI) |
| **Search** | Google Search Grounding |
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla) |
| **Deployment** | Docker, Gunicorn |
| **SDK** | `google-genai` (Google Gen AI SDK) |

## Cách hoạt động

1. **Người dùng nhập** ngày, chủ đề (tuỳ chọn) và ngôn ngữ
2. **Backend xây dựng prompt** với persona, nhiệm vụ, schema JSON và ràng buộc
3. **Gemini + Google Search** tìm kiếm tin tức real-time trên Internet
4. **Model phân tích** và trả về JSON có cấu trúc với 3-5 tin tức
5. **Backend trích xuất** grounding sources từ metadata của response
6. **Frontend hiển thị** kết quả với giao diện trực quan

## Tác giả

**Nguyễn Đình Huy** — Sinh viên Đại học Văn Lang (VLU)

- GitHub: [@huyryan220806](https://github.com/huyryan220806)

---

<p align="center">
  Made with Google Gemini & Vertex AI
</p>