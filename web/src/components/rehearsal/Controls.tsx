'use client'

type Props = {
  isPaused: boolean
  onRestart: () => void
  onBack: () => void
  onPauseResume: () => void
  onNext: () => void
  onSkipToEnd: () => void
}

export function Controls({ isPaused, onRestart, onBack, onPauseResume, onNext, onSkipToEnd }: Props) {
  return (
    <div className="flex items-center justify-center gap-3 p-4 bg-stage-bg border-t border-text-dim/20">
      <ControlBtn onClick={onRestart} title="Restart" label="Restart">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10a6 6 0 0110.5-4M16 10a6 6 0 01-10.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M14 3v4h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M6 17v-4h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </ControlBtn>
      <ControlBtn onClick={onBack} title="Previous line" label="Back">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 4L6 10l6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </ControlBtn>
      <button
        onClick={onPauseResume}
        title="Pause/Resume"
        className="w-12 h-12 rounded-full bg-amber text-stage-deep flex items-center justify-center hover:bg-amber-dim transition-colors"
      >
        {isPaused ? (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M7 4l12 7-12 7V4z" fill="currentColor" /></svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="6" y="5" width="3.5" height="12" rx="1" fill="currentColor" /><rect x="12.5" y="5" width="3.5" height="12" rx="1" fill="currentColor" /></svg>
        )}
      </button>
      <ControlBtn onClick={onNext} title="Next line" label="Next">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M8 4l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </ControlBtn>
      <ControlBtn onClick={onSkipToEnd} title="Skip to end" label="End">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M6 4l6 6-6 6M14 4v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </ControlBtn>
    </div>
  )
}

function ControlBtn({ onClick, title, label, children }: { onClick: () => void; title: string; label: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-text-secondary hover:text-cream hover:bg-stage-card transition-colors"
    >
      {children}
      <span className="text-[10px] uppercase tracking-wider">{label}</span>
    </button>
  )
}
