import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const rateLimitMap = new Map<string, { count: number; reset: number }>()
const RATE_LIMIT = 100
const RATE_WINDOW = 60 * 60 * 1000 // 1 hour

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(userId)
  if (!entry || now > entry.reset) {
    rateLimitMap.set(userId, { count: 1, reset: now + RATE_WINDOW })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.slice(7)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user } } = await supabase.auth.getUser(token)
  return user
}

async function isPremiumUser(userId: string): Promise<boolean> {
  const { createClient } = await import('@supabase/supabase-js')
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('premium')
    .eq('id', userId)
    .single()
  return data?.premium === true
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const premium = await isPremiumUser(user.id)
  if (!premium) {
    return NextResponse.json({ error: 'Premium required' }, { status: 403 })
  }

  if (!checkRateLimit(user.id)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const { text, voice, speed } = await req.json()

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: text,
      voice: voice || 'alloy',
      speed: speed || 1.0,
      response_format: 'mp3',
    }),
  })

  if (!response.ok) {
    return NextResponse.json({ error: 'TTS failed' }, { status: 502 })
  }

  const audioBuffer = await response.arrayBuffer()
  return new NextResponse(audioBuffer, {
    headers: { 'Content-Type': 'audio/mpeg' },
  })
}
