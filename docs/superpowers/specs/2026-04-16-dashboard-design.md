# Line Reader — Dashboard Design

## Overview

Add a `/dashboard` route for logged-in users showing their projects in a card grid (Figma-inspired). Unauthenticated users see the existing upload page. Clicking a project card loads it and goes to `/setup`.

## Route Behavior

- **`/` (upload page)**: If user is logged in, redirect to `/dashboard`. Otherwise show the existing upload screen with Log in / Sign up buttons.
- **`/dashboard` (new)**: Requires authentication. Shows project card grid. If not logged in, redirect to `/`.

## Dashboard Layout

**Header**:
- Left: Logo + "Your scene partner, on demand" tagline
- Right: "New Project" amber button + AuthButton (avatar, name, tier, sign out)

**Body**:
- "My Projects" section label
- Responsive card grid: 3 columns desktop, 2 tablet, 1 mobile
- Project cards sorted by `updated_at` descending (most recent first)
- Last position in grid: dashed "Upload script" card that opens file picker

## Project Card

Each card shows:
- Title (bold)
- Character count + line count (e.g. "2 characters · 24 lines")
- "Playing as [name]" if `selected_character` is set, otherwise omitted
- Last edited date (relative: "Today", "2 days ago", etc.)
- Delete button (appears on hover, top-right corner)

Click anywhere on the card → load project into store → navigate to `/setup`.

## New Project Flow

"New Project" button in header and the dashed upload card both open a file picker (accepts .pdf, .txt, .json). After parsing, navigates to `/review`. Same logic as current upload page's `handleFile`.

## File Changes

- **Create**: `src/app/dashboard/page.tsx` — the dashboard page
- **Create**: `src/components/dashboard/ProjectCard.tsx` — individual project card
- **Modify**: `src/app/page.tsx` — add redirect to `/dashboard` if authenticated
- **Delete**: `src/components/upload/ProjectsList.tsx` — replaced by dashboard
- **Delete**: `src/components/upload/SavedScriptsList.tsx` — no longer needed on upload page for logged-in users (guests still have localStorage but that's a marginal case)

## What's Not Changing

- Setup, review, and rehearsal screens stay exactly the same
- Guest/unauthenticated experience stays the same (upload page)
- Save button behavior unchanged
- All existing project CRUD via `src/lib/projects.ts` reused as-is
