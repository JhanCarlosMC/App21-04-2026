'use client'

import {
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent
} from 'react'
import Image from 'next/image'
import Link from 'next/link'
import styles from './History.module.css'

interface TimelineItem {
  month: string
  monthTitle: string
  monthFullTitle: string
  monthDate?: string
  photo: {
    file: string
    caption: string
  }
  index: number
}

interface HistoryProps {
  items: TimelineItem[]
}

export default function History({ items }: HistoryProps) {
  const [view, setView] = useState<'timeline' | 'cards'>('timeline')
  const [isDragging, setIsDragging] = useState(false)
  const timelineRef = useRef<HTMLDivElement>(null)
  const dragState = useRef({
    pointerId: -1,
    startX: 0,
    startScrollLeft: 0,
    moved: false
  })

  const startTimelineDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return

    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: event.currentTarget.scrollLeft,
      moved: false
    }
  }

  const moveTimelineDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (dragState.current.pointerId !== event.pointerId) return

    const distance = event.clientX - dragState.current.startX
    if (!dragState.current.moved && Math.abs(distance) > 10) {
      dragState.current.moved = true
      event.currentTarget.setPointerCapture(event.pointerId)
      setIsDragging(true)
    }
    if (!dragState.current.moved) return

    event.preventDefault()
    event.currentTarget.scrollLeft = dragState.current.startScrollLeft - distance
  }

  const stopTimelineDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (dragState.current.pointerId !== event.pointerId) return

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    dragState.current.pointerId = -1
    setIsDragging(false)

    if (dragState.current.moved) {
      window.setTimeout(() => {
        dragState.current.moved = false
      }, 0)
    }
  }

  const preventClickAfterDrag = (event: MouseEvent<HTMLDivElement>) => {
    if (!dragState.current.moved) return

    event.preventDefault()
    event.stopPropagation()
  }

  const scrollTimelineWithKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return

    event.preventDefault()
    timelineRef.current?.scrollBy({
      left: event.key === 'ArrowRight' ? 270 : -270,
      behavior: 'smooth'
    })
  }

  return (
    <section className={styles.historySection}>
      <p className={styles.historyEyebrow}>Cada capítulo nos trajo hasta aquí</p>
      <h2 className={styles.historyTitle}>Nuestra historia, mes a mes</h2>

      <div className={styles.viewToggle}>
        <button
          type="button"
          className={`${styles.toggleBtn} ${view === 'timeline' ? styles.active : ''}`}
          onClick={() => setView('timeline')}
          aria-pressed={view === 'timeline'}
        >
          Cronología
        </button>
        <button
          type="button"
          className={`${styles.toggleBtn} ${view === 'cards' ? styles.active : ''}`}
          onClick={() => setView('cards')}
          aria-pressed={view === 'cards'}
        >
          Galería
        </button>
      </div>

      {view === 'timeline' ? (
        <>
          <p className={styles.dragHint}>
            <span aria-hidden="true">↔</span>
            Arrastra con el mouse para recorrer nuestra historia
          </p>
          <div
            ref={timelineRef}
            className={`${styles.timelineContainer} ${isDragging ? styles.dragging : ''}`}
            role="region"
            aria-label="Cronología de nuestra historia. Usa las flechas o arrastra horizontalmente para recorrerla."
            tabIndex={0}
            onPointerDown={startTimelineDrag}
            onPointerMove={moveTimelineDrag}
            onPointerUp={stopTimelineDrag}
            onPointerCancel={stopTimelineDrag}
            onClickCapture={preventClickAfterDrag}
            onKeyDown={scrollTimelineWithKeyboard}
            onDragStart={(event) => event.preventDefault()}
          >
            <div className={styles.timelineLine} />

            {items.map((item) => (
              <Link
                key={`${item.month}-${item.index}`}
                href={`/meses/${item.month}`}
                className={styles.timelineItem}
              >
                <div className={styles.timelineDot} />
                <div className={styles.timelineContent}>
                  <div className={styles.timelineImage}>
                    <Image
                      src={`/meses/${item.month}/${item.photo.file}`}
                      alt={item.photo.caption}
                      width={160}
                      height={120}
                      className={styles.timelineThumbnail}
                      sizes="(max-width: 768px) 100px, 160px"
                      loading={item.index === 1 ? 'eager' : 'lazy'}
                      draggable={false}
                    />
                  </div>
                  <div className={styles.timelineInfo}>
                    <div className={styles.timelineMonth}>{item.monthTitle}</div>
                    {item.monthDate && <div className={styles.timelineDate}>{item.monthDate}</div>}
                    <div className={styles.timelineCaption}>{item.photo.caption}</div>
                  </div>
                </div>
              </Link>
            ))}

            <div className={styles.timelineLineEnd} />
          </div>
        </>
      ) : (
        <div className={styles.cardsGrid}>
          {items.map((item) => (
            <Link
              key={`${item.month}-${item.index}`}
              href={`/meses/${item.month}`}
              className={styles.historyCard}
            >
              <div className={styles.cardImageWrapper}>
                <Image
                  src={`/meses/${item.month}/${item.photo.file}`}
                  alt={item.photo.caption}
                  width={400}
                  height={300}
                  className={styles.cardImage}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  loading={item.index === 1 ? 'eager' : 'lazy'}
                />
                <div className={styles.cardOverlay} />
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardMonth}>{item.monthTitle}</div>
                <div className={styles.cardLabel}>Mes</div>
                {item.monthDate && <div className={styles.cardDate}>{item.monthDate}</div>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
