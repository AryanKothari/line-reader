import { createClient, SupabaseClient } from '@supabase/supabase-js'

let instance: SupabaseClient | null = null

export function initSupabase(url: string, anonKey: string): SupabaseClient {
  instance = createClient(url, anonKey)
  return instance
}

export function getSupabase(): SupabaseClient {
  if (!instance) {
    throw new Error('Supabase not initialized. Call initSupabase() first.')
  }
  return instance
}
