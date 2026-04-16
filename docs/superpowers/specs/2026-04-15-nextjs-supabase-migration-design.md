# Line Reader — Next.js + Supabase Migration Design

## Overview

Migrate Line Reader from a vanilla JS static site (~2,700 lines) to a Next.js + Supabase application. Goal: make it shareable via URL with user accounts and cloud-saved scripts, while keeping the app functional without an account. Architecture should support future evolution toward a full product (groups, sharing, collaborative features) without requiring another rewrite.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **State**: Zustand (single store for script/rehearsal state)
- **Styling**: Tailwind CSS with custom theme tokens preserving current theater aesthetic
- **Backend**: Supabase (Postgres, Auth, Storage)
- **Deploy**: Vercel
- **Libraries**: pdf.js (PDF extraction), Tesseract.js (OCR), @dnd-kit/core (drag-and-drop)

## Project Structure

```
line-reader/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout (fonts, providers, auth)
│   │   ├── page.tsx                # Landing / upload screen
│   │   ├── review/page.tsx         # Script review & editing
│   │   ├── setup/page.tsx          # Character selection & voice config
│   │   └── rehearsal/page.tsx      # The actual rehearsal
│   ├── components/
│   │   ├── upload/                 # DropZone, FileInput, SavedScriptsList
│   │   ├── review/                 # ScriptLineEditor, PdfPreview, DragList
│   │   ├── setup/                  # CharacterCard, VoiceAssignment
│   │   ├── rehearsal/              # ScriptView, Controls, ListeningIndicator
│   │   └── shared/                 # AuthButton, Layout elements
│   ├── lib/
│   │   ├── parser/                 # PDF extraction, OCR, script parsing
│   │   │   ├── pdf-extract.ts      # pdf.js text extraction + OCR fallback
│   │   │   ├── ocr.ts              # Tesseract.js wrapper
│   │   │   ├── script-parser.ts    # Character detection, line splitting
│   │   │   └── ocr-cleanup.ts      # OCR artifact normalization
│   │   ├── speech/
│   │   │   ├── recognition.ts      # Web Speech Recognition wrapper
│   │   │   ├── synthesis.ts        # Web Speech Synthesis wrapper
│   │   │   └── matching.ts         # Fuzzy line matching logic
│   │   ├── ai-voices.ts            # OpenAI TTS integration
│   │   └── supabase.ts             # Supabase client init
│   ├── stores/
│   │   └── script-store.ts         # Zustand store
│   └── types/
│       └── index.ts                # Shared type definitions
├── supabase/
│   └── migrations/                 # Database schema SQL
├── public/
│   └── sample-script.txt
├── next.config.ts
├── package.json
└── tailwind.config.ts
```

## Data Model

### Types

```typescript
type ScriptEntry = {
  character: string
  line: string
  type: 'dialogue' | 'direction'
}

type Script = {
  id: string
  title: string
  entries: ScriptEntry[]
  created_at: string
  updated_at: string
  user_id: string
}

type Character = {
  name: string
  lineCount: number
}
```

### Supabase Tables

**`profiles`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | References auth.users |
| display_name | text | |
| created_at | timestamptz | |

**`scripts`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| title | text | |
| entries | jsonb | Array of ScriptEntry |
| user_id | uuid (FK) | References profiles.id |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Row Level Security: users can only read/write their own scripts.

### Storage

Supabase Storage bucket `pdfs` for uploaded PDF files. RLS: users access only their own uploads. Path convention: `{user_id}/{script_id}.pdf`.

### Auth

Supabase Auth with Google + email/password sign-in. Auth is optional — the app works fully without an account using localStorage. Signing in syncs local scripts to the cloud.

## State Management

Single Zustand store replaces all scattered module-level variables:

```typescript
interface ScriptStore {
  // Script data
  parsedScript: ScriptEntry[]
  characters: Character[]
  selectedCharacter: string | null

  // Rehearsal state
  currentLineIndex: number
  isPaused: boolean
  isRunning: boolean
  practiceMode: boolean

  // Actions
  setParsedScript: (entries: ScriptEntry[]) => void
  updateLine: (index: number, line: string) => void
  deleteLine: (index: number) => void
  insertLine: (index: number, entry: ScriptEntry) => void
  reorderLine: (from: number, to: number) => void
  updateCharacter: (index: number, character: string) => void
  selectCharacter: (name: string) => void
  advanceLine: () => void
  goBack: () => void
  pause: () => void
  resume: () => void
  restart: () => void
  toggleMode: () => void
}
```

Voice configuration stays outside the store (Web Speech voice objects aren't serializable) — managed as refs within the speech modules.

Store auto-saves the `parsedScript` array to localStorage whenever the user navigates between screens (route change) or explicitly clicks Save. If the user is authenticated, clicking Save also upserts to Supabase.

## Screen Flow

### Upload (`/`)
- DropZone component for drag-and-drop + file picker (PDF, TXT)
- PDF parsing runs client-side: pdf.js for text extraction, Tesseract.js OCR fallback for scanned documents
- Two-page spread detection: splits wide images at midpoint before OCR
- OCR text cleanup: normalizes garbled character prefixes
- SavedScriptsList: fetches from Supabase (authenticated) or localStorage (guest)
- AuthButton in corner — non-intrusive, "Sign in" or avatar

### Review (`/review`)
- Side-by-side layout: editable parsed script (left) + original PDF rendered as images (right)
- Each script line is a ScriptLineEditor component: drag handle, character dropdown, editable text, delete button
- @dnd-kit/core for drag-to-reorder (accessible, supports touch)
- Add Line button pinned below the scrollable list
- Save (to Supabase/localStorage), Export JSON, Import JSON actions
- "Looks Good — Next" proceeds to setup

### Setup (`/setup`)
- CharacterCard components for each detected character, click to select "you"
- VoiceAssignment dropdowns for other characters + narrator
- AI voice toggle (OpenAI TTS) with API key input
- Navigation: "New Script" → `/`, "Edit Script" → `/review`

### Rehearsal (`/rehearsal`)
- ScriptView shows only past + current lines (future lines hidden)
- useRehearsal hook manages turn logic:
  - Other character's turn: speak line via Web Speech Synthesis (or OpenAI TTS)
  - User's turn: activate speech recognition, fuzzy-match against expected line
- Speech recognition stays active for the full session (no repeated mic prompts)
- Fuzzy matching: order-aware word matching with length-proportional Levenshtein. Thresholds: 100% for 1-2 word lines, 75% for 3-4, 60% for longer.
- Controls: restart, back, pause/play, next (manual advance), skip to end
- Keyboard shortcuts: Space/Right = next, Left = back, P = pause, R = restart, H = toggle line visibility
- Practice mode (lines visible) vs test mode (user's future lines hidden)

## Styling

Tailwind CSS with custom theme extending the current design language:

```javascript
// tailwind.config.ts theme.extend
colors: {
  stage: { deep: '#0a0a0b', bg: '#111113', card: '#1a1a1e', hover: '#222228', elevated: '#252530' },
  amber: { DEFAULT: '#e8a84c', dim: '#c4873a' },
  burgundy: { DEFAULT: '#8b2d3a' },
  cream: { DEFAULT: '#f0e6d3', dim: '#b8a88f' },
}
fontFamily: {
  display: ['Playfair Display', 'serif'],
  body: ['DM Sans', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'],
}
```

Same visual identity as the current app — dark theater aesthetic, amber accents, warm typography.

## Offline / Guest Mode

The app works fully without an account:
- Scripts saved to localStorage (same `linereader_saved_scripts` key for migration)
- PDF parsing, speech recognition, and rehearsal are all client-side
- Signing in syncs localStorage scripts to Supabase and enables cloud persistence
- No degraded experience for guests — auth is an upgrade, not a gate

## Future-Proofing (Not Built Now)

These features are deferred but the architecture supports them:
- **Script sharing**: Add `shared_scripts` table + RLS policy. `user_id` on scripts already establishes ownership.
- **Groups / classrooms**: New tables, new routes. Supabase RLS scales to role-based access.
- **Collaborative rehearsal**: WebSocket/Supabase Realtime on the rehearsal screen. Store structure supports it.
- **Mobile app**: Parser and speech modules in `lib/` are framework-agnostic, reusable in React Native.
- **Analytics**: Supabase has built-in analytics, or add PostHog/Plausible later.

## Migration Strategy

The rewrite replaces the current vanilla JS codebase entirely. The logic (parsing, OCR, speech matching, rehearsal flow) is preserved and reorganized into the new structure. No incremental migration — the current codebase is small enough (~2,700 lines) that a clean rewrite is less risky than a partial migration that has to maintain two paradigms.

Existing localStorage saved scripts will be automatically picked up by the new app (same storage key).
