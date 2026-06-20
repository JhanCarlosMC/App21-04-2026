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
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [rotation, setRotation] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationDelay = index * 0.05

  const src = `/meses/${monthSlug}/${photo.file}`

  // Generate subtle rotation only on client
  useEffect(() => {
    if (!photo.featured) {
      setRotation(Math.random() * 4 - 2)
    }
  }, [photo.featured])

  // Generate thumbnail from first frame - more robust approach
  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    let isMounted = true
    let timeoutId: number | null = null

    const captureThumbnail = () => {
      if (!isMounted) return

      try {
        // Wait for video to be ready
        if (video.readyState < 2) {
          timeoutId = window.setTimeout(captureThumbnail, 100)
          return
        }

        // Set to a specific frame
        if (video.currentTime > 0.5) {
          video.currentTime = 0.1
        }

        canvas.width = video.videoWidth || 400
        canvas.height = video.videoHeight || 300
        const ctx = canvas.getContext('2d')

        if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
          // Draw the current frame
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

          // Convert to data URL
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
          if (isMounted) {
            setThumbnail(dataUrl)
          }
        }
      } catch (e) {
        console.error('Failed to capture thumbnail:', e)
      }
    }

    // Try multiple approaches to get a frame
    const tryCapture = () => {
      if (!isMounted) return

      // Set video to a specific time
      video.currentTime = 0.1

      // Wait for seek to complete
      const onSeeked = () => {
        if (isMounted) {
          captureThumbnail()
        }
        video.removeEventListener('seeked', onSeeked)
      }

      video.addEventListener('seeked', onSeeked, { once: true })

      // Fallback timeout
      timeoutId = window.setTimeout(() => {
        video.removeEventListener('seeked', onSeeked)
        if (isMounted) {
          captureThumbnail()
        }
      }, 500)
    }

    // Start capture when metadata is loaded
    const onLoadedMetadata = () => {
      tryCapture()
    }

    video.addEventListener('loadedmetadata', onLoadedMetadata)

    // Also try immediately if already loaded
    if (video.readyState >= 1) {
      tryCapture()
    }

    return () => {
      isMounted = false
      video.removeEventListener('loadedmetadata', onLoadedMetadata)
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [src])

  const handleTogglePlay = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setHasError(true))
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
      style={
        {
          '--rotation': `${rotation}deg`,
          animationDelay: `${animationDelay}s`
        } as React.CSSProperties
      }
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleTogglePlay()
        }
      }}
    >
      <div className={styles.polaroidFrame}>
        <div className={styles.videoContainer}>
          <video
            ref={videoRef}
            src={src}
            muted
            loop
            playsInline
            className={styles.video}
            onEnded={handleEnded}
            onError={() => setHasError(true)}
            preload="auto"
          />
          <canvas ref={canvasRef} className={styles.hiddenCanvas} />

          {!isPlaying && (
            <div
              className={styles.playOverlay}
              onClick={handleTogglePlay}
              role="button"
              aria-label="Reproducir video"
              tabIndex={-1}
            >
              {thumbnail ? (
                <>
                  <div className={styles.thumbnail} style={{ backgroundImage: `url(${thumbnail})` }} />
                  <div className={styles.thumbnailOverlay} />
                </>
              ) : (
                <div className={styles.loadingSpinner} />
              )}
              <div className={styles.playIconWrapper}>
                <div className={`${styles.playIcon} ${hasError ? styles.error : ''}`}>
                  {hasError ? '✕' : '▶'}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className={styles.caption}>{photo.caption}</div>
      </div>
    </div>
  )
}
