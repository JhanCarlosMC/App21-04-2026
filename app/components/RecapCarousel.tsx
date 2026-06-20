'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface RecapPhoto {
  month: string
  file: string
  caption: string
}

export default function RecapCarousel({ photos }: { photos: RecapPhoto[] }) {
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % photos.length)
    }, 3600)
    return () => clearInterval(interval)
  }, [photos.length])

  return (
    <div className="recap-carousel">
      {photos.map((photo, index) => (
        <div
          key={index}
          className={`recap-slide ${index === activeSlide ? 'active' : ''}`}
        >
          <Image
            src={`/meses/${photo.month}/${photo.file}`}
            alt={photo.caption}
            width={900}
            height={520}
            priority={index === 0}
            className="recap-image"
          />
          <div className="recap-caption">{photo.caption}</div>
        </div>
      ))}
    </div>
  )
}
