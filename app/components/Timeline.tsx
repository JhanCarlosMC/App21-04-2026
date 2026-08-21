'use client'

import Image from 'next/image'
import styles from './Timeline.module.css'

interface TimelineItem {
  month: string
  monthTitle: string
  monthDate?: string
  photo: {
    file: string
    caption: string
  }
  index: number
}

interface TimelineProps {
  items: TimelineItem[]
}

export default function Timeline({ items }: TimelineProps) {
  return (
    <section className={styles.timelineSection}>
      <h2 className={styles.timelineTitle}>Nuestra Historia</h2>
      <div className={styles.timelineContainer}>
        <div className={styles.timelineLine} />

        {items.map((item) => (
          <div key={`${item.month}-${item.index}`} className={styles.timelineItem}>
            <div className={styles.timelineDot} />
            <div className={styles.timelineContent}>
              <div className={styles.timelineImage}>
                <Image
                  src={`/meses/${item.month}/${item.photo.file}`}
                  alt={item.photo.caption}
                  width={120}
                  height={90}
                  className={styles.timelineThumbnail}
                  sizes="(max-width: 768px) 80px, 120px"
                />
              </div>
              <div className={styles.timelineInfo}>
                <div className={styles.timelineMonth}>{item.monthTitle}</div>
                {item.monthDate && <div className={styles.timelineDate}>{item.monthDate}</div>}
                <div className={styles.timelineCaption}>{item.photo.caption}</div>
              </div>
            </div>
          </div>
        ))}

        <div className={styles.timelineLineEnd} />
      </div>
    </section>
  )
}
