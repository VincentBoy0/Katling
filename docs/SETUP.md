# 🚀 Setup Guide

This document provides detailed instructions for setting up the Katling development environment.

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#prerequisites">Prerequisites</a></li>
    <li><a href="#-quick-start-with-docker-recommended">Quick Start with Docker</a></li>
    <li>
      <a href="#-manual-setup">Manual Setup</a>
      <ul>
        <li><a href="#backend-setup">Backend Setup</a></li>
        <li><a href="#frontend-setup">Frontend Setup</a></li>
      </ul>
    </li>
    <li><a href="#-environment-variables">Environment Variables</a></li>
    <li><a href="#️-database-setup">Database Setup</a></li>
    <li><a href="#-firebase-setup">Firebase Setup</a></li>
    <li><a href="#-troubleshooting">Troubleshooting</a></li>
    <li><a href="#-additional-resources">Additional Resources</a></li>
  </ol>
</details>

---

## Prerequisites

### For Docker Setup (Recommended)

- **Docker** (v20.10+)
- **Docker Compose** (v2.0+)

### For Manual Setup

- **Python 3.11+**
- **Node.js 18+** (with npm)
- **PostgreSQL 15+**
- **Git**

---

## 🐳 Quick Start with Docker (Recommended)

Docker provides the fastest way to get Katling up and running with all dependencies configured.

### Step 1: Clone the Repository

```bash
git clone https://github.com/VincentBoy0/Katling.git
cd katling
```

### Step 2: Configure Environment Variables

1. **Backend Configuration**

   Copy the example environment file and fill in your values:

   ```bash
   cp backend/.env.example backend/.env
   ```

   Edit `backend/.env` with your configuration (see [Environment Variables](#-environment-variables) section).

2. **Frontend Configuration**

   Create `frontend/.env`:

   ```bash
   cp frontend/.env.example frontend/.env
   ```

   Configure Firebase in `frontend/src/config/firebase.ts` (copy from example file).

### Step 3: Build and Start Containers

```bash
docker-compose up --build
```

This command will:

- Build the backend and frontend Docker images
- Start PostgreSQL database
- Run database migrations automatically
- Start the backend API server
- Start the frontend development server

### Step 4: Access the Application

| Service     | URL                         |
| ----------- | --------------------------- |
| Frontend    | http://localhost:5173       |
| Backend API | http://localhost:8000       |
| API Docs    | http://localhost:8000/docs  |
| ReDoc       | http://localhost:8000/redoc |

### Docker Commands Reference

```bash
# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Rebuild and restart
docker-compose up --build

# Remove volumes (reset database)
docker-compose down -v
```

---

## 🔧 Manual Setup

For development or when Docker is not available.

### Backend Setup

#### 1. Navigate to Backend Directory

```bash
cd backend
```

#### 2. Create Virtual Environment

**Linux/macOS:**

```bash
python -m venv venv
source venv/bin/activate
```

**Windows (PowerShell):**

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**

```cmd
python -m venv venv
venv\Scripts\activate.bat
```

#### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

#### 4. Configure Environment Variables

Create a `.env` file in the `backend` directory (see [Environment Variables](#-environment-variables)).

#### 5. Set Up PostgreSQL Database

Make sure PostgreSQL is running and create a database:

```sql
CREATE DATABASE katling_db;
CREATE USER katling WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE katling_db TO katling;
```

#### 6. Run Database Migrations

```bash
alembic upgrade head
```

#### 7. Seed Sample Data (Optional)

```bash
python scripts/seed.py
```

#### 8. Start the Backend Server

```bash
python app/main.py
```

Or using uvicorn directly:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at http://localhost:8000

---

### Frontend Setup

#### 1. Navigate to Frontend Directory

```bash
cd frontend
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:8000
```

#### 4. Configure Firebase

Copy the Firebase configuration example and fill in your credentials:

```bash
cp src/config/firebase.example.ts src/config/firebase.ts
```

Edit `src/config/firebase.ts` with your Firebase project credentials.

#### 5. Start the Development Server

```bash
npm run dev
```

The frontend will be available at http://localhost:5173

#### Other Frontend Commands

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

---

## 🔐 Environment Variables

### Backend (.env)

```env
# Database Configuration
POSTGRES_USER=katling
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=katling_db
DATABASE_URL=postgresql+asyncpg://katling:your_secure_password@localhost:5432/katling_db

# For Docker, use:
# DATABASE_URL=postgresql+asyncpg://katling:your_secure_password@db:5432/katling_db

# Firebase Admin SDK
FIREBASE_CREDENTIALS_PATH=serviceAccountKey.json

# Application Settings
APP_TIMEZONE=Asia/Ho_Chi_Minh
SCHEDULER_ENABLED=true

# SMTP Configuration (Optional - for email reminders)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=your_email@gmail.com
SMTP_USE_TLS=true

# Google Gemini API (for AI features)
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000
```

### Firebase Configuration (frontend/src/config/firebase.ts)

```typescript
export const firebaseConfig = {
  apiKey: "your_firebase_api_key",
  authDomain: "your_project.firebaseapp.com",
  projectId: "your_project_id",
  storageBucket: "your_project.appspot.com",
  messagingSenderId: "your_sender_id",
  appId: "your_app_id",
};
```

---

## 🗄️ Database Setup

### Using Alembic Migrations

```bash
# Apply all migrations
alembic upgrade head

# Create a new migration
alembic revision --autogenerate -m "description of changes"

# Downgrade one revision
alembic downgrade -1

# View migration history
alembic history
```

### Reset Database

To completely reset the database:

```bash
python scripts/reset.py
```

Or manually:

```bash
alembic downgrade base
alembic upgrade head
python scripts/seed.py  # Optional: re-seed data
```

---

## 🔥 Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Authentication with Email/Password provider
4. Download the service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save as `backend/serviceAccountKey.json`
5. Get web app configuration:
   - Go to Project Settings > General
   - Add a web app and copy the configuration
   - Paste into `frontend/src/config/firebase.ts`

---

## ❓ Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Find and kill process on port 8000 (Linux/macOS)
lsof -ti:8000 | xargs kill -9

# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

#### Database Connection Failed

1. Ensure PostgreSQL is running
2. Check `DATABASE_URL` in `.env`
3. Verify database credentials
4. For Docker: ensure the `db` service is healthy

#### Module Not Found

```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# Or for frontend
rm -rf node_modules
npm install
```

#### Docker Build Fails

```bash
# Clean up Docker
docker system prune -a
docker-compose build --no-cache
```

#### Alembic Migration Errors

```bash
# Check current revision
alembic current

# Stamp database with specific revision (if out of sync)
alembic stamp head
```

---

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Docker Documentation](https://docs.docker.com/)
- [Alembic Tutorial](https://alembic.sqlalchemy.org/en/latest/tutorial.html)

---

<div align="center">
  <a href="../README.md">← Back to README</a>
</div>
