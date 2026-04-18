-- ======================================================
-- NEXUS MENTORSHIP SYSTEM — SUPABASE DATABASE SCHEMA
-- Paste this ENTIRE file into Supabase SQL Editor and Run
-- ======================================================

-- ---- TABLES ----

CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email       TEXT,
  full_name   TEXT,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'mentor')),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mentor_details (
  id              UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  title           TEXT    DEFAULT '',
  bio             TEXT    DEFAULT '',
  expertise       TEXT[]  DEFAULT '{}',
  rating          NUMERIC(3,2) DEFAULT 4.5,
  sessions_count  INTEGER DEFAULT 0,
  available       BOOLEAN DEFAULT TRUE,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  mentor_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status       TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','cancelled')),
  message      TEXT DEFAULT '',
  scheduled_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ---- ROW LEVEL SECURITY ----

ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings       ENABLE ROW LEVEL SECURITY;

-- Profiles
DROP POLICY IF EXISTS "profiles_select"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_update"  ON public.profiles;

CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Mentor Details
DROP POLICY IF EXISTS "mentor_details_select" ON public.mentor_details;
DROP POLICY IF EXISTS "mentor_details_insert" ON public.mentor_details;
DROP POLICY IF EXISTS "mentor_details_update" ON public.mentor_details;

CREATE POLICY "mentor_details_select" ON public.mentor_details FOR SELECT USING (true);
CREATE POLICY "mentor_details_insert" ON public.mentor_details FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "mentor_details_update" ON public.mentor_details FOR UPDATE USING (auth.uid() = id);

-- Bookings
DROP POLICY IF EXISTS "bookings_select" ON public.bookings;
DROP POLICY IF EXISTS "bookings_insert" ON public.bookings;
DROP POLICY IF EXISTS "bookings_update" ON public.bookings;

CREATE POLICY "bookings_select" ON public.bookings FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = mentor_id);
CREATE POLICY "bookings_insert" ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookings_update" ON public.bookings FOR UPDATE
  USING (auth.uid() = mentor_id OR auth.uid() = user_id);

-- ---- AUTO-CREATE PROFILE TRIGGER ----

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    email      = EXCLUDED.email,
    full_name  = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = NOW();

  -- Auto-create mentor_details for mentors
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'user') = 'mentor' THEN
    INSERT INTO public.mentor_details (id, title, bio, expertise)
    VALUES (NEW.id, 'Startup Mentor', 'Experienced mentor on Nexus Mentorship.', '{}')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
