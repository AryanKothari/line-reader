'use client'

import { useScriptStore } from '@/stores/script-store'

type Props = {
  onRestart: () => void
  onHome: () => void
}

function getRating(firstTryPct: number): { label: string; color: string; message: string } {
  if (firstTryPct >= 90) return { label: 'Standing Ovation', color: 'text-amber', message: 'You absolutely nailed it!' }
  if (firstTryPct >= 70) return { label: 'Encore!', color: 'text-green-400', message: 'Really solid performance.' }
  if (firstTryPct >= 50) return { label: 'Promising', color: 'text-blue-400', message: 'Getting there — keep rehearsing.' }
  return { label: 'Understudy', color: 'text-orange-400', message: 'A few more run-throughs and you\'ll have it.' }
}

export function CompletionScreen({ onRestart, onHome }: Props) {
  const { linesNailedFirstTry, linesRevealed, linesSkipped, totalUserLines } = useScriptStore()

  const firstTryPct = totalUserLines > 0 ? Math.round((linesNailedFirstTry / totalUserLines) * 100) : 0
  const rating = getRating(firstTryPct)

  return (
    <div className="fixed inset-0 z-50 bg-stage-deep/95 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-stage-card rounded-2xl border border-amber/20 p-8 text-center space-y-6">
        <div className="text-5xl mb-2">
          {firstTryPct >= 90 ? '🎭' : firstTryPct >= 70 ? '🌟' : firstTryPct >= 50 ? '🎬' : '📖'}
        </div>

        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-cream font-bold mb-1">
            Scene Complete!
          </h2>
          <p className={`text-lg font-semibold ${rating.color}`}>{rating.label}</p>
          <p className="text-sm text-text-secondary mt-1">{rating.message}</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Stat label="First try" value={linesNailedFirstTry} total={totalUserLines} color="text-green-400" />
          <Stat label="Needed help" value={linesRevealed} total={totalUserLines} color="text-amber" />
          <Stat label="Skipped" value={linesSkipped} total={totalUserLines} color="text-text-dim" />
        </div>

        <div className="w-full bg-stage-elevated rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-amber rounded-full transition-all duration-500"
            style={{ width: `${firstTryPct}%` }}
          />
        </div>
        <p className="text-xs text-text-secondary -mt-4">{firstTryPct}% nailed on first try</p>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onRestart}
            className="flex-1 px-4 py-3 bg-amber text-stage-deep font-semibold rounded-xl hover:bg-amber-dim transition-colors"
          >
            Run It Again
          </button>
          <button
            onClick={onHome}
            className="flex-1 px-4 py-3 bg-stage-elevated text-cream border border-text-dim/30 font-semibold rounded-xl hover:bg-stage-card transition-colors"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  return (
    <div className="bg-stage-elevated rounded-xl p-3">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-[10px] text-text-dim uppercase tracking-wider mt-0.5">
        {label}
      </div>
      {total > 0 && (
        <div className="text-[10px] text-text-dim">of {total}</div>
      )}
    </div>
  )
}
