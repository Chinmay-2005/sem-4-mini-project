import { createClient } from '@supabase/supabase-js';

// Public anon key — safe for frontend (protected by RLS policies)
const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL      || 'https://kxvjnjtbakosmevqkcyj.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4dmpuanRiYWtvc21ldnFrY3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MDI4NzcsImV4cCI6MjA5MjA3ODg3N30.8h4OJr_tLFZw436xEACnOuCpufhJUA0HVyCj4xpPdoI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession:     true,
    autoRefreshToken:   true,
    detectSessionInUrl: true,
    storageKey:         'nexus-auth'
  }
});
