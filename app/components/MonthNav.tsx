import Link from 'next/link'
import { getAllMonths } from '@/lib/content'

export default function MonthNav() {
  const meses = getAllMonths()

  return (
    <nav className="month-nav" aria-label="Navegación por mes">
      {meses.map((mes, index) => (
        <Link
          key={mes.slug}
          href={`/meses/${mes.slug}`}
          aria-label={`Ir al ${mes.title}`}
        >
          {index + 1}
        </Link>
      ))}
    </nav>
  )
}
