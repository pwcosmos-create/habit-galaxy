import { createClient } from '@supabase/supabase-js';

// ──────────────────────────────────────────────────────────
// 👇 Supabase 프로젝트를 만들면 아래 두 값을 채워주세요!
//    https://supabase.com → New Project → Settings → API
// ──────────────────────────────────────────────────────────
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://PLACEHOLDER.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'PLACEHOLDER_KEY';

export const supabase = createClient(supabaseUrl, supabaseKey);

// ──────────────────────────────────────────────────────────
// Auth Helpers
// ──────────────────────────────────────────────────────────
export const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
};

export const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
};

export const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    return { data, error };
};

export const signOut = async () => {
    await supabase.auth.signOut();
};

// ──────────────────────────────────────────────────────────
// Profile / Game Data Helpers
// ──────────────────────────────────────────────────────────

/** Fetch a user's profile from the `profiles` table */
export const fetchProfile = async (userId) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    return { data, error };
};

/** Save (upsert) game progress */
export const saveProgress = async (userId, { level, xp, streak, starCoins, gems }) => {
    const { data, error } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            level,
            xp,
            streak,
            star_coins: starCoins,
            gems,
            updated_at: new Date().toISOString(),
        });
    return { data, error };
};

/** Log a completed habit to `habit_logs` table */
export const logHabit = async (userId, habitId, xpGained, dmgDealt) => {
    const { data, error } = await supabase
        .from('habit_logs')
        .insert({
            user_id: userId,
            habit_id: habitId,
            xp_gained: xpGained,
            dmg_dealt: dmgDealt,
            logged_at: new Date().toISOString(),
        });
    return { data, error };
};

// ──────────────────────────────────────────────────────────
// SQL schema to run in Supabase SQL Editor (reference only)
// ──────────────────────────────────────────────────────────
/*
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT,
  level INT DEFAULT 1,
  xp INT DEFAULT 0,
  streak INT DEFAULT 0,
  star_coins INT DEFAULT 0,
  gems INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE habit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  habit_id INT,
  xp_gained INT,
  dmg_dealt INT,
  logged_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see and edit their own data
CREATE POLICY "Own row" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Own logs" ON habit_logs FOR ALL USING (auth.uid() = user_id);
*/
