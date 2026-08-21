'use client'

import Image from 'next/image'

interface ScrollPhoto {
  month: string
  file: string
  caption?: string
}

export default function ScrollingCarousel({ photos }: { photos: ScrollPhoto[] }) {
  return (
    <div className="scrolling-carousel-container" role="region" aria-label="Recuerdos destacados">
      <div className="scrolling-carousel">
        {/* Duplique las fotos para crear efecto infinito */}
        {[...photos, ...photos, ...photos].map((photo, index) => (
          <div
            key={`${photo.file}-${index}`}
            className="carousel-slide"
            aria-hidden={index >= photos.length}
          >
            <Image
              src={`/meses/${photo.month}/${photo.file}`}
              alt={photo.caption || photo.file}
              width={360}
              height={250}
              sizes="(max-width: 768px) 280px, 360px"
              loading={index % photos.length === 0 ? 'eager' : 'lazy'}
              className="carousel-image"
            />
            {photo.caption && (
              <div className="carousel-caption">{photo.caption}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
