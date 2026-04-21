# Nexus Mentorship — AI-Powered Startup Mentoring Platform

A full-stack web application that connects aspiring entrepreneurs with experienced startup mentors and provides an AI-powered advisor for instant strategic guidance.

**Live Site:** [https://0x4r35.github.io/sem-4-mini-project](https://0x4r35.github.io/sem-4-mini-project)

---

## Tech Stack

| Layer     | Technology                                |
| --------- | ----------------------------------------- |
| Frontend  | React 19, Vite, React Router, Lucide Icons |
| Backend   | Node.js, Express.js                       |
| AI        | Groq API (LLaMA 3.3 70B)                 |
| Database  | Supabase (PostgreSQL + Auth)              |
| Hosting   | GitHub Pages (frontend) + Render (backend)|

---

## Project Structure

```
startup-mentors-app/
├── public/               # Static assets
├── src/                  # React frontend
│   ├── components/       # Reusable UI components
│   ├── context/          # Auth context provider
│   ├── lib/              # Supabase client config
│   ├── pages/            # Page components (Home, Mentors, Agent, etc.)
│   ├── App.jsx           # Root component with routing
│   └── main.jsx          # Entry point
├── server/               # Express backend
│   ├── routes/
│   │   ├── ai.js         # Groq AI chat endpoint
│   │   ├── mentors.js    # Mentor CRUD routes
│   │   └── bookings.js   # Booking routes
│   ├── middleware/        # Auth middleware
│   ├── index.js          # Server entry point
│   └── .env              # Server environment variables (not committed)
├── render.yaml           # Render deployment blueprint
└── .env.local            # Frontend environment variables (not committed)
```

---

## How to Run Locally (Step-by-Step)

Open **Command Prompt** or **PowerShell** and run these commands one by one:

### 1. Clone the Repository

```bash
git clone https://github.com/0x4r35/sem-4-mini-project.git
cd sem-4-mini-project
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Create Frontend Environment File

Create a file called `.env.local` in the project root with this content:

```env
VITE_SUPABASE_URL=https://kxvjnjtbakosmevqkcyj.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

> For local development, you don't need `VITE_API_URL` — it defaults to `http://localhost:5000`.

### 4. Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

### 5. Create Backend Environment File

Create a file called `.env` inside the `server/` folder with this content:

```env
SUPABASE_URL=https://kxvjnjtbakosmevqkcyj.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
PORT=5000
GROQ_API_KEY=your_groq_api_key_here
```

### 6. Start the Backend Server

Open a **new terminal window** and run:

```bash
cd server
npm run dev
```

You should see:
```
🚀 Nexus Mentorship API running on http://localhost:5000
```

### 7. Start the Frontend Dev Server

In the **original terminal**, run:

```bash
npm run dev
```

You should see:
```
VITE v8.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/sem-4-mini-project/
```

### 8. Open in Browser

Go to: **http://localhost:5173/sem-4-mini-project/**

---

## Deployment

### Frontend → GitHub Pages

The frontend auto-deploys to GitHub Pages via GitHub Actions on every push to `main`.

To build manually:

```bash
npm run build
```

The output goes to the `dist/` folder.

### Backend → Render.com (Free)

1. Go to [https://render.com](https://render.com) and sign up with your GitHub account.
2. Click **New → Web Service**.
3. Connect your `sem-4-mini-project` repository.
4. Configure:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
   - **Instance Type:** Free
5. Add these **Environment Variables** in Render's dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`
   - `GROQ_API_KEY`
   - `CORS_ORIGIN` = `https://0x4r35.github.io`
6. Click **Deploy**.

After deployment, Render will give you a URL like `https://nexus-mentorship-api.onrender.com`.

### Connect Frontend to Deployed Backend

Add this to your GitHub repository's **Settings → Secrets → Actions** (or as a Vite env in your build):

```
VITE_API_URL=https://your-render-app-name.onrender.com
```

Then update your GitHub Actions workflow to include this env variable during the build step.

---

## Quick Reference — All Commands

```bash
# Clone
git clone https://github.com/0x4r35/sem-4-mini-project.git
cd sem-4-mini-project

# Install everything
npm install
cd server && npm install && cd ..

# Start backend (Terminal 1)
cd server
npm run dev

# Start frontend (Terminal 2)
npm run dev

# Build for production
npm run build
```

---

## Team

- **0x4r35** — [GitHub](https://github.com/0x4r35)

## License

This project is for educational purposes (Semester 4 Mini Project).
