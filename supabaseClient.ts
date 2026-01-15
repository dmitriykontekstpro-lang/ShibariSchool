import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cqpqyhehoiybggjuljzn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxcHF5aGVob2l5YmdnanVsanpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTQyODQsImV4cCI6MjA4MDA5MDI4NH0.H9PR8iNGM42wvJDfA7ntcz-aj5GWD1L7cl0VlGvFsBs';

let client: SupabaseClient | null = null;

// Проверяем валидность URL
const isValidUrl = (url: string) => {
  try {
    return Boolean(new URL(url));
  } catch (e) {
    return false;
  }
};

if (isValidUrl(SUPABASE_URL)) {
  client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  console.warn('Supabase URL не настроен или некорректен.');
}

export const supabase = client;