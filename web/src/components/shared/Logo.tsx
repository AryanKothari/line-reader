'use client'

export function Logo({ size = 'lg' }: { size?: 'xs' | 'sm' | 'lg' }) {
  const textSize = size === 'lg' ? 'text-4xl' : size === 'sm' ? 'text-2xl' : 'text-xl'
  return (
    <h1 className={`font-[family-name:var(--font-display)] font-black ${textSize} text-cream`}>
      Line<span className="text-amber">Reader</span>
    </h1>
  )
}
