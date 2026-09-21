'use client'

import Link from 'next/link'
import { useYellowFlowersDay } from './YellowFlowersTheme'
import YellowBouquet from './YellowBouquet'
import styles from './YellowFlowersInvitation.module.css'

export default function YellowFlowersInvitation() {
  const active = useYellowFlowersDay()
  if (!active) return null

  return (
    <section className={styles.invitation} aria-labelledby="flowers-invitation-title">
      <YellowBouquet className={styles.bouquet} />
      <div className={styles.copy}>
        <p className={styles.eyebrow}>21 de septiembre · una sorpresa para ti</p>
        <h2 id="flowers-invitation-title">Hoy, todas las flores son para ti.</h2>
        <p>Y entre ellas, un pedacito de nosotros. Te dejé algo hecho con mucho amor.</p>
        <Link href="/flores-amarillas" className={styles.link}>Abrir mi sorpresa <span aria-hidden="true">↗</span></Link>
      </div>
      <span className={styles.note} aria-hidden="true">con amor, siempre</span>
    </section>
  )
}
