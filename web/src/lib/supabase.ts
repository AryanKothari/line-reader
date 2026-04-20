import { initSupabase, getSupabase } from '@line-reader/shared'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

initSupabase(supabaseUrl, supabaseAnonKey)

export const supabase = getSupabase()
