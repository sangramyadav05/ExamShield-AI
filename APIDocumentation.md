# API Documentation 📖

All requests must be made to the API base URL: `http://localhost:5000/api`. 

Protected routes require an `Authorization` header containing the JWT token: `Bearer <JWT_TOKEN>`.

---

## 🔑 Authentication APIs

### 1. Register User
- **Route**: `POST /auth/register`
- **Access**: Public
- **Body Parameters**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@school.com",
    "password": "securepassword123",
    "role": "teacher" // "student" or "teacher"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "Jane Doe",
    "email": "jane@school.com",
    "role": "teacher",
    "token": "eyJhbGciOiJIUzI1Ni..."
  }
  ```

### 2. Login User
- **Route**: `POST /auth/login`
- **Access**: Public
- **Body Parameters**:
  ```json
  {
    "email": "jane@school.com",
    "password": "securepassword123"
  }
  ```
- **Response** (200 OK): Returns user details and signed JWT token.

### 3. Fetch User Profile
- **Route**: `GET /auth/profile`
- **Access**: Private (Student/Teacher/Admin)
- **Response** (200 OK): Current user details.

---

## 👥 User Management APIs (Admin Only)

### 1. Fetch All Users
- **Route**: `GET /users`
- **Access**: Private (Admin)
- **Response** (200 OK): Array of all registered users (excluding password hashes).

### 2. Toggle Account Status
- **Route**: `PUT /users/:id/toggle`
- **Access**: Private (Admin)
- **Response** (200 OK): Returns modified user status:
  ```json
  {
    "_id": "60d21b4667d0...",
    "isActive": false
  }
  ```

---

## 📝 Examination APIs

### 1. Create Exam
- **Route**: `POST /exams`
- **Access**: Private (Teacher)
- **Body Parameters**:
  ```json
  {
    "title": "Data Structures Final",
    "subject": "Computer Science",
    "topic": "Graphs and Trees",
    "duration": 60, // in minutes
    "totalMarks": 100,
    "passingMarks": 40
  }
  ```
- **Response** (201 Created): Returns the created exam document.

### 2. Fetch Exams List
- **Route**: `GET /exams`
- **Access**: Private (Student/Teacher/Admin)
- **Behavior**:
  - *Admin* receives all exams.
  - *Teacher* receives exams they created.
  - *Student* receives only published/closed exams.

### 3. Fetch Exam details by ID
- **Route**: `GET /exams/:id`
- **Access**: Private
- **Behavior**: 
  - If requested by a student, correct answers are securely stripped out from the questions list payload to preserve exam integrity.

---

## ❓ Question APIs

### 1. AI Question Generator
- **Route**: `POST /questions/generate-ai`
- **Access**: Private (Teacher)
- **Body Parameters**:
  ```json
  {
    "subject": "History",
    "topic": "World War II",
    "difficulty": "medium", // "easy", "medium", "hard"
    "count": 5
  }
  ```
- **Response** (200 OK): Array of generated question objects (MCQ with choices, short, and long).

### 2. Save Questions in Bulk
- **Route**: `POST /questions/bulk`
- **Access**: Private (Teacher)
- **Body Parameters**:
  ```json
  {
    "examId": "60d21b4667d0...",
    "questions": [
      {
        "type": "mcq",
        "questionText": "When did WWII end?",
        "options": ["1941", "1945", "1950", "1939"],
        "correctAnswer": "1945",
        "marks": 2,
        "difficulty": "medium",
        "subject": "History"
      }
    ]
  }
  ```

---

## ✍️ Submissions & Results APIs

### 1. Submit Exam Paper
- **Route**: `POST /submissions`
- **Access**: Private (Student)
- **Body Parameters**:
  ```json
  {
    "examId": "60d21b4667d0...",
    "answers": [
      {
        "questionId": "60d21b4667d0a2",
        "studentAnswer": "1945"
      }
    ]
  }
  ```
- **Response** (201 Created): Automatically triggers Gemini to grade the answers against guidelines, creates a `Result` scorecard document, and returns:
  ```json
  {
    "message": "Exam submitted and evaluated successfully",
    "submissionId": "60d21b...",
    "resultId": "60d21c...",
    "result": { ... }
  }
  ```

### 2. Get Scorecard by Exam ID
- **Route**: `GET /submissions/result/exam/:examId`
- **Access**: Private (Student)
- **Response** (200 OK): The detailed result analysis.

---

## 📊 Analytics APIs

### 1. Admin Analytics
- **Route**: `GET /analytics/admin`
- **Response**: Platform statistics cards, role ratios, and AI usage activity logs.

### 2. Teacher Analytics
- **Route**: `GET /analytics/teacher`
- **Response**: Exam pass percentages and class-wise score averages.

### 3. Student Analytics
- **Route**: `GET /analytics/student`
- **Response**: Total exams attempted, pass count, marks trends, and AI-tutor recommendations.

---

## 💬 AI Study Assistant APIs

### 1. Consult Tutor
- **Route**: `POST /ai/chat`
- **Access**: Private (Student)
- **Body Parameters**:
  ```json
  {
    "message": "Can you explain Dijkstra's algorithm simply?",
    "sessionId": "60d21b..." // Optional. Leave blank to start a new chat thread
  }
  ```
- **Response** (200 OK): Reply from the AI Study Buddy and the updated message list.
