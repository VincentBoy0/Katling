# Backend — Cấu trúc và hướng dẫn ngắn

**Mô tả ngắn**

Thư mục `backend/` chứa phần API và logic server của ứng dụng (models, database, schemas, repository, cấu hình, và tích hợp Firebase).

---

## 📁 Cấu trúc thư mục (tóm tắt)

- `envStyle.txt` — mẫu khai báo biến môi trường (dùng để tạo `.env`).
- `requirements.txt` — danh sách phụ thuộc Python.
- `serviceAccountKey.json` — khóa service account cho Firebase (KHÔNG commit vào VCS nếu chứa bí mật).

- `app/`
  - `__init__.py`
  - `main.py` — entrypoint của ứng dụng
  - `api/` — các endpoint API
    - `login.py` — login endpoints
    - `role.py` — role endpoints
    - `test.py` — test/example endpoints
    - `user.py` — user-related endpoints
  - `core/` — cấu hình & helpers
    - `config.py` — đọc biến môi trường / cấu hình ứng dụng
    - `firebase.py` — helper kết nối Firebase
    - `security.py` — hàm bảo mật (hash token...)
  - `database/` — cấu trúc DB
    - `base.py`
    - `session.py`
  - `models/` — ORM models (ví dụ: `user.py`)
  - `repositories/` — logic truy cập dữ liệu (ví dụ: `userRepository.py`)
  - `schemas/` — Pydantic schemas (ví dụ: `user.py`)

---

## 🔧 Hướng dẫn tạo file `.env`

Vui lòng **tạo file `.env` trong thư mục `backend/`** có cấu trúc giống `envStyle.txt` và điền các giá trị thật (host, username, password, secret key, v.v.).

- Nội dung mẫu (`envStyle.txt`):

```
DATABASE_HOSTNAME=
DATABASE_PORT=
DATABASE_PASSWORD=
DATABASE_NAME=
DATABASE_USERNAME=
SECRET_KEY=
ALGORITHM=
ACCESS_TOKEN_EXPIRE_MINUTES=
API_V1_STR=
```

- Trên Windows (cmd):
```
copy envStyle.txt .env
```
- Trên macOS/Linux:
```
cp envStyle.txt .env
```

> **Lưu ý:** KHÔNG commit file `.env` chứa secrets lên Git. Nếu chưa có, hãy thêm `.env` vào `.gitignore` hoặc tạo `.env.example` (không chứa giá trị thực).

---

## 🔁 Git workflow (tóm tắt)

**Luồng làm việc đề xuất:**

1. **Tạo branch mới từ `main` (hoặc `develop`)**:
```bash
git fetch origin
git checkout -b feature/your-feature
```

2. **Làm việc & commit** — commit nhỏ, message rõ ràng.

3. **Cập nhật branch trước khi push (rebase)**:
```bash
git fetch origin
git rebase origin/main
# hoặc
git pull --rebase origin main
```

4. **Push branch lên remote**:
```bash
git push -u origin feature/your-feature
```

5. **Tạo Pull Request (PR)** — chọn base `main`, mô tả thay đổi, thêm reviewers, chờ CI pass.

6. **Nếu cần cập nhật PR** — rebase trên `main`, giải xung đột, sau đó force-push an toàn:
```bash
git fetch origin
git rebase origin/main
# resolve conflicts if any
git push --force-with-lease
```

7. **Sau khi PR được merge** — xóa branch remote & local:
```bash
git push origin --delete feature/your-feature
git branch -d feature/your-feature
```

**Tips:**
- Dùng tiền tố branch rõ ràng: `feature/`, `fix/`, `chore/`.
- Rebase giữ lịch sử sạch; chọn merge nếu muốn giữ lịch sử non-linear.
- Dùng `--force-with-lease` để an toàn khi force-push.

---
