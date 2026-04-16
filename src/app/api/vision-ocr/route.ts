import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const rateLimitMap = new Map<string, { count: number; reset: number }>()
const RATE_LIMIT = 30
const RATE_WINDOW = 60 * 60 * 1000

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

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user } } = await supabase.auth.getUser(authHeader.slice(7))
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

  const { image } = await req.json()

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract all text from this image of a script/screenplay page. Preserve the exact formatting with character names followed by colons and their dialogue. Output ONLY the extracted text, nothing else. Preserve line breaks between different character lines.',
            },
            {
              type: 'image_url',
              image_url: { url: image, detail: 'high' },
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0,
    }),
  })

  if (!response.ok) {
    return NextResponse.json({ error: 'Vision OCR failed' }, { status: 502 })
  }

  const data = await response.json()
  const text = data.choices?.[0]?.message?.content || ''
  return NextResponse.json({ text })
}
