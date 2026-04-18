import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Upsert profile with premium = true for new signups
  // onConflict ensures we don't downgrade existing users
  const { error } = await supabaseAdmin
    .from('profiles')
    .upsert(
      { id: user.id, premium: true },
      { onConflict: 'id', ignoreDuplicates: true }
    )

  if (error) {
    return NextResponse.json({ error: 'Failed to init profile' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
