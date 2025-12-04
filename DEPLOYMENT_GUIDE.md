# Deployment Guide

This guide outlines how to deploy your **AI-Powered Python Coaching Center** project.

-   **Backend**: Deployed on **Render** (Free Tier).
-   **Frontend**: Deployed on **Vercel** (Free Tier).

---

---

## 0. GitHub Setup (First Step)

Before deploying, you need to push your code to GitHub.

1.  **Initialize Git**:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```

2.  **Create Repository**:
    -   Go to [github.com/new](https://github.com/new).
    -   Name it `python-coaching-center` (or similar).
    -   Click **Create repository**.

3.  **Push Code**:
    Run these commands in your terminal (replace `python-coaching-center` if you named it differently):
    ```bash
    git remote add origin https://github.com/harshadpy/python-coaching-center.git
    git branch -M main
    git push -u origin main
    ```

---

## 1. Backend Deployment (Render)

### Prerequisites
-   Push your code to a GitHub repository.
-   Ensure `backend/requirements.txt` is present (It is).

### Steps
1.  **Sign Up/Login**: Go to [render.com](https://render.com) and log in with GitHub.
2.  **New Web Service**: Click **"New +"** -> **"Web Service"**.
3.  **Connect Repo**: Select your repository.
4.  **Configuration**:
    -   **Name**: `python-coaching-backend` (or similar)
    -   **Region**: Singapore (or nearest to you)
    -   **Branch**: `main`
    -   **Root Directory**: `.` (Leave empty or set to root)
    -   **Runtime**: **Python 3**
    -   **Build Command**: `pip install -r backend/requirements.txt`
    -   **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
5.  **Environment Variables**:
    Scroll down to "Environment Variables" and add the keys from your `.env` file:
    -   `AISENSY_API_KEY`: `...`
    -   `AISENSY_CAMPAIGN_NAME`: `training_meeting`
    -   `AISENSY_TEMPLATE_ENROLLMENT`: `python_enrollment`
    -   `AISENSY_TEMPLATE_MEETING`: `python_meeting`
    -   `BREVO_API_KEY`: `...`
    -   `OPENAI_API_KEY`: `...`
    -   `BOLNA_API_KEY`: `...`
    -   `BOLNA_AGENT_ID`: `...`
    -   `SECRET_KEY`: `(Generate a random string)`
    -   `DATABASE_URL`: `sqlite:///database.db` (Note: SQLite on Render is ephemeral. For persistence, use Render's PostgreSQL, but for a demo, SQLite is fine).
6.  **Deploy**: Click **"Create Web Service"**.

> **Note**: Copy the **Service URL** (e.g., `https://python-backend.onrender.com`) once deployed. You will need it for the frontend.

---

## 2. Frontend Deployment (Vercel)

### Prerequisites
-   I have added a `vercel.json` file to `frontend/` to handle routing.

### Steps
1.  **Sign Up/Login**: Go to [vercel.com](https://vercel.com) and log in with GitHub.
2.  **Add New Project**: Click **"Add New..."** -> **"Project"**.
3.  **Import Repo**: Select your repository.
4.  **Project Settings**:
    -   **Framework Preset**: **Vite** (Should detect automatically).
    -   **Root Directory**: Click "Edit" and select `frontend`.
5.  **Environment Variables**:
    -   Add `VITE_API_URL` and set it to your **Render Backend URL** (e.g., `https://python-backend.onrender.com`).
    -   *Important*: Ensure your frontend code uses `import.meta.env.VITE_API_URL` instead of hardcoded `localhost:8000`.
6.  **Deploy**: Click **"Deploy"**.

---

## 3. Final Configuration

### Update Backend CORS
Once the frontend is deployed, you need to tell the backend to allow requests from the new Vercel domain.

1.  Go to `backend/main.py`.
2.  Update `allow_origins`:
    ```python
    allow_origins=[
        "http://localhost:5173",
        "https://your-vercel-app.vercel.app" # Add your Vercel URL here
    ]
    ```
3.  Commit and push the change. Render will auto-redeploy.

### Update Frontend API Calls
Ensure your frontend API service (`frontend/src/services/api.js` or similar) uses the environment variable:

```javascript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
```

---

## Troubleshooting

-   **Backend 502/500 Error**: Check Render logs. Common issues are missing env vars or wrong start command.
-   **Frontend 404 on Refresh**: Ensure `vercel.json` is present in the `frontend` folder.
-   **CORS Error**: Check if the Vercel domain is added to `backend/main.py`.
