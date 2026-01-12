# 📡 API Documentation

This document provides an overview of the Katling REST API endpoints.

> **Interactive Documentation**: For detailed request/response schemas, visit the auto-generated docs at:
>
> - **Swagger UI**: http://localhost:8000/docs
> - **ReDoc**: http://localhost:8000/redoc

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#base-url">Base URL</a></li>
    <li><a href="#-authentication">Authentication</a></li>
    <li>
      <a href="#api-endpoints">API Endpoints</a>
      <ul>
        <li><a href="#authentication-endpoints">Authentication</a></li>
        <li><a href="#user-endpoints">User</a></li>
        <li><a href="#learning-endpoints">Learning</a></li>
        <li><a href="#vocabulary-endpoints">Vocabulary</a></li>
        <li><a href="#flashcard-endpoints">Flashcards</a></li>
        <li><a href="#pronunciation-endpoints">Pronunciation</a></li>
        <li><a href="#conversation-endpoints">Conversation</a></li>
        <li><a href="#daily-mission-endpoints">Daily Missions</a></li>
        <li><a href="#leaderboard-endpoints">Leaderboard</a></li>
        <li><a href="#community-endpoints">Community</a></li>
        <li><a href="#admin--moderation-endpoints">Admin & Moderation</a></li>
      </ul>
    </li>
    <li><a href="#-error-handling">Error Handling</a></li>
    <li><a href="#-rate-limiting">Rate Limiting</a></li>
    <li><a href="#-examples">Examples</a></li>
  </ol>
</details>

---

## Base URL

```
Development: http://localhost:8000
Production:  https://api.katling.com (example)
```

---

## 🔐 Authentication

Katling uses Firebase Authentication. Include the Firebase ID token in the `Authorization` header:

```http
Authorization: Bearer <firebase_id_token>
```

### Getting a Token

1. Authenticate with Firebase on the frontend
2. Get the ID token: `await firebase.auth().currentUser.getIdToken()`
3. Include in API requests

---

## API Endpoints

### Authentication Endpoints

| Method | Endpoint         | Description                    | Auth |
| ------ | ---------------- | ------------------------------ | ---- |
| POST   | `/auth/register` | Register a new user            | No   |
| POST   | `/auth/login`    | Login user                     | No   |
| GET    | `/auth/me`       | Get current authenticated user | Yes  |
| POST   | `/auth/logout`   | Logout user                    | Yes  |

#### POST /auth/register

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "johndoe",
  "full_name": "John Doe"
}
```

**Response:** `201 Created`

```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "johndoe",
  "full_name": "John Doe",
  "created_at": "2026-01-13T10:00:00Z"
}
```

---

### User Endpoints

| Method | Endpoint         | Description            | Auth |
| ------ | ---------------- | ---------------------- | ---- |
| GET    | `/user/profile`  | Get user profile       | Yes  |
| PUT    | `/user/profile`  | Update user profile    | Yes  |
| GET    | `/user/stats`    | Get user statistics    | Yes  |
| GET    | `/user/points`   | Get user XP and energy | Yes  |
| PUT    | `/user/settings` | Update user settings   | Yes  |

#### GET /user/stats

Get learning statistics for the current user.

**Response:** `200 OK`

```json
{
  "total_xp": 1500,
  "current_streak": 7,
  "longest_streak": 14,
  "lessons_completed": 25,
  "words_learned": 150,
  "practice_minutes": 420
}
```

---

### Learning Endpoints

| Method | Endpoint                           | Description                 | Auth |
| ------ | ---------------------------------- | --------------------------- | ---- |
| GET    | `/topics`                          | Get all learning topics     | Yes  |
| GET    | `/topics/{topic_id}/lessons`       | Get lessons for a topic     | Yes  |
| GET    | `/lessons/{lesson_id}/sections`    | Get sections for a lesson   | Yes  |
| GET    | `/lessons/{lesson_id}/content`     | Get lesson content          | Yes  |
| GET    | `/sections/{section_id}/questions` | Get questions for a section | Yes  |
| GET    | `/sections/{section_id}/next`      | Get next section            | Yes  |
| POST   | `/sections/{section_id}/complete`  | Mark section as complete    | Yes  |
| POST   | `/questions/{question_id}/submit`  | Submit answer to question   | Yes  |

#### GET /topics

Get all learning topics with user progress.

**Response:** `200 OK`

```json
{
  "topics": [
    {
      "id": 1,
      "name": "Basic Greetings",
      "description": "Learn essential greeting phrases",
      "status": "completed",
      "progress": 100
    },
    {
      "id": 2,
      "name": "Daily Conversations",
      "description": "Common everyday dialogues",
      "status": "current",
      "progress": 45
    },
    {
      "id": 3,
      "name": "Travel English",
      "description": "Essential travel vocabulary",
      "status": "locked",
      "progress": 0
    }
  ]
}
```

#### POST /sections/{section_id}/complete

Mark a section as completed and receive XP.

**Response:** `200 OK`

```json
{
  "xp_earned": 20,
  "total_xp": 1520,
  "next_section_id": 15,
  "lesson_completed": false
}
```

---

### Vocabulary Endpoints

| Method | Endpoint                  | Description                 | Auth |
| ------ | ------------------------- | --------------------------- | ---- |
| GET    | `/vocab`                  | Get user's vocabulary list  | Yes  |
| POST   | `/vocab`                  | Add word to vocabulary      | Yes  |
| GET    | `/vocab/{word_id}`        | Get specific word details   | Yes  |
| PUT    | `/vocab/{word_id}`        | Update word                 | Yes  |
| DELETE | `/vocab/{word_id}`        | Remove word from vocabulary | Yes  |
| PUT    | `/vocab/{word_id}/status` | Update review status        | Yes  |

#### GET /vocab

Get user's vocabulary with optional filters.

**Query Parameters:**

| Parameter       | Type   | Description                                |
| --------------- | ------ | ------------------------------------------ |
| `category`      | string | Filter by category                         |
| `review_status` | string | Filter by status (NEW, LEARNING, MASTERED) |
| `limit`         | int    | Number of results (default: 50)            |
| `offset`        | int    | Pagination offset                          |

**Response:** `200 OK`

```json
{
  "words": [
    {
      "id": 1,
      "word": "eloquent",
      "definition": {
        "adjective": ["fluent or persuasive in speaking or writing"]
      },
      "phonetic": "/ˈeləkwənt/",
      "category": "Advanced Vocabulary",
      "review_status": "LEARNING",
      "created_at": "2026-01-10T08:00:00Z"
    }
  ],
  "total": 150
}
```

---

### Flashcard Endpoints

| Method | Endpoint                        | Description               | Auth |
| ------ | ------------------------------- | ------------------------- | ---- |
| GET    | `/learning/flashcards`          | Get flashcards for review | Yes  |
| POST   | `/learning/flashcards/complete` | Submit flashcard review   | Yes  |

#### GET /learning/flashcards

Get flashcards for review session.

**Query Parameters:**

| Parameter       | Type   | Description                        |
| --------------- | ------ | ---------------------------------- |
| `mode`          | string | `all`, `due`, `new` (default: all) |
| `review_status` | string | Filter by review status            |
| `category`      | string | Filter by category                 |
| `limit`         | int    | Number of cards (default: 20)      |

**Response:** `200 OK`

```json
{
  "cards": [
    {
      "id": 1,
      "word": "serendipity",
      "definition": "the occurrence of events by chance in a happy way",
      "phonetic": "/ˌserənˈdipətē/",
      "example": "Finding that book was pure serendipity."
    }
  ],
  "total": 15
}
```

---

### Pronunciation Endpoints

| Method | Endpoint                  | Description                     | Auth |
| ------ | ------------------------- | ------------------------------- | ---- |
| POST   | `/pronunciation/material` | Generate practice material      | Yes  |
| POST   | `/pronunciation/assess`   | Assess pronunciation from audio | Yes  |

#### POST /pronunciation/material

Generate words or sentences for pronunciation practice.

**Request Body:**

```json
{
  "mode": "word",
  "count": 5,
  "level": "intermediate",
  "topic": "business"
}
```

**Response:** `200 OK`

```json
{
  "items": [
    { "type": "word", "text": "entrepreneur" },
    { "type": "word", "text": "collaboration" },
    { "type": "word", "text": "innovative" }
  ]
}
```

#### POST /pronunciation/assess

Submit audio for pronunciation assessment.

**Request:** `multipart/form-data`

| Field       | Type   | Description                 |
| ----------- | ------ | --------------------------- |
| `reference` | string | The expected text           |
| `audio`     | file   | Audio file (WAV, MP3, WebM) |

**Response:** `200 OK`

```json
{
  "assessment": {
    "overall_score": 85,
    "accuracy": 88,
    "fluency": 82,
    "completeness": 90,
    "word_scores": [
      { "word": "hello", "score": 95 },
      { "word": "world", "score": 75 }
    ]
  },
  "feedback": [
    "Great pronunciation overall!",
    "Try to emphasize the 'r' sound in 'world' more clearly."
  ]
}
```

---

### Conversation Endpoints

| Method | Endpoint        | Description              | Auth |
| ------ | --------------- | ------------------------ | ---- |
| POST   | `/chat/message` | Send text message to AI  | Yes  |
| POST   | `/chat/voice`   | Send voice message to AI | Yes  |

#### POST /chat/message

Send a text message and receive AI response.

**Request Body:**

```json
{
  "message": "Hello, how are you today?"
}
```

**Response:** `200 OK`

```json
{
  "response": "Hello! I'm doing great, thank you for asking. How can I help you practice English today?"
}
```

#### POST /chat/voice

Send voice message and receive AI response with audio.

**Request:** `multipart/form-data`

| Field           | Type    | Description                                  |
| --------------- | ------- | -------------------------------------------- |
| `audio`         | file    | Audio file from user                         |
| `force_english` | boolean | Force English-only response (default: false) |

**Response:** `200 OK`

```json
{
  "user_text": "What's the weather like today?",
  "response_text": "That's a great question! In English, we often start conversations by asking about the weather.",
  "audio_url": "/audio/response_123.mp3"
}
```

---

### Daily Mission Endpoints

| Method | Endpoint                             | Description          | Auth |
| ------ | ------------------------------------ | -------------------- | ---- |
| GET    | `/daily-missions`                    | Get today's missions | Yes  |
| POST   | `/daily-missions/{mission_id}/claim` | Claim mission reward | Yes  |

#### GET /daily-missions

Get daily missions for the current user.

**Response:** `200 OK`

```json
{
  "date": "2026-01-13",
  "missions": [
    {
      "id": 1,
      "title": "Complete 3 lessons",
      "description": "Finish any 3 lessons today",
      "progress": 2,
      "target": 3,
      "xp_reward": 50,
      "completed": false,
      "claimed": false
    },
    {
      "id": 2,
      "title": "Practice pronunciation",
      "description": "Complete 5 pronunciation exercises",
      "progress": 5,
      "target": 5,
      "xp_reward": 30,
      "completed": true,
      "claimed": false
    }
  ]
}
```

#### POST /daily-missions/{mission_id}/claim

Claim XP reward for completed mission.

**Response:** `200 OK`

```json
{
  "xp": 30,
  "total_xp": 1550
}
```

---

### Leaderboard Endpoints

| Method | Endpoint       | Description            | Auth |
| ------ | -------------- | ---------------------- | ---- |
| GET    | `/leaderboard` | Get global leaderboard | Yes  |

#### GET /leaderboard

Get leaderboard rankings.

**Query Parameters:**

| Parameter | Type   | Description                         |
| --------- | ------ | ----------------------------------- |
| `period`  | string | `daily`, `weekly`, `monthly`, `all` |
| `limit`   | int    | Number of results (default: 50)     |

**Response:** `200 OK`

```json
{
  "leaderboard": [
    {
      "rank": 1,
      "user_id": 42,
      "username": "toplearner",
      "avatar_url": "/avatars/42.jpg",
      "xp": 15000,
      "streak": 30
    },
    {
      "rank": 2,
      "user_id": 15,
      "username": "englishmaster",
      "avatar_url": "/avatars/15.jpg",
      "xp": 14500,
      "streak": 25
    }
  ],
  "current_user": {
    "rank": 156,
    "xp": 1550,
    "streak": 7
  }
}
```

---

### Community Endpoints

#### Friends

| Method | Endpoint                       | Description           | Auth |
| ------ | ------------------------------ | --------------------- | ---- |
| GET    | `/friends`                     | Get friends list      | Yes  |
| POST   | `/friends/request`             | Send friend request   | Yes  |
| POST   | `/friends/accept/{request_id}` | Accept friend request | Yes  |
| DELETE | `/friends/{friend_id}`         | Remove friend         | Yes  |

#### Posts

| Method | Endpoint                | Description         | Auth |
| ------ | ----------------------- | ------------------- | ---- |
| GET    | `/posts`                | Get community posts | Yes  |
| POST   | `/posts`                | Create a new post   | Yes  |
| GET    | `/posts/{post_id}`      | Get specific post   | Yes  |
| DELETE | `/posts/{post_id}`      | Delete own post     | Yes  |
| POST   | `/posts/{post_id}/like` | Like a post         | Yes  |

---

### Admin & Moderation Endpoints

#### Admin Endpoints (Admin only)

| Method | Endpoint                 | Description           | Auth  |
| ------ | ------------------------ | --------------------- | ----- |
| GET    | `/admin/users`           | List all users        | Admin |
| PUT    | `/admin/users/{user_id}` | Update user           | Admin |
| DELETE | `/admin/users/{user_id}` | Delete user           | Admin |
| GET    | `/admin/stats`           | Get system statistics | Admin |

#### Moderator Endpoints (Moderator/Admin)

| Method | Endpoint                          | Description            | Auth      |
| ------ | --------------------------------- | ---------------------- | --------- |
| GET    | `/moderator/content`              | Get content for review | Moderator |
| PUT    | `/moderator/content/{id}/approve` | Approve content        | Moderator |
| PUT    | `/moderator/content/{id}/reject`  | Reject content         | Moderator |

#### Reports

| Method | Endpoint                       | Description              | Auth      |
| ------ | ------------------------------ | ------------------------ | --------- |
| POST   | `/reports`                     | Submit a report          | Yes       |
| GET    | `/reports`                     | Get reports (moderators) | Moderator |
| PUT    | `/reports/{report_id}/resolve` | Resolve a report         | Moderator |

---

## ❌ Error Handling

All errors follow a consistent format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

### HTTP Status Codes

| Code | Description                             |
| ---- | --------------------------------------- |
| 200  | Success                                 |
| 201  | Created                                 |
| 400  | Bad Request - Invalid input             |
| 401  | Unauthorized - Missing or invalid token |
| 403  | Forbidden - Insufficient permissions    |
| 404  | Not Found - Resource doesn't exist      |
| 422  | Unprocessable Entity - Validation error |
| 429  | Too Many Requests - Rate limit exceeded |
| 500  | Internal Server Error                   |

### Validation Errors

```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

---

## ⏱️ Rate Limiting

To ensure fair usage, the API implements rate limiting:

| Endpoint Type  | Limit               |
| -------------- | ------------------- |
| Authentication | 10 requests/minute  |
| General API    | 100 requests/minute |
| AI Endpoints   | 20 requests/minute  |
| File Uploads   | 10 requests/minute  |

When rate limited, you'll receive a `429 Too Many Requests` response:

```json
{
  "detail": "Rate limit exceeded. Please try again in 60 seconds."
}
```

---

## 📝 Examples

### cURL Examples

**Get Topics:**

```bash
curl -X GET "http://localhost:8000/topics" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Submit Pronunciation:**

```bash
curl -X POST "http://localhost:8000/pronunciation/assess" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "reference=Hello world" \
  -F "audio=@recording.wav"
```

### JavaScript/TypeScript Examples

```typescript
// Using fetch
const response = await fetch("http://localhost:8000/topics", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
const data = await response.json();

// Using axios
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const { data } = await api.get("/topics");
```

---

<div align="center">
  <a href="../README.md">← Back to README</a>
</div>

---
