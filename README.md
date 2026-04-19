# 🚀 Nexus Mentorship — Startup Mentoring Platform

> **Sem 4 Mini Project** — A full-stack mentoring platform that connects startup founders with world-class industry mentors.

## 🌐 Live Demo

### **[→ Open the App](https://0x4r35.github.io/sem-4-mini-project/)**

| Role | Email | Password |
|------|-------|----------|
| 👤 Founder | `demo.user@nexusdemo.com` | `User123!` |
| 🎓 Mentor | `elena.rodriguez@nexusdemo.com` | `Mentor123!` |
| 🎓 Mentor | `marcus.chen@nexusdemo.com` | `Mentor123!` |
| 🎓 Mentor | `sarah.jenkins@nexusdemo.com` | `Mentor123!` |
| 🎓 Mentor | `david.kim@nexusdemo.com` | `Mentor123!` |

---

## ✨ Features

### Authentication & Security
- 🔐 Email/Password authentication via Supabase Auth
- 🟢 Google OAuth integration
- 🔄 Persistent sessions — login survives page refresh & browser close
- 🛡️ Role-based access control (Founder vs Mentor dashboards)
- 🚧 Protected routes with automatic redirects

### For Founders
- 📋 Browse and search mentor profiles
- 📩 Request 1-on-1 sessions with mentors
- 📊 Personalized dashboard with booking history
- 🤖 AI-powered startup advisor (OpenAI GPT integration)

### For Mentors
- 🎯 Dedicated mentor dashboard
- ✅ Accept / Decline incoming session requests
- ✏️ Edit profile — title, bio, expertise tags
- ⭐ Rating and session count display

### Technical Highlights
- ⚡ Real-time data from Supabase PostgreSQL
- 🎨 Premium glassmorphism UI with dark mode
- 📱 Fully responsive design
- 🔒 Row Level Security (RLS) policies on all tables
- 🔁 Auto-trigger creates user profiles on signup

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite |
| **Styling** | Custom CSS (Glassmorphism, Dark Mode) |
| **Routing** | React Router v6 |
| **Auth & Database** | Supabase (PostgreSQL + Auth + RLS) |
| **Backend API** | Node.js + Express.js |
| **AI Advisor** | OpenAI GPT API |
| **Icons** | Lucide React |
| **Deployment** | GitHub Pages (Frontend) |

---

## 📁 Project Structure

```
startup-mentors-app/
├── public/                  # Static assets
├── src/
│   ├── components/
│   │   └── ProtectedRoute.jsx    # Auth guard for protected pages
│   ├── context/
│   │   └── AuthContext.jsx       # Global auth state + session management
│   ├── lib/
│   │   └── supabase.js           # Supabase client configuration
│   ├── pages/
│   │   ├── Home.jsx              # Landing page
│   │   ├── Login.jsx             # Login (Email + Google OAuth)
│   │   ├── Signup.jsx            # Signup with role selection
│   │   ├── Mentors.jsx           # Mentor directory (live from DB)
│   │   ├── Agent.jsx             # AI Startup Advisor
│   │   ├── UserDashboard.jsx     # Founder dashboard
│   │   └── MentorDashboard.jsx   # Mentor dashboard
│   ├── App.jsx                   # Root component + routing
│   ├── index.css                 # Design system + all styles
│   └── main.jsx                  # React entry point
├── server/
│   ├── routes/
│   │   ├── mentors.js            # Mentor CRUD API
│   │   └── bookings.js           # Booking management API
│   ├── middleware/
│   │   └── auth.js               # JWT verification middleware
│   ├── index.js                  # Express server entry point
│   ├── seed.js                   # Database seed script
│   ├── schema.sql                # Supabase SQL schema
│   └── package.json              # Server dependencies
├── vercel.json                   # Vercel SPA routing config
├── vite.config.js                # Vite build configuration
└── package.json                  # Frontend dependencies
```

---

## 🗄️ Database Schema

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│   profiles   │     │  mentor_details   │     │   bookings   │
├──────────────┤     ├──────────────────┤     ├──────────────┤
│ id (PK/FK)   │────▶│ id (PK/FK)       │     │ id (PK)      │
│ email        │     │ title            │     │ user_id (FK) │
│ full_name    │     │ bio              │     │ mentor_id(FK)│
│ role         │     │ expertise[]      │     │ status       │
│ avatar_url   │     │ rating           │     │ message      │
│ created_at   │     │ sessions_count   │     │ scheduled_at │
│ updated_at   │     │ available        │     │ created_at   │
└──────────────┘     └──────────────────┘     └──────────────┘
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier)

### 1. Clone & Install
```bash
git clone https://github.com/0x4r35/sem-4-mini-project.git
cd sem-4-mini-project
npm install
cd server && npm install && cd ..
```

### 2. Environment Variables

**Frontend** — Create `.env.local` in root:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_OPENAI_API_KEY=your_openai_key  # optional
```

**Backend** — Create `.env` in `/server`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
PORT=5000
```

### 3. Database Setup
1. Open the [Supabase SQL Editor](https://supabase.com/dashboard)
2. Paste and run `server/schema.sql`
3. Seed the database: `cd server && node seed.js`

### 4. Run
```bash
# Terminal 1 — Frontend
npm run dev

# Terminal 2 — Backend
cd server && npm run dev
```

Open **http://localhost:5173**

---

## 👥 Team

Built as a Semester 4 Mini Project.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
