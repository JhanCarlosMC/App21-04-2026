'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
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
  const [isActive, setIsActive] = useState(false)
  const [rotation, setRotation] = useState(photo.featured ? 0 : 0)
  const animationDelay = index * 0.035

  const src = `/meses/${monthSlug}/${photo.file}`

  // Generate rotation only on client to avoid hydration mismatch
  useEffect(() => {
    if (!photo.featured) {
      setRotation(Math.random() * 6 - 3)
    }
  }, [photo.featured])

  const handleClick = () => setIsActive(!isActive)

  const cardClass = photo.featured
    ? `${styles.photoCard} ${styles.featured}`
    : styles.photoCard

  return (
    <div
      className={cardClass}
      style={{
        '--rotation': `${rotation}deg`,
        animationDelay: `${animationDelay}s`
      } as React.CSSProperties}
      onClick={handleClick}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      <Image
        src={src}
        alt={photo.caption}
        width={photo.featured ? 900 : 400}
        height={photo.featured ? 600 : 300}
        className={photo.featured ? styles.featuredImage : styles.image}
        priority={photo.featured}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      <div className={styles.caption}>{photo.caption}</div>
    </div>
  )
}
