import type { Metadata } from 'next'
import Link from 'next/link'
import BirthdayContent from '../components/BirthdayContent'
import styles from '../components/BirthdaySurprise.module.css'

export const metadata: Metadata = {
  title: 'Feliz cumpleaños, mi amor · Nuestro Álbum',
  description: 'Un regalo de cumpleaños con recuerdos, una carta y todo mi amor para ti.',
}

export default function BirthdayPage() {
  return (
    <main className={styles.page}>
      <Link className={styles.back} href="/">← Volver a nuestro álbum</Link>
      <BirthdayContent titleId="birthday-page-title" />
    </main>
  )
}
