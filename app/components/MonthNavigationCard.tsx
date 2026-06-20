'use client'

import Link from 'next/link'
import Image from 'next/image'
import styles from './MonthNavigationCard.module.css'

interface Photo {
  file: string
  caption: string
  featured?: boolean
}

interface Month {
  slug: string
  title: string
  description: string
  order: number
  photos: Photo[]
}

interface MonthNavigationCardProps {
  month: Month
}

export default function MonthNavigationCard({ month }: MonthNavigationCardProps) {
  // Find featured photo or first photo
  const featuredPhoto = month.photos.find(p => p.featured) || month.photos[0]
  const isVideo = featuredPhoto ? /\.(mov|mp4|webm)$/i.test(featuredPhoto.file) : false

  if (!featuredPhoto) return null

  const src = `/meses/${month.slug}/${featuredPhoto.file}`

  // Extract just the ordinal word (Primer, Segundo, etc.)
  const ordinalOnly = month.title.split(' ')[0]

  return (
    <Link href={`/meses/${month.slug}`} className={styles.cardLink}>
      <div className={styles.monthCard}>
        <div className={styles.imageWrapper}>
          {isVideo ? (
            <video
              src={src}
              className={styles.thumbnail}
              muted
              preload="metadata"
              onMouseEnter={(e) => {
                const video = e.target as HTMLVideoElement
                video.play().catch(() => {})
              }}
              onMouseLeave={(e) => {
                const video = e.target as HTMLVideoElement
                video.pause()
                video.currentTime = 0
              }}
            />
          ) : (
            <Image
              src={src}
              alt={featuredPhoto.caption}
              width={400}
              height={300}
              className={styles.thumbnail}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
          {isVideo && <div className={styles.videoBadge}>▶</div>}
          <div className={styles.overlay} />
        </div>
        <div className={styles.content}>
          <div className={styles.monthNumber}>{ordinalOnly}</div>
          <div className={styles.monthLabel}>Mes</div>
        </div>
      </div>
    </Link>
  )
}
