'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'

export function AuthButton() {
  const { user, profile, loading, signIn, signUp, signOut, isPremium } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (loading) return null

  if (user) {
    const displayName = profile?.display_name || user.email?.split('@')[0] || 'User'
    return (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-amber/20 text-amber flex items-center justify-center text-sm font-bold flex-shrink-0">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col items-start">
          <span className="text-sm text-cream leading-tight">{displayName}</span>
          <span className={`text-[10px] uppercase tracking-wider leading-tight ${isPremium ? 'text-amber' : 'text-text-dim'}`}>
            {isPremium ? 'Premium' : 'Basic'}
          </span>
        </div>
        <button
          onClick={signOut}
          className="text-xs text-text-dim hover:text-text-secondary transition-colors ml-1"
        >
          Sign out
        </button>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const result = isSignUp ? await signUp(email, password) : await signIn(email, password)
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
    } else {
      setShowModal(false)
      setEmail('')
      setPassword('')
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-sm text-text-secondary hover:text-cream transition-colors"
      >
        Sign in
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowModal(false)}>
          <div className="bg-stage-card rounded-xl p-6 w-full max-w-sm mx-4 border border-text-dim/30" onClick={e => e.stopPropagation()}>
            <h3 className="font-[family-name:var(--font-display)] font-bold text-xl text-center mb-1">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </h3>
            <p className="text-text-secondary text-xs text-center mb-4">
              Sign in for premium voices and AI-powered scanning
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full bg-stage-elevated text-cream border border-text-dim rounded-lg px-3 py-2 text-sm focus:border-amber focus:outline-none placeholder:text-text-dim"
              />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                required
                minLength={6}
                className="w-full bg-stage-elevated text-cream border border-text-dim rounded-lg px-3 py-2 text-sm focus:border-amber focus:outline-none placeholder:text-text-dim"
              />

              {error && <p className="text-danger text-xs">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 bg-amber text-stage-deep font-semibold rounded-lg text-sm hover:bg-amber-dim transition-colors disabled:opacity-50"
              >
                {submitting ? '...' : isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(null) }}
              className="w-full text-center text-xs text-text-dim hover:text-text-secondary mt-3 transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
