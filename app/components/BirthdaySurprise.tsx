'use client'

import { useEffect, useRef, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BIRTHDAY_START, BIRTHDAY_END, isBirthdayDay } from '@/lib/birthday'
import BirthdayContent from './BirthdayContent'
import styles from './BirthdaySurprise.module.css'

const getServerSnapshot = () => false

function subscribe(onChange: () => void) {
  let timeout: ReturnType<typeof setTimeout>
  function check() {
    clearTimeout(timeout)
    onChange()
    const now = Date.now()
    const boundary = now < BIRTHDAY_START ? BIRTHDAY_START : BIRTHDAY_END
    timeout = setTimeout(check, Math.min(60_000, Math.max(1, boundary > now ? boundary - now : 60_000)))
  }
  check()
  window.addEventListener('focus', check)
  document.addEventListener('visibilitychange', check)
  return () => {
    clearTimeout(timeout)
    window.removeEventListener('focus', check)
    document.removeEventListener('visibilitychange', check)
  }
}

export default function BirthdaySurprise() {
  const birthdayDay = useSyncExternalStore(subscribe, isBirthdayDay, getServerSnapshot)
  const pathname = usePathname()
  const active = birthdayDay && pathname !== '/feliz-cumpleanos'
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (!active) return
    const dialog = dialogRef.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [active])

  if (!active) return null

  return (
    <>
      <button className={styles.invitation} onClick={() => dialogRef.current?.showModal()} aria-haspopup="dialog">
        <span aria-hidden="true">🎂</span>
        <span>Hoy es tu día, mi amor<small>Abre tu sorpresa de cumpleaños ♡</small></span>
        <span aria-hidden="true">↗</span>
      </button>
      <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="birthday-title">
        <div className={styles.toolbar}>
          <span>Una sorpresa solo para ti</span>
          <button autoFocus onClick={() => dialogRef.current?.close()} aria-label="Cerrar sorpresa de cumpleaños">Cerrar <span aria-hidden="true">×</span></button>
        </div>
        <BirthdayContent />
        <div className={styles.actions}>
          <Link href="/feliz-cumpleanos" onClick={() => dialogRef.current?.close()}>Guardar este recuerdo en una página ♡</Link>
          <button onClick={() => dialogRef.current?.close()}>Volver a nuestro álbum</button>
        </div>
      </dialog>
    </>
  )
}
