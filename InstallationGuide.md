# Installation Guide 🛠️

Follow these instructions to run the ExamShield AI platform locally on your machine.

---

## Prerequisites

Ensure you have the following installed:
- **Node.js** (v16.0.0 or higher)
- **NPM** (v8.0.0 or higher)
- **MongoDB** (Local instance running on `mongodb://localhost:27017` OR a MongoDB Atlas cluster URI)

---

## 1. Backend Setup ⚙️

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Set up environment configurations. Duplicate `.env.example` to a new file named `.env`:
   ```bash
   copy .env.example .env
   ```
4. Open `.env` and fill out your variables:
   - `PORT`: Server port (default is `5000`).
   - `MONGO_URI`: Enter your MongoDB connection string (e.g. `mongodb://127.0.0.1:27017/examshield` for local testing).
   - `MONGO_LOCAL_URI`: Optional local fallback URI used when Atlas is unreachable.
   - `JWT_SECRET`: Enter any secure random string for token encryptions.
   - `GEMINI_API_KEY`: Provide your Google Gemini API key from Google AI Studio. 
     *(Note: If left blank, the platform automatically switches to mock evaluation mode, allowing offline testing).*

5. Start the backend developer server:
   ```bash
   npm run dev
   ```
   The backend API will start running at `http://localhost:5000`.

---

## 2. Frontend Setup 💻

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the Vite development bundle server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to the local portal at `http://localhost:5173`.

---

## 3. Creating an Admin Account 🔑

By default, the registration screen allows creating **Student** or **Teacher** accounts. To configure an **Admin** user:
1. Register a new user on the register screen (e.g., `admin@examshield.com`).
2. Open your MongoDB viewer tool (like MongoDB Compass or Atlas web shell).
3. Open the `users` collection in the `examshield` database.
4. Locate the document matching the email you registered.
5. Modify the `role` field value from `student` to `admin`.
6. Save the document. Now when logging in, you will be redirected to the Admin Dashboard.
