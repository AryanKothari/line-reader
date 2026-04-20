import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const rateLimitMap = new Map<string, { count: number; reset: number }>()
const dailyLimitMap = new Map<string, { count: number; reset: number }>()
const RATE_LIMIT = 60          // per hour
const RATE_WINDOW = 60 * 60 * 1000
const DAILY_LIMIT = 300        // per day
const DAILY_WINDOW = 24 * 60 * 60 * 1000

function checkRateLimit(userId: string): boolean {
  const now = Date.now()

  // Hourly limit
  const hourly = rateLimitMap.get(userId)
  if (!hourly || now > hourly.reset) {
    rateLimitMap.set(userId, { count: 1, reset: now + RATE_WINDOW })
  } else {
    if (hourly.count >= RATE_LIMIT) return false
    hourly.count++
  }

  // Daily limit
  const daily = dailyLimitMap.get(userId)
  if (!daily || now > daily.reset) {
    dailyLimitMap.set(userId, { count: 1, reset: now + DAILY_WINDOW })
  } else {
    if (daily.count >= DAILY_LIMIT) return false
    daily.count++
  }

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

  const { text, voice, speed, instructions } = await req.json()

  const useExpressiveModel = !!instructions
  const model = useExpressiveModel ? 'gpt-4o-mini-tts' : 'tts-1'

  const body: Record<string, unknown> = {
    model,
    input: text,
    voice: voice || 'alloy',
    response_format: 'mp3',
  }

  if (useExpressiveModel && instructions) {
    body.instructions = instructions
  } else {
    body.speed = speed || 1.0
  }

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    return NextResponse.json({ error: 'TTS failed' }, { status: 502 })
  }

  const audioBuffer = await response.arrayBuffer()
  return new NextResponse(audioBuffer, {
    headers: { 'Content-Type': 'audio/mpeg' },
  })
}
