'use client'

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import Image from 'next/image'

interface ScrollPhoto {
  month: string
  file: string
  caption?: string
}

function wrapScroll(container: HTMLDivElement, cycleWidth: number) {
  if (cycleWidth <= 0) return
  if (container.scrollLeft < cycleWidth || container.scrollLeft >= cycleWidth * 2) {
    container.scrollLeft = cycleWidth + ((container.scrollLeft % cycleWidth) + cycleWidth) % cycleWidth
  }
}

export default function ScrollingCarousel({ photos }: { photos: ScrollPhoto[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const cycleWidthRef = useRef(0)
  const dragRef = useRef({ pointerId: -1, lastX: 0 })
  const interactionRef = useRef({ hovered: false, focused: false, touching: false })
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    const track = trackRef.current
    if (!container || !track || photos.length === 0) return

    const measure = () => {
      const first = track.children[0] as HTMLElement
      const nextCycle = track.children[photos.length] as HTMLElement
      const cycleWidth = nextCycle.offsetLeft - first.offsetLeft
      const previousWidth = cycleWidthRef.current
      const position = previousWidth > 0 ? container.scrollLeft / previousWidth : 1
      cycleWidthRef.current = cycleWidth
      container.scrollLeft = position * cycleWidth
      wrapScroll(container, cycleWidth)
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    observer.observe(track)
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let previousTime: number | undefined
    let frameId: number

    const animate = (time: number) => {
      const elapsed = previousTime === undefined ? 0 : Math.min(time - previousTime, 100)
      previousTime = time
      const { hovered, focused, touching } = interactionRef.current
      if (!reducedMotion.matches && !hovered && !focused && !touching && dragRef.current.pointerId === -1) {
        container.scrollLeft += cycleWidthRef.current * elapsed / 30_000
        wrapScroll(container, cycleWidthRef.current)
      }
      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frameId)
    }
  }, [photos.length])

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch' || event.button !== 0) return
    event.preventDefault()
    dragRef.current = { pointerId: event.pointerId, lastX: event.clientX }
    event.currentTarget.setPointerCapture(event.pointerId)
    setIsDragging(true)
  }

  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current.pointerId !== event.pointerId) return
    event.preventDefault()
    event.currentTarget.scrollLeft -= event.clientX - dragRef.current.lastX
    dragRef.current.lastX = event.clientX
    wrapScroll(event.currentTarget, cycleWidthRef.current)
  }

  const stopDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current.pointerId !== event.pointerId) return
    dragRef.current.pointerId = -1
    setIsDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const scrollWithKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const slide = trackRef.current?.children[0] as HTMLElement | undefined
    const step = slide ? slide.offsetWidth + 18 : 300
    event.currentTarget.scrollLeft += event.key === 'ArrowRight' ? step : -step
    wrapScroll(event.currentTarget, cycleWidthRef.current)
  }

  return (
    <div
      ref={containerRef}
      className={`scrolling-carousel-container${isDragging ? ' is-dragging' : ''}`}
      role="region"
      aria-label="Recuerdos destacados. Mantén el clic y arrastra, desliza con el dedo o usa las flechas del teclado para recorrer las fotos."
      tabIndex={0}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={stopDrag}
      onPointerCancel={stopDrag}
      onLostPointerCapture={stopDrag}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') interactionRef.current.hovered = true
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') interactionRef.current.hovered = false
      }}
      onFocus={() => { interactionRef.current.focused = true }}
      onBlur={() => { interactionRef.current.focused = false }}
      onTouchStart={() => { interactionRef.current.touching = true }}
      onTouchEnd={() => { interactionRef.current.touching = false }}
      onTouchCancel={() => { interactionRef.current.touching = false }}
      onKeyDown={scrollWithKeyboard}
      onScroll={(event) => wrapScroll(event.currentTarget, cycleWidthRef.current)}
      onDragStart={(event) => event.preventDefault()}
    >
      <div ref={trackRef} className="scrolling-carousel">
        {[...photos, ...photos, ...photos].map((photo, index) => (
          <div
            key={`${photo.month}-${photo.file}-${index}`}
            className="carousel-slide"
            aria-hidden={index < photos.length || index >= photos.length * 2}
          >
            <Image
              src={`/meses/${photo.month}/${photo.file}`}
              alt={photo.caption || photo.file}
              width={360}
              height={250}
              sizes="(max-width: 768px) 280px, 360px"
              loading={index % photos.length === 0 ? 'eager' : 'lazy'}
              className="carousel-image"
              draggable={false}
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
