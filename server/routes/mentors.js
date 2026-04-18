import { Router } from 'express';
import { supabaseAdmin } from '../index.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/mentors — public list of all mentors with details
router.get('/', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select(`
      id, full_name, avatar_url, email,
      mentor_details (title, bio, expertise, rating, sessions_count, available)
    `)
    .eq('role', 'mentor')
    .eq('mentor_details.available', true)
    .order('full_name');

  if (error) return res.status(500).json({ error: error.message });
  res.json({ mentors: data });
});

// GET /api/mentors/:id — single mentor profile
router.get('/:id', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select(`
      id, full_name, avatar_url, email,
      mentor_details (*)
    `)
    .eq('id', req.params.id)
    .eq('role', 'mentor')
    .single();

  if (error) return res.status(404).json({ error: 'Mentor not found' });
  res.json({ mentor: data });
});

// PUT /api/mentors/profile — mentor updates their own profile (auth required)
router.put('/profile', requireAuth, requireRole('mentor'), async (req, res) => {
  const { title, bio, expertise, available } = req.body;
  const { error } = await supabaseAdmin
    .from('mentor_details')
    .update({ title, bio, expertise, available, updated_at: new Date().toISOString() })
    .eq('id', req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

export default router;
