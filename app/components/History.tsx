'use client'

import { useState } from 'react'
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

  return (
    <section className={styles.historySection}>
      <h2 className={styles.historyTitle}>Nuestra Historia Juntos</h2>

      <div className={styles.viewToggle}>
        <button
          className={`${styles.toggleBtn} ${view === 'timeline' ? styles.active : ''}`}
          onClick={() => setView('timeline')}
        >
          Timeline
        </button>
        <button
          className={`${styles.toggleBtn} ${view === 'cards' ? styles.active : ''}`}
          onClick={() => setView('cards')}
        >
          Cards
        </button>
      </div>

      {view === 'timeline' ? (
        <div className={styles.timelineContainer}>
          <div className={styles.timelineLine} />

          {items.map((item, index) => (
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
      ) : (
        <div className={styles.cardsGrid}>
          {items.map((item, index) => (
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
