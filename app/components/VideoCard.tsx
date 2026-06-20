'use client'

import { useState, useRef, useEffect } from 'react'
import styles from './VideoCard.module.css'

interface VideoCardProps {
  monthSlug: string
  photo: {
    file: string
    caption: string
    featured?: boolean
  }
  index: number
}

export default function VideoCard({ monthSlug, photo, index }: VideoCardProps) {
  const [isActive, setIsActive] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showError, setShowError] = useState(false)
  const [rotation, setRotation] = useState(photo.featured ? 0 : 0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const animationDelay = index * 0.035

  const src = `/meses/${monthSlug}/${photo.file}`

  // Generate rotation only on client to avoid hydration mismatch
  useEffect(() => {
    if (!photo.featured) {
      setRotation(Math.random() * 6 - 3)
    }
  }, [photo.featured])

  const handleTogglePlay = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setShowError(true))
    }
    setIsActive(!isActive)
  }

  const handleEnded = () => {
    setIsPlaying(false)
  }

  const cardClass = photo.featured
    ? `${styles.videoCard} ${styles.featured}`
    : styles.videoCard

  return (
    <div
      className={cardClass}
      style={{
        '--rotation': `${rotation}deg`,
        animationDelay: `${animationDelay}s`
      } as React.CSSProperties}
      onClick={handleTogglePlay}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleTogglePlay()
        }
      }}
    >
      <div className={`${styles.videoContainer} ${isPlaying ? styles.playing : ''}`}>
        <video
          ref={videoRef}
          src={src}
          muted
          loop
          playsInline
          className={styles.video}
          onEnded={handleEnded}
          onError={() => setShowError(true)}
          preload="none"
        />
        {!showError && (
          <div className={styles.previewOverlay}>
            <div className={styles.playIcon}>▶</div>
          </div>
        )}
        {showError && (
          <div className={styles.previewOverlay}>
            <div className={`${styles.playIcon} ${styles.error}`}>❌</div>
          </div>
        )}
      </div>
      <div className={styles.caption}>{photo.caption}</div>
    </div>
  )
}
