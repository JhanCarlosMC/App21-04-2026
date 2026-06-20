'use client'

import { useState, useEffect } from 'react'

export default function FloatingHearts() {
  const [hearts, setHearts] = useState<Array<{ id: number; left: number; top: number; animationDelay: number; animationDuration: number }>>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Generate hearts only on client side to avoid hydration mismatch
    const generatedHearts = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 15,
      animationDuration: 15 + Math.random() * 10
    }))
    setHearts(generatedHearts)
    setIsMounted(true)
  }, [])

  // Don't render until mounted on client
  if (!isMounted) {
    return <div className="floating-hearts" />
  }

  return (
    <div className="floating-hearts">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="floating-heart"
          style={{
            left: `${heart.left}%`,
            top: `${heart.top}%`,
            animationDelay: `${heart.animationDelay}s`,
            animationDuration: `${heart.animationDuration}s`
          } as React.CSSProperties}
        >
          ❤️
        </div>
      ))}
    </div>
  )
}
