# English Learning Web (Katling)

**Mô tả ngắn:** Dự án web này gồm một frontend (UI) và một backend (API). Frontend dùng Vite (React), backend là một service Python chứa API, cấu hình, kết nối database và tích hợp Firebase.

---

## 📁 Cấu trúc dự án

```text
/ (repo root)
├── backend/                # Backend (API, cấu hình, models, repositories)
│   ├── envStyle.txt        # mẫu biến môi trường (dùng để tạo .env)
│   ├── requirements.txt    # dependencies Python
│   ├── serviceAccountKey.json # Firebase service key (sensitive)
│   └── app/
│       ├── main.py         # entrypoint của ứng dụng
│       ├── api/            # các endpoint (login, user, role, test)
│       ├── core/           # config, firebase helper, security
│       ├── database/       # base, session
│       ├── models/         # ORM models (user.py...)
│       ├── repositories/   # data access logic
│       └── schemas/        # Pydantic schemas

├── frontend/               # Frontend (Vite + React)
│   ├── package.json
│   ├── index.html
│   ├── src/                # App components, `main.jsx`, `App.jsx`, styles
│   └── public/

├── README.md               # (file này) mô tả & hướng dẫn nhanh
└── .gitignore
```

---

## 🔧 Hướng dẫn nhanh

- Backend:
  - Tạo và kích hoạt virtualenv (Windows PowerShell):
    ```powershell
    python -m venv venv
    .\venv\Scripts\Activate.ps1
    pip install -r backend/requirements.txt
    ```
  - Tạo file `.env` trong `backend/` theo `envStyle.txt` (ví dụ: `copy backend\envStyle.txt backend\.env` trên Windows).
  - Chạy (nếu sử dụng Uvicorn/FastAPI):
    ```powershell
    uvicorn app.main:app --reload --app-dir backend/app
    ```

- Frontend:
  - Cài dependencies và chạy dev server:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

---

## ⚠️ Lưu ý bảo mật

- KHÔNG commit file `backend/.env` chứa secrets. Tạo `backend/.env.example` (không chứa giá trị thực) để commit nếu cần.
- Thêm `.env` vào `.gitignore` nếu chưa có.

---

Nếu bạn muốn, tôi có thể:
- tạo `backend/.env.example` từ `envStyle.txt`, hoặc
- thêm `/.env` vào `.gitignore` cho bạn.

