# 🏢 CAMPUSFIX — Smart Campus Facility & Infrastructure Management System

> **"Report. Track. Resolve."**  
> A Next-Generation Full-Stack Web Platform for Real-Time Campus Incident Triage, Role-Based Access Control, TOTP 2FA Security, Automated Gmail SMTP Notifications & Database Retention Management.

---

## 🌟 Key Features

- **🎓 Multi-Role Portal Segregation:**
  - **Student Portal:** University Roll Number validation, department selection, photo proof attachment, and personal resolution timeline.
  - **Faculty Portal:** Official Employee ID authentication with priority maintenance routing for lecture halls and research laboratories.
  - **Administrator Hub:** Two-Factor Authentication (TOTP / Google Authenticator), multi-dimensional triage table, staff dispatch, and dynamic admin enrollment.
- **📬 5-Flow Real-Time Email Architecture (Gmail SMTP):**
  1. *User Login Security Notification*
  2. *User Logout Confirmation*
  3. *Admin Incident Alert with Embedded Photo Proof*
  4. *User Ticket Progress & Technician Dispatch Updates*
  5. *Issue Resolution & Closure Notice*
- **🧹 Automated 3-Day Database Retention Policy:**
  - Automatically sweeps and purges resolved tickets older than 3 days (72 hours) to optimize cloud storage.
  - *Danger Zone:* 1-click full database reset for fresh academic semesters.
- **⚡ 1.5s Real-Time Synchronization:**
  - Instant cross-tab and cross-device live updates without manual page reload.
- **🔐 Enterprise Security:**
  - RFC 6238 TOTP Google Authenticator 2FA, session isolation across tabs/restarts, and dynamic access revocation.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express.js, CORS, Dotenv, Nodemailer
- **Database:** MongoDB Atlas (Cloud Cluster) & Local Fallback Cache
- **Authentication:** Google Authenticator 2FA (TOTP) & Session Storage Isolation
- **Email Protocol:** Gmail SMTP Gateway (`campusfix5641@gmail.com`)

---

## 🚀 Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/mattasaiswaroop5641-byte/campusfix.git
cd campusfix
```

### 2. Configure Backend Environment
Create a `.env` file inside the `server/` folder based on `server/.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/campusfix?retryWrites=true&w=majority
GMAIL_USER=campusfix5641@gmail.com
GMAIL_PASS=your_16_char_google_app_password
```

### 3. Install Dependencies & Run
**Terminal 1 (Backend API Server):**
```bash
cd server
npm install
node server.js
```

**Terminal 2 (Frontend React App):**
```bash
npm install
npm run dev -- --host
```

Access the application in your browser at `http://localhost:5173`.

---

## 🚂 Step-by-Step Railway Deployment Guide

You can easily deploy CAMPUSFIX on [Railway.app](https://railway.app) in two simple services:

### Step 1: Deploy Backend API Service on Railway
1. Log in to [Railway.app](https://railway.app) and click **+ New Project**.
2. Select **Deploy from GitHub repo** and choose `mattasaiswaroop5641-byte/campusfix`.
3. Go to **Service Settings**:
   - **Root Directory:** Set to `/server`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Go to the **Variables** tab and add the following Environment Variables:
   - `PORT` = `5000`
   - `MONGODB_URI` = *Your MongoDB Atlas connection string*
   - `GMAIL_USER` = `campusfix5641@gmail.com`
   - `GMAIL_PASS` = *Your 16-character Google App Password*
5. Go to **Networking** and click **Generate Domain** (e.g. `https://campusfix-backend.up.railway.app`).

### Step 2: Deploy Frontend Client Service on Railway
1. In the same Railway project, click **+ New Service** -> **GitHub Repo** -> `mattasaiswaroop5641-byte/campusfix`.
2. Go to **Service Settings**:
   - **Root Directory:** Set to `/` (Project Root)
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npx serve -s dist -l $PORT`
3. Go to the **Variables** tab and add:
   - `VITE_API_URL` = `https://campusfix-backend.up.railway.app/api` *(Use your Railway backend URL generated in Step 1)*
4. Go to **Networking** and click **Generate Domain** (e.g. `https://campusfix.up.railway.app`).
5. Open your frontend Railway URL to access your live production app!

---

## 📄 License
This project is developed for institutional campus infrastructure management.
