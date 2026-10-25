'use client'

import { useEffect, useId, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { MonthAnnouncement } from '@/lib/content'
import styles from './MonthWelcome.module.css'

export default function MonthWelcome({ announcement }: { announcement: MonthAnnouncement }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const pathname = usePathname()

  // AuthGate mounts this welcome after access is verified. Client navigation keeps it mounted.
  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [])

  const closeWelcome = () => dialogRef.current?.close()

  return (
    <>
      {pathname === '/' && (
        <button
          type="button"
          className={styles.invitation}
          onClick={() => dialogRef.current?.showModal()}
          aria-haspopup="dialog"
        >
          <span aria-hidden="true">♡</span>
          <span>{announcement.title}<small>Nuestro nuevo capítulo ya está disponible</small></span>
          <span aria-hidden="true">↗</span>
        </button>
      )}
      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby={titleId}
        onClick={(event) => { if (event.target === event.currentTarget) closeWelcome() }}
      >
        <div className={styles.toolbar}>
          <span>Una cartita para ti</span>
          <button type="button" autoFocus onClick={closeWelcome} aria-label="Cerrar mensaje de nuestro séptimo mes">
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className={styles.content}>
          <span className={styles.heart} aria-hidden="true">♡</span>
          <p className={styles.eyebrow}>{announcement.eyebrow}</p>
          <h2 id={titleId}>{announcement.title}</h2>
          {announcement.paragraphs.map((paragraph) => <p className={styles.message} key={paragraph}>{paragraph}</p>)}
          <p className={styles.closing}>{announcement.closing}</p>
          <Link className={styles.primaryAction} href={`/meses/${announcement.monthSlug}`} onClick={closeWelcome}>
            {announcement.buttonLabel}<span aria-hidden="true">→</span>
          </Link>
          <button className={styles.dismiss} type="button" onClick={closeWelcome}>Seguir recorriendo el álbum</button>
        </div>
      </dialog>
    </>
  )
}
