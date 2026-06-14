# Deployment Guide 🚀

This guide explains how to prepare and deploy ExamShield AI for production.

---

## 1. Backend: Render Deployment 🌐

Render is recommended for hosting the Express API.

1. **GitHub Repository Setup**:
   Ensure your project is pushed to a remote GitHub repository.
2. **Create a Web Service on Render**:
   - Log into [Render](https://render.com).
   - Click **New** -> **Web Service**.
   - Connect your GitHub repository.
3. **Configure Settings**:
   - **Name**: `examshield-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Instance Type**: `Free` (or standard tier depending on traffic requirements)
4. **Environment Variables**:
   Click the **Environment** tab and add:
   - `PORT`: `10000` (Render binds automatically, but good to declare)
   - `MONGO_URI`: `mongodb+srv://...` (Your live Atlas cluster URI)
   - `JWT_SECRET`: `yoursupersecretjwtkey`
   - `GEMINI_API_KEY`: `AIzaSy...` (Your Google Gemini key)
   - `NODE_ENV`: `production`
5. **Deploy**: Click **Deploy Web Service**. Render will install packages and boot up the listener. Keep note of the service URL (e.g. `https://examshield-backend.onrender.com`).

---

## 2. Frontend: Vercel Deployment ⚡

Vercel is optimal for React SPA bundles.

1. **Update API Base URL**:
   In `frontend/src/context/AuthContext.jsx` and `frontend/src/hooks/useAxios.js`, update the base API URL to point to your live Render endpoint:
   ```javascript
   const API_BASE = 'https://examshield-backend.onrender.com/api';
   ```
2. **Create a `vercel.json` redirect file**:
   Since React Router uses client-side navigation (Single Page Application), we must ensure direct page refreshes redirect to `index.html`. 
   
   Create `vercel.json` inside the `frontend` root folder:
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
3. **Deploy on Vercel Dashboard**:
   - Log into [Vercel](https://vercel.com).
   - Click **Add New** -> **Project**.
   - Connect your GitHub repository.
   - Choose the root folder by navigating to **Root Directory** and selecting `frontend`.
   - Leave the Framework Preset as **Vite**.
   - Click **Deploy**.
4. **Finished!** Once Vercel compiles, it will serve the production app at a public subdomain (e.g., `https://examshield-ai.vercel.app`).
