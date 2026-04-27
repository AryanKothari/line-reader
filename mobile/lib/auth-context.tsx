import 'react-native-url-polyfill/auto'
import { createContext, useContext, useEffect, useState } from 'react'
import { initSupabase, getSupabase } from '@line-reader/shared'
import type { User } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'

type Profile = {
  id: string
  display_name: string | null
  premium: boolean
}

type AuthState = {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  isPremium: boolean
}

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  isPremium: false,
})

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''

console.log('[Auth] Supabase URL:', supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'EMPTY')
console.log('[Auth] Supabase Key:', supabaseAnonKey ? 'present (' + supabaseAnonKey.length + ' chars)' : 'EMPTY')

if (supabaseUrl && supabaseAnonKey) {
  try {
    initSupabase(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
      global: {
        fetch: fetch.bind(globalThis),
      },
    })
    console.log('[Auth] Supabase initialized with AsyncStorage')
  } catch {
    console.log('[Auth] Supabase already initialized')
  }
} else {
  console.warn('[Auth] Missing Supabase credentials — login will not work')
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    try {
      const supabase = getSupabase()
      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, premium')
        .eq('id', userId)
        .single()
      setProfile(data)
    } catch {
      // supabase not initialized yet
    }
  }

  useEffect(() => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setLoading(false)
      return
    }

    const supabase = getSupabase()

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const supabase = getSupabase()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  const signUp = async (email: string, password: string) => {
    const supabase = getSupabase()
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (!error && data.user) {
      // Init profile directly via supabase (no API route on mobile)
      const supabaseAdmin = getSupabase()
      await supabaseAdmin
        .from('profiles')
        .upsert(
          { id: data.user.id, premium: true },
          { onConflict: 'id', ignoreDuplicates: true }
        )
    }
    return { error: error?.message ?? null }
  }

  const signOut = async () => {
    const supabase = getSupabase()
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      isPremium: profile?.premium ?? false,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
