# Line Reader — Backend Proxy + Auth Design

## Overview

Add server-side OpenAI proxy and user authentication to Line Reader. Users get a free tier (browser voices, Tesseract OCR) by default. Signed-in users flagged as premium by the admin get access to OpenAI TTS and vision OCR through server-side API routes. The OpenAI key never reaches the client.

## Tech Stack

- **Auth**: Supabase Auth (Google + email/password)
- **Database**: Supabase Postgres (profiles table with premium flag)
- **API Routes**: Next.js App Router route handlers (`/api/tts`, `/api/vision-ocr`)
- **Deploy**: Vercel (env vars for OpenAI key + Supabase service role key)

## Supabase Setup

**Project**: `https://tvoylkvqbbpsxzmwjuak.supabase.co`

### Tables

**`profiles`**
| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid (PK) | | References auth.users.id |
| display_name | text | null | From auth provider |
| premium | boolean | false | Admin flips to true in dashboard |
| created_at | timestamptz | now() | |

Row Level Security:
- Users can read their own profile
- Only service role can update `premium` (admin via dashboard)

**Trigger**: Auto-create a profile row when a new user signs up (Postgres trigger on auth.users insert).

### Auth Providers

- Google OAuth
- Email/password

Configured in Supabase dashboard under Authentication → Providers.

## API Routes

### `POST /api/tts`

**Request**: `{ text: string, voice: string, speed: number }`
**Response**: Audio stream (MP3)

Flow:
1. Read Supabase auth token from `Authorization` header
2. Verify token with Supabase, fetch user's profile
3. If no token or `premium !== true`, return 403
4. Call OpenAI TTS (`https://api.openai.com/v1/audio/speech`) with server-side `OPENAI_API_KEY`
5. Stream the MP3 response back to client

### `POST /api/vision-ocr`

**Request**: `{ image: string }` (base64 data URL of a PDF page)
**Response**: `{ text: string }` (extracted text)

Flow:
1. Same auth check as TTS
2. Call OpenAI chat completions with gpt-4o-mini vision
3. Return extracted text

### Rate Limiting

In-memory per-user rate limit (keyed by user ID from the auth token):
- TTS: 100 requests/hour
- Vision OCR: 30 requests/hour
- Returns 429 if exceeded
- Map resets hourly via `setInterval`

## User Tiers

### Basic (default, no sign-in required)
- Browser TTS voices (Web Speech API)
- Tesseract OCR for scanned PDFs
- Full rehearsal functionality
- Scripts saved to localStorage

### Premium (signed in + `premium = true`)
- OpenAI TTS voices (Alloy, Echo, Fable, Onyx, Nova, Shimmer)
- GPT-4o-mini vision OCR for scanned PDFs
- Scripts saved to cloud (Supabase) — deferred, not in this spec
- Everything in Basic

## Frontend Changes

### Remove
- API key input on upload screen
- API key input in VoiceSettings component
- All localStorage API key logic (`lineReader_openaiKey`)
- Direct OpenAI fetch calls from client code

### Add

**Auth button (all screens)**:
- Top-right of header on every screen
- Signed out: "Sign in" text button
- Signed in: user avatar/initial + name
- Click when signed in: dropdown with "Sign out"
- Uses Supabase Auth UI or simple redirect flow

**AuthProvider (root layout)**:
- Supabase client initialized with project URL + anon key
- Auth state available via React context
- Provides `user`, `profile` (with premium flag), `signIn()`, `signOut()`

**Upload screen**:
- No API key input
- If signed in + premium: vision OCR used automatically for scanned PDFs
- If not: Tesseract fallback, no messaging about it

**Setup screen (VoiceSettings)**:
- Free/Premium toggle behavior:
  - If signed in + premium: both options available
  - If signed in but not premium: Premium shows lock icon, "Premium voices — ask admin for access"
  - If not signed in: Premium shows lock icon, "Sign in for premium voices"
- No API key input anywhere

### Modify

**`src/lib/ai-voices.ts`**:
- Remove all localStorage API key logic
- `speak()` calls `/api/tts` instead of OpenAI directly
- Accepts auth token from the auth context

**`src/lib/parser/pdf-extract.ts`**:
- `extractTextWithVision()` calls `/api/vision-ocr` instead of OpenAI directly
- Falls back to Tesseract if user is not premium or request fails

## Environment Variables

```
# .env.local (never committed)
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=https://tvoylkvqbbpsxzmwjuak.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=<from Supabase dashboard, Settings → API>
```

`NEXT_PUBLIC_` prefixed vars are available client-side (needed for Supabase client init).
`OPENAI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are server-only.

## File Structure (new/modified files)

```
src/
├── app/
│   ├── api/
│   │   ├── tts/route.ts            # TTS proxy
│   │   └── vision-ocr/route.ts     # Vision OCR proxy
│   ├── layout.tsx                   # Add AuthProvider
│   └── page.tsx                     # Remove API key input
├── components/
│   ├── shared/
│   │   └── AuthButton.tsx           # Sign in/out button
│   └── setup/
│       └── VoiceSettings.tsx        # Premium gating UI
├── lib/
│   ├── supabase.ts                  # Supabase client (browser)
│   ├── supabase-server.ts           # Supabase client (server, service role)
│   ├── ai-voices.ts                 # Remove API key, call /api/tts
│   ├── parser/pdf-extract.ts        # Call /api/vision-ocr
│   └── auth-context.tsx             # React context for auth state + profile
```
