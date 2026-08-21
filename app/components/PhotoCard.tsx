'use client'

import Image from 'next/image'
import { useState, type SyntheticEvent } from 'react'
import styles from './PhotoCard.module.css'

interface PhotoCardProps {
  monthSlug: string
  photo: {
    file: string
    caption: string
    featured?: boolean
  }
  index: number
}

export default function PhotoCard({ monthSlug, photo, index }: PhotoCardProps) {
  const animationDelay = index * 0.05
  const [naturalRatio, setNaturalRatio] = useState<string>()

  const src = `/meses/${monthSlug}/${photo.file}`

  const cardClass = photo.featured
    ? `${styles.photoCard} ${styles.featured}`
    : styles.photoCard

  return (
    <div
      className={cardClass}
      style={{ animationDelay: `${animationDelay}s` }}
    >
      <div className={styles.polaroidFrame}>
        <div
          className={styles.mediaStage}
          style={!photo.featured && naturalRatio ? { aspectRatio: naturalRatio } : undefined}
        >
          {photo.featured && (
            <Image
              src={src}
              alt=""
              fill
              aria-hidden="true"
              className={styles.featuredBackdrop}
              sizes="100vw"
            />
          )}
          <Image
            src={src}
            alt={photo.caption}
            fill
            className={styles.image}
            preload={photo.featured}
            onLoad={(event: SyntheticEvent<HTMLImageElement>) => {
              const { naturalWidth, naturalHeight } = event.currentTarget

              if (!photo.featured && naturalWidth > 0 && naturalHeight > 0) {
                setNaturalRatio(`${naturalWidth} / ${naturalHeight}`)
              }
            }}
            sizes={photo.featured
              ? '(max-width: 768px) 100vw, 1200px'
              : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
          />
        </div>
        <div className={styles.caption}>
          {photo.featured && <span className={styles.featuredLabel}>Recuerdo destacado</span>}
          <span>{photo.caption}</span>
        </div>
      </div>
    </div>
  )
}
