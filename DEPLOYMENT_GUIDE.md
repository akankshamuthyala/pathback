# 🚀 PathBack — Render & Cloud Deployment Guide
> *PathBack — Finding a safer path back home.*
> *Consent-First Multimodal AI Platform for Missing-Person Investigation Support*

This comprehensive guide walks you through deploying the PathBack platform to **Render** with zero friction.

---

## 📋 Pre-Deployment Health & Build Verification

The codebase has been verified and builds cleanly:
- Backend: TypeScript CommonJS build (`dist/server.js`) — **PASS (Exit code 0)**
- Frontend: Vite + React SPA build (`dist/index.html`) — **PASS (Exit code 0)**
- Dynamic CORS & SPA fallback handling — **ENABLED**

---

## 🌟 Method 1: Instant 1-Click Deployment with Render Blueprint (Recommended)

PathBack includes a pre-configured [`render.yaml`](file:///c:/Users/akank/OneDrive/Desktop/Hackathon%20series-1/render.yaml) blueprint that sets up both the Backend Web Service and Frontend Static Site automatically.

### Steps:
1. Push your repository to **GitHub** or **GitLab**.
2. Go to the [Render Dashboard](https://dashboard.render.com).
3. Click **New +** → **Blueprint**.
4. Select your **PathBack** repository.
5. Render will automatically detect `render.yaml` and configure:
   - **Backend Web Service (`pathback-backend`)**: Node environment, builds with `npm install && npm run build`, starts with `npm start`, health check at `/api/health`.
   - **Frontend Static Site (`pathback-frontend`)**: Vite build, serves `./dist`, automatically connects to the backend URL via `VITE_API_URL`.
6. Click **Apply**. Render will generate secrets and deploy both services!

---

## 🛠️ Method 2: Manual Step-by-Step Deployment on Render

If you prefer setting up services individually on Render:

### Step 1: Deploy the Backend (Web Service)
1. Go to [Render Dashboard](https://dashboard.render.com) → **New +** → **Web Service**.
2. Connect your Git repository.
3. Configure the following settings:
   - **Name:** `pathback-backend`
   - **Region:** Choose the region closest to you (e.g., *Oregon (US West)* or *Singapore*)
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`
4. In the **Environment Variables** tab, add:
   | Key | Value | Notes |
   |---|---|---|
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `5000` | Render automatically binds this port |
   | `DEMO_MODE` | `true` | Auto-seeds synthetic cases & demo accounts |
   | `DEV_OTP_MODE` | `true` | Allows instant demo OTP login (`123456`) |
   | `SMS_PROVIDER` | `console_mock` | SMS console logger |
   | `STORAGE_PROVIDER` | `local` | `local`, `cloudinary`, or `supabase` |
   | `JWT_ACCESS_SECRET` | *(Click Generate or paste a 32+ char random string)* | Access token signing |
   | `JWT_REFRESH_SECRET` | *(Click Generate or paste a 32+ char random string)* | Refresh token signing |
   | `MONGODB_URI` | `mongodb+srv://user:pass@cluster0.mongodb.net/pathback` | *(Optional: leave empty for isolated in-memory DB)* |
   | `ANTHROPIC_API_KEY` | `sk-ant-...` | *(Optional: for live Claude 3.7 multimodal analysis)* |
   | `SUPABASE_URL` | `https://your-proj.supabase.co` | *(Optional: Supabase integration)* |
   | `SUPABASE_ANON_KEY` | `your-anon-key` | *(Optional)* |
   | `SUPABASE_SERVICE_ROLE_KEY` | `your-service-key` | *(Optional)* |
   | `CLIENT_URL` | `https://your-frontend.onrender.com` | Set to your frontend Render URL after deploying |

5. Click **Create Web Service**.
6. Once deployed, copy your backend URL (e.g., `https://pathback-backend.onrender.com`).

---

### Step 2: Deploy the Frontend (Static Site)
1. In [Render Dashboard](https://dashboard.render.com), click **New +** → **Static Site**.
2. Connect the same Git repository.
3. Configure the following settings:
   - **Name:** `pathback-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. In **Redirects / Rewrites**, add:
   - **Type:** `Rewrite`
   - **Source:** `/*`
   - **Destination:** `/index.html`
   *(Note: The codebase also contains `public/_redirects` which handles this automatically).*
5. In the **Environment Variables** tab, add:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://pathback-backend.onrender.com/api` | *(Replace with your actual backend URL from Step 1)* |
6. Click **Create Static Site**.

---

## 🧪 Validating Your Deployment

1. **Backend Health Check:**
   Open `https://pathback-backend.onrender.com/api/health` in your browser. You should receive:
   ```json
   {
     "status": "UP",
     "platform": "PathBack — Finding a safer path back home.",
     "tagline": "Finding a safer path back home.",
     "version": "1.0.0",
     "demoMode": true,
     "devOtpMode": true
   }
   ```

2. **Frontend UI:**
   Open `https://pathback-frontend.onrender.com`.
   - Test navigating the public missing persons portal.
   - Test logging in using one of the pre-seeded demo accounts:
     - **Investigator:** Phone `+15550000002` | Password `Investigator@123` | OTP `123456`
     - **Admin:** Phone `+15550000001` | Password `Admin@123` | OTP `123456`
     - **Family Member:** Phone `+15550000003` | Password `Family@123` | OTP `123456`
     - **Public Reporter:** Phone `+15550000004` | Password `Reporter@123` | OTP `123456`
