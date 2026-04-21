import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import mentorRoutes from './routes/mentors.js';
import bookingRoutes from './routes/bookings.js';
import aiRoutes from './routes/ai.js';
import notifyRoutes from './routes/notify.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Admin Supabase client (service role — server only, never send to browser)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Anon Supabase client (for verifying user tokens)
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://0x4r35.github.io',        // GitHub Pages
  process.env.CORS_ORIGIN,            // Custom origin from env (optional)
].filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Routes
app.use('/api/mentors', mentorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notify', notifyRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Nexus Mentorship API running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
