'use client'

import Image from 'next/image'

interface ScrollPhoto {
  month: string
  file: string
  caption?: string
}

export default function ScrollingCarousel({ photos }: { photos: ScrollPhoto[] }) {
  return (
    <div className="scrolling-carousel-container">
      <div className="scrolling-carousel">
        {/* Duplique las fotos para crear efecto infinito */}
        {[...photos, ...photos, ...photos].map((photo, index) => (
          <div key={`${photo.file}-${index}`} className="carousel-slide">
            <Image
              src={`/meses/${photo.month}/${photo.file}`}
              alt={photo.caption || photo.file}
              width={300}
              height={200}
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
