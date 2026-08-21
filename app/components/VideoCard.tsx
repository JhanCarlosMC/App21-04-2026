'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './VideoCard.module.css'

interface VideoCardProps {
  monthSlug: string
  photo: {
    file: string
    caption: string
    featured?: boolean
    poster?: string
  }
  index: number
}

export default function VideoCard({ monthSlug, photo, index }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [naturalRatio, setNaturalRatio] = useState<string>()
  const videoRef = useRef<HTMLVideoElement>(null)
  const animationDelay = index * 0.05

  const src = `/meses/${monthSlug}/${photo.file}`
  const poster = photo.poster ? `/meses/${monthSlug}/${photo.poster}` : undefined

  useEffect(() => {
    const video = videoRef.current

    if (!video) {
      return
    }

    const updateNaturalRatio = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        setNaturalRatio(`${video.videoWidth} / ${video.videoHeight}`)
      }
    }

    updateNaturalRatio()
    video.addEventListener('loadedmetadata', updateNaturalRatio)

    return () => video.removeEventListener('loadedmetadata', updateNaturalRatio)
  }, [src])

  const handleTogglePlay = () => {
    if (!videoRef.current) {
      return
    }

    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
        .then(() => {
          setIsPlaying(true)
        })
        .catch((err) => {
          console.error('Play error:', err)
          setHasError(true)
        })
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    if (videoRef.current) {
      videoRef.current.currentTime = 0
    }
  }

  const cardClass = photo.featured
    ? `${styles.videoCard} ${styles.featured}`
    : styles.videoCard

  return (
    <div
      className={cardClass}
      style={{ animationDelay: `${animationDelay}s` }}
    >
      <div className={styles.polaroidFrame}>
        <div
          className={styles.videoContainer}
          style={naturalRatio ? { aspectRatio: naturalRatio } : undefined}
        >
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            muted
            playsInline
            className={`${styles.video} ${isPlaying ? styles.playing : ''}`}
            controls={isPlaying}
            onEnded={handleEnded}
            onError={() => setHasError(true)}
            preload="metadata"
          />

          {!isPlaying && (
            <button
              type="button"
              className={styles.playOverlay}
              onClick={handleTogglePlay}
              aria-label="Reproducir video"
            >
              {poster ? (
                <div className={styles.thumbnail} style={{ backgroundImage: `url(${poster})` }} />
              ) : (
                <div className={styles.thumbnailPlaceholder} />
              )}
              <div className={styles.thumbnailOverlay} />
              <div className={styles.playIconWrapper}>
                <div className={`${styles.playIcon} ${hasError ? styles.error : ''}`}>
                  {hasError ? '✕' : '▶'}
                </div>
              </div>
            </button>
          )}
        </div>
        <div className={styles.caption}>
          {photo.featured && <span className={styles.featuredLabel}>Video destacado</span>}
          <span>{photo.caption}</span>
        </div>
      </div>
    </div>
  )
}
