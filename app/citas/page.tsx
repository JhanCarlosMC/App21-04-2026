import type { Metadata } from 'next'
import Link from 'next/link'
import DateAlbum from '../components/DateAlbum'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Nuestro Álbum de Citas',
  description: 'Todos los planes, aventuras y recuerdos que queremos vivir juntos.'
}

export default function DatesPage() {
  return (
    <main className={styles.page}>
      <Link href="/" className={styles.backLink}>← Volver a nuestro álbum</Link>
      <DateAlbum />

      <footer>
        <p>Cada plan es una nueva página de nosotros</p>
        <div className="signature">❤️‍🔥 Por muchas aventuras más</div>
      </footer>
    </main>
  )
}
