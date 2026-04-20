'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useScriptStore } from '@/stores/script-store'
import { Logo } from '@/components/shared/Logo'
import { AuthButton } from '@/components/shared/AuthButton'
import { SaveButton } from '@/components/shared/SaveButton'
import { CharacterCard } from '@/components/setup/CharacterCard'
import { VoiceSettings } from '@/components/setup/VoiceSettings'
import * as synthesis from '@/lib/speech/synthesis'
import * as aiVoices from '@/lib/ai-voices'

export default function SetupPage() {
  const router = useRouter()
  const store = useScriptStore()
  const characterNames = store.characters.map(c => c.name)

  useEffect(() => {
    if (!store.parsedScript.length) router.push('/')
  }, [store.parsedScript.length, router])

  if (!store.parsedScript.length) return null

  const handleStart = () => {
    if (!store.selectedCharacter) return
    if (!Object.keys(synthesis.getCharacterVoiceMap()).length) {
      synthesis.assignVoices(store.characters, store.selectedCharacter)
    }
    if (aiVoices.isEnabled()) {
      aiVoices.assignVoices(store.characters, store.selectedCharacter)
    }
    router.push('/rehearsal')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center gap-4 p-4 border-b border-text-dim/20">
        <button onClick={() => router.push('/')} className="flex items-center gap-2 text-text-secondary hover:text-cream transition-colors text-sm">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          New Script
        </button>
        <button onClick={() => router.push('/review')} className="flex items-center gap-2 text-text-secondary hover:text-cream transition-colors text-sm">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 4H5v12h10M9 10h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Edit Script
        </button>
        <div className="flex-1" />
        <SaveButton />
        <Logo size="sm" />
        <div className="ml-4"><AuthButton /></div>
      </header>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-8">
        <h2 className="font-[family-name:var(--font-display)] font-bold text-2xl text-center">Cast &amp; Crew</h2>
        <p className="text-text-secondary text-sm text-center mt-1 mb-6">Select the character you&apos;ll be reading</p>

        <div className="space-y-3 mb-8">
          {store.characters.map((c, i) => (
            <CharacterCard
              key={c.name}
              character={c}
              index={i}
              selected={store.selectedCharacter === c.name}
              onSelect={() => {
                store.selectCharacter(c.name)
                // Only assign default voices if none exist yet
                if (!Object.keys(synthesis.getCharacterVoiceMap()).length) {
                  synthesis.assignVoices(store.characters, c.name)
                }
              }}
            />
          ))}
        </div>

        {store.selectedCharacter && (
          <>
            <div className="mb-4 p-4 bg-stage-card rounded-xl">
              <VoiceSettings characterNames={characterNames} selectedCharacter={store.selectedCharacter} />
            </div>

            <div className="mb-8 p-4 bg-stage-card rounded-xl">
              <h3 className="font-[family-name:var(--font-display)] font-bold text-sm text-cream mb-1">Scene Notes</h3>
              <p className="text-text-dim text-xs mb-3">Give context so AI voices read with the right tone and emotion</p>
              <textarea
                value={store.sceneNotes}
                onChange={e => store.setSceneNotes(e.target.value)}
                placeholder="e.g. Late night at a bar. Two old friends just had a heated argument about money. The tension is thick but there's underlying love..."
                rows={3}
                className="w-full bg-stage-elevated text-cream border border-text-dim rounded-lg px-3 py-2 text-sm focus:border-amber focus:outline-none placeholder:text-text-dim resize-none"
              />
              <p className="text-text-dim text-[10px] mt-1">Works with AI voices only</p>
            </div>
          </>
        )}

        <button
          onClick={handleStart}
          disabled={!store.selectedCharacter}
          className="w-full py-3 bg-amber text-stage-deep font-bold rounded-xl text-lg hover:bg-amber-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Start Rehearsal
        </button>
      </div>
    </div>
  )
}
