import { createClient, SupabaseClient, type SupabaseClientOptions } from '@supabase/supabase-js'

let instance: SupabaseClient | null = null

export function initSupabase(url: string, anonKey: string, options?: SupabaseClientOptions<'public'>): SupabaseClient {
  instance = createClient(url, anonKey, options)
  return instance
}

export function getSupabase(): SupabaseClient {
  if (!instance) {
    throw new Error('Supabase not initialized. Call initSupabase() first.')
  }
  return instance
}
