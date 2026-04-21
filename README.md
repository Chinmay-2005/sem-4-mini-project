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

## License

This project is for educational purposes (Semester 4 Mini Project).
