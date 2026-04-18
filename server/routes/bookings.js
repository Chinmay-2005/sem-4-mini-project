import { Router } from 'express';
import { supabaseAdmin } from '../index.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/bookings — create a booking (user only)
router.post('/', requireAuth, async (req, res) => {
  const { mentor_id, message, scheduled_at } = req.body;

  if (!mentor_id) return res.status(400).json({ error: 'mentor_id is required' });

  const { data, error } = await supabaseAdmin.from('bookings').insert({
    user_id: req.user.id,
    mentor_id,
    message: message || '',
    scheduled_at: scheduled_at || null,
    status: 'pending'
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ booking: data });
});

// GET /api/bookings/mine — get current user's bookings
router.get('/mine', requireAuth, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select(`
      *,
      mentor:profiles!bookings_mentor_id_fkey (
        id, full_name, avatar_url,
        mentor_details (title, rating)
      )
    `)
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ bookings: data });
});

// GET /api/bookings/requests — mentor sees incoming requests
router.get('/requests', requireAuth, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select(`
      *,
      user:profiles!bookings_user_id_fkey (id, full_name, avatar_url, email)
    `)
    .eq('mentor_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ bookings: data });
});

// PATCH /api/bookings/:id — update booking status
router.patch('/:id', requireAuth, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['confirmed', 'completed', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  const { data, error } = await supabaseAdmin
    .from('bookings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .or(`mentor_id.eq.${req.user.id},user_id.eq.${req.user.id}`)
    .select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ booking: data });
});

export default router;
