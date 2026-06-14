# ExamShield AI 🛡️🧠

ExamShield AI is an enterprise-grade, AI-powered examination management and answer evaluation platform built for modern educational institutions, teachers, and students. By combining a security-first React frontend with a scalable Node.js/Express backend, ExamShield AI makes it easy to intelligently generate structured exam papers, prevent cheating, evaluate open-ended student responses, and view detailed progress insights.

---

## 🌟 Key Features

### 👤 Role-Based Management Control
1. **Admin Portal**: Platform statistics, user monitoring, and security settings. Actively disable or enable user accounts, monitor AI request usage logs, and view student-to-teacher user ratios.
2. **Teacher Console**: Build new exams, customize parameters (passing score, duration, marks), preview questions, and use the Google Gemini engine to auto-generate customized questions pools.
3. **Student Portal**: Take scheduled examinations, view historical scorecards with full AI critique reports, consult the AI Study Assistant, and view recommendations.

### 🤖 Google Gemini AI Core
- **AI Question Generation**: Seamlessly generate a balanced selection of MCQs (with 4 choices), short explanation prompts, and essay questions based on subject, topic, and difficulty specs.
- **AI Answer Evaluation**: Analyzes open-ended student text against ideal guidelines on 5 analytical criteria: *Accuracy*, *Completeness*, *Clarity*, *Grammar*, and *Concept Understanding* — generating scorecards with feedback.
- **AI Study Assistant**: Interactive 1-on-1 tutoring chat, doubt-clearing, customized study plans, and topic revisions.

### 🔒 Security-First Architecture
- **JWT token protection** with custom Express authorization middleware routing.
- **Answer shielding**: Exams served to student clients do not include correct answers, preventing client bundle inspection attacks.
- **Supervisor warning flags**: Enforces focus monitoring that tracks browser blur events, notifying students and warning them if they switch tabs.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, React Router, Recharts, Axios, Lucide Icons
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose Schemas)
- **AI Integration**: Google Gemini API (`@google/generative-ai` SDK)
- **Authentication**: JWT, bcryptjs

---

## 📂 Folder Structure

```
ExamShield AI (Root)
├── backend/
│   ├── src/
│   │   ├── config/           # MongoDB Connection configuration
│   │   ├── controllers/      # Route handler controllers (Auth, Exam, AI, Analytics)
│   │   ├── middleware/       # Custom Express middleware (Auth verification, Error handlers)
│   │   ├── models/           # Mongoose Database models (User, Exam, Result, ChatHistory)
│   │   ├── routes/           # REST API Route declarations
│   │   ├── services/         # Gemini AI integrations (structured JSON mode & mock fallback)
│   │   ├── app.js            # Express app bootstrap
│   │   └── server.js         # Port listener
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/       # Reusable glassmorphic UI components (Cards, Modals, Tables)
    │   ├── context/          # React contexts (Auth Session persistence)
    │   ├── hooks/            # Custom hooks (useAxios interceptor injection)
    │   ├── pages/            # View pages (Landing, Login, Dashboard, ExamPortal)
    │   ├── App.jsx           # Routing guard setup
    │   ├── index.css         # Global tailwind styles & radial glows
    │   └── main.jsx          # DOM rendering point
    ├── index.html
    └── package.json
```

---

## 📝 Documentations Directory

We have provided specific manuals for setting up and deploying ExamShield AI:

1. [Installation Guide](file:///c:/Users/HP/Desktop/Far%20Away/InstallationGuide.md): Local developer setup.
2. [API Documentation](file:///c:/Users/HP/Desktop/Far%20Away/APIDocumentation.md): REST endpoints list and parameters formats.
3. [Deployment Guide](file:///c:/Users/HP/Desktop/Far%20Away/DeploymentGuide.md): Hosting guides for Render and Vercel.
