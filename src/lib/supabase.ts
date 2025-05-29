import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lvvprgyugpeapokubpea.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface LeaderboardEntry {
  id: number;
  name: string;
  completed_at: string;
  created_at: string;
}

export const submitScore = async (name: string) => {
  const { data, error } = await supabase
    .from('leaderboard')
    .insert([{ name, completed_at: new Date().toISOString() }])
    .select();

  if (error) throw error;
  return data;
};

export const getLeaderboard = async () => {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('completed_at', { ascending: true });

  if (error) throw error;
  return data;
};
