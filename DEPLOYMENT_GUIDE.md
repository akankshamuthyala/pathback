# SETHU (सेतु) — Deployment & Production Guide

This guide provides instructions for deploying the SETHU platform to modern cloud infrastructure (Vercel for Frontend, Render/Railway for Backend, MongoDB Atlas for Database, and Cloudinary for Object Storage).

---

## 🏗️ Architecture Overview

- **Frontend:** Single Page Application (React, Vite, TypeScript, Tailwind CSS) deployed to **Vercel** or **Netlify**.
- **Backend:** Node.js Express REST API (TypeScript, Helmet, CORS, Rate Limiting) deployed to **Render** or **Railway**.
- **Database:** **MongoDB Atlas** cluster (Mongoose ODM).
- **AI Processing:** **Anthropic Claude 3.7 Sonnet** API via backend SDK.
- **Evidence Storage:** Local filesystem storage during development, **Cloudinary** / S3 bucket in production.

---

## 1. MongoDB Atlas Setup

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Network Access**, add IP `0.0.0.0/0` (or the specific outbound IPs of your backend hosting provider).
3. Under **Database Access**, create a user with read/write privileges (e.g., `sethu_admin`).
4. Copy the connection string format:
   ```env
   MONGODB_URI=mongodb+srv://sethu_admin:<password>@cluster0.mongodb.net/sethu?retryWrites=true&w=majority
   ```

---

## 2. Backend Deployment (Render / Railway)

### Deploying to Render
1. Connect your repository to [Render](https://render.com).
2. Choose **Web Service**.
3. Configure the service:
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. In **Environment Variables**, set:
   ```env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://...
   JWT_ACCESS_SECRET=your_super_strong_jwt_access_secret_min_32_chars
   JWT_REFRESH_SECRET=your_super_strong_jwt_refresh_secret_min_32_chars
   CLIENT_URL=https://your-frontend-domain.vercel.app
   ANTHROPIC_API_KEY=sk-ant-api03-...
   CLAUDE_MODEL=claude-3-7-sonnet-20250219
   SMS_PROVIDER=console_mock
   STORAGE_PROVIDER=local
   DEV_OTP_MODE=false
   DEMO_MODE=true
   ```

---

## 3. Frontend Deployment (Vercel)

1. Connect your repository to [Vercel](https://vercel.com).
2. Select the repository root.
3. Configure project settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Set Environment Variables:
   - `VITE_API_URL=https://your-backend-service.onrender.com/api` (if not using rewrite proxy)
5. Under `vercel.json` (optional), rewrite `/api/(.*)` to your Render backend URL if using a unified custom domain.

---

## 4. Production Security Checklist

- [x] Passwords salted and hashed with **bcryptjs** (12 rounds).
- [x] JWT tokens split into 15-minute access tokens and 7-day refresh tokens.
- [x] Rate limiting active on OTP requests (`otpRequestLimiter`), login attempts (`loginLimiter`), and general API endpoints (`apiLimiter`).
- [x] Exact coordinates and private health information redacted from public views.
- [x] Perceptual image hashing (`dHash`) flags duplicate uploads without facial biometrics.
- [x] Audit ledger records every consent change, lead review, and sensitive access event.
- [x] Helmet security headers active.
- [x] CORS restricted to authorized frontend origins.
