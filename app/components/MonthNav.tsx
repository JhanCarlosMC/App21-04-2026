import Link from 'next/link'
import { getAllMonths } from '@/lib/content'

export default function MonthNav() {
  const meses = getAllMonths()

  return (
    <nav className="month-nav" aria-label="Navegación principal">
      <Link
        href="/"
        className="home-nav-link"
        aria-label="Volver al inicio"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m3.5 11.2 8.5-7 8.5 7" />
          <path d="M5.75 10v9.25h12.5V10M9.5 19.25v-5.5h5v5.5" />
        </svg>
      </Link>
      <span className="month-nav-divider" aria-hidden="true" />
      {meses.map((mes, index) => (
        <Link
          key={mes.slug}
          href={`/meses/${mes.slug}`}
          aria-label={`Ir al ${mes.title}`}
        >
          {index + 1}
        </Link>
      ))}
      <span className="month-nav-divider" aria-hidden="true" />
      <Link
        href="/citas"
        className="date-book-link"
        aria-label="Abrir nuestro álbum de citas"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 4.75c2.9 0 5.5.7 8 2.25 2.5-1.55 5.1-2.25 8-2.25v14c-2.9 0-5.5.7-8 2.25-2.5-1.55-5.1-2.25-8-2.25v-14Z" />
          <path d="M12 7v14" />
          <path d="M7.25 9.25c1.1.1 2.05.35 2.9.72M16.75 9.25c-1.1.1-2.05.35-2.9.72" />
        </svg>
      </Link>
    </nav>
  )
}
