'use client'

import { useState, type SyntheticEvent } from 'react'
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
  const [hasError, setHasError] = useState(false)
  const [naturalRatio, setNaturalRatio] = useState<string>()
  const src = `/meses/${monthSlug}/${photo.file}`
  const poster = photo.poster ? `/meses/${monthSlug}/${photo.poster}` : undefined
  const cardClass = photo.featured
    ? `${styles.videoCard} ${styles.featured}`
    : styles.videoCard

  return (
    <div className={cardClass} style={{ animationDelay: `${index * 0.05}s` }}>
      <div className={styles.polaroidFrame}>
        <div
          className={styles.videoContainer}
          style={!photo.featured && naturalRatio ? { aspectRatio: naturalRatio } : undefined}
        >
          <video
            src={src}
            poster={poster}
            controls
            playsInline
            className={styles.video}
            aria-label={photo.caption}
            preload="metadata"
            onLoadedMetadata={(event: SyntheticEvent<HTMLVideoElement>) => {
              const { videoWidth, videoHeight } = event.currentTarget
              if (videoWidth > 0 && videoHeight > 0) {
                setNaturalRatio(`${videoWidth} / ${videoHeight}`)
              }
            }}
            onLoadedData={() => setHasError(false)}
            onError={() => setHasError(true)}
          >
            Tu navegador no puede reproducir este video. <a href={src}>Abrir el video</a>.
          </video>
        </div>
        {hasError && (
          <p className={styles.errorMessage} role="alert">
            No pudimos reproducir este recuerdo. <a href={src}>Abrir el video</a>.
          </p>
        )}
        <div className={styles.caption}>
          {photo.featured && <span className={styles.featuredLabel}>Video destacado</span>}
          <span>{photo.caption}</span>
        </div>
      </div>
    </div>
  )
}
