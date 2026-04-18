/**
 * NEXUS MENTORSHIP — DATABASE SEED SCRIPT (v2)
 * Run from server/ directory: node seed.js
 * Seeds 4 demo mentors + 1 demo user into Supabase
 * Handles the case where auth users already exist but profiles don't.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const mentors = [
  {
    email: 'elena.rodriguez@nexusdemo.com',
    password: 'Mentor123!',
    full_name: 'Elena Rodriguez',
    details: {
      title: 'Ex-CFO at Stripe',
      bio: 'Scaled payments infrastructure globally across 40+ countries. Specializes in Series B to IPO financial strategy and FinTech regulatory compliance.',
      expertise: ['Fintech', 'Fundraising', 'Scale-ups'],
      rating: 4.9,
      sessions_count: 142,
      available: true
    }
  },
  {
    email: 'marcus.chen@nexusdemo.com',
    password: 'Mentor123!',
    full_name: 'Marcus Chen',
    details: {
      title: 'Former VP Engineering, Coinbase',
      bio: 'Built scalable engineering teams from 10 to 500+. Passionate about robust distributed systems, zero-downtime deployments, and security-first architecture.',
      expertise: ['Blockchain', 'System Architecture', 'Security'],
      rating: 5.0,
      sessions_count: 89,
      available: true
    }
  },
  {
    email: 'sarah.jenkins@nexusdemo.com',
    password: 'Mentor123!',
    full_name: 'Sarah Jenkins',
    details: {
      title: 'Partner at Sequoia Capital',
      bio: '10+ years investing in enterprise software. Helps founders refine their pitch deck, pricing strategy, and navigate the venture fundraising landscape.',
      expertise: ['Venture Capital', 'B2B SaaS', 'GTM Strategy'],
      rating: 4.8,
      sessions_count: 207,
      available: true
    }
  },
  {
    email: 'david.kim@nexusdemo.com',
    password: 'Mentor123!',
    full_name: 'David Kim',
    details: {
      title: 'Founder & CEO (Exited @ $180M)',
      bio: 'Bootstrapped to $50M ARR and successfully exited via acquisition. Mentors founders on capital-efficient growth loops, M&A preparation, and post-exit strategy.',
      expertise: ['Consumer Tech', 'Product Led Growth', 'M&A'],
      rating: 4.9,
      sessions_count: 176,
      available: true
    }
  }
];

const demoUser = {
  email: 'demo.user@nexusdemo.com',
  password: 'User123!',
  full_name: 'Alex Founder',
  role: 'user'
};

async function getOrCreateUser(email, password, full_name, role) {
  // Try create first
  const { data, error } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { full_name, role }
  });

  if (!error && data?.user) return data.user;

  // Already exists? Find them
  if (error?.message?.includes('already been registered')) {
    const { data: listData } = await supabase.auth.admin.listUsers();
    const existing = listData?.users?.find(u => u.email === email);
    return existing || null;
  }

  console.error(`  ❌ Error with ${email}:`, error?.message);
  return null;
}

async function ensureProfile(userId, email, full_name, role) {
  // Use service key to bypass RLS — upsert profile row
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    email,
    full_name,
    role,
    updated_at: new Date().toISOString()
  }, { onConflict: 'id' });

  if (error) {
    console.error(`    Profile upsert error for ${email}:`, error.message);
    return false;
  }
  return true;
}

async function ensureMentorDetails(userId, details) {
  const { error } = await supabase.from('mentor_details').upsert({
    id: userId,
    ...details,
    updated_at: new Date().toISOString()
  }, { onConflict: 'id' });

  if (error) {
    console.error(`    MentorDetails upsert error:`, error.message);
    return false;
  }
  return true;
}

async function seed() {
  console.log('\n🌱 Seeding Nexus Mentorship database...\n');

  // ── Demo user ──
  console.log('Creating demo user account...');
  const demoAuthUser = await getOrCreateUser(demoUser.email, demoUser.password, demoUser.full_name, 'user');
  if (demoAuthUser) {
    await ensureProfile(demoAuthUser.id, demoUser.email, demoUser.full_name, 'user');
    console.log(`  ✅ Demo User: ${demoUser.email} / ${demoUser.password}\n`);
  }

  // ── Mentors ──
  console.log('Creating mentor accounts...');
  const results = [];

  for (const m of mentors) {
    process.stdout.write(`  Creating ${m.full_name}... `);
    
    const authUser = await getOrCreateUser(m.email, m.password, m.full_name, 'mentor');
    if (!authUser) { console.log('FAILED (auth)'); continue; }

    const profileOk = await ensureProfile(authUser.id, m.email, m.full_name, 'mentor');
    if (!profileOk) { console.log('FAILED (profile)'); continue; }

    const detailsOk = await ensureMentorDetails(authUser.id, m.details);
    if (!detailsOk) { console.log('FAILED (details)'); continue; }

    console.log('✅');
    results.push({ name: m.full_name, email: m.email, password: m.password });
  }

  console.log('\n══════════════════════════════════════════════');
  console.log('✅  SEEDING COMPLETE — Demo Credentials');
  console.log('══════════════════════════════════════════════');
  console.log('\n👤 Demo User (Founder):');
  console.log(`   Email:    ${demoUser.email}`);
  console.log(`   Password: ${demoUser.password}`);
  console.log('\n🎓 Demo Mentors:');
  results.forEach(r => console.log(`   ${r.name.padEnd(18)} ${r.email.padEnd(36)} / ${r.password}`));
  console.log('\n══════════════════════════════════════════════\n');
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
