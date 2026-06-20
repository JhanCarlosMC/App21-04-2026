import { getAllMonthSlugs, getMonthBySlug, getAllMonths } from '@/lib/content'
import PhotoCard from '../../components/PhotoCard'
import VideoCard from '../../components/VideoCard'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export function generateStaticParams() {
  const slugs = getAllMonthSlugs()
  return slugs.map((slug) => ({ mes: slug }))
}

export default async function MonthPage({ params }: { params: Promise<{ mes: string }> }) {
  const { mes: mesSlug } = await params
  const mes = getMonthBySlug(mesSlug)
  const allMeses = getAllMonths()

  if (!mes) {
    notFound()
  }

  const currentIndex = allMeses.findIndex(m => m.slug === mes.slug)
  const prevMes = currentIndex > 0 ? allMeses[currentIndex - 1] : null
  const nextMes = currentIndex < allMeses.length - 1 ? allMeses[currentIndex + 1] : null

  return (
    <div className="container month-page">
      <Link href="/" className="back-link">← Volver al inicio</Link>

      <section className="hero">
        <h1>{mes.title}</h1>
        <p className="subtitle">{mes.description}</p>
      </section>

      <div className="gallery-grid">
        {mes.photos.map((photo, index) => {
          const isVideo = /\.(mov|mp4)$/i.test(photo.file)
          return isVideo ? (
            <VideoCard
              key={photo.file}
              monthSlug={mes.slug}
              photo={photo}
              index={index}
            />
          ) : (
            <PhotoCard
              key={photo.file}
              monthSlug={mes.slug}
              photo={photo}
              index={index}
            />
          )
        })}
      </div>

      {(prevMes || nextMes) && (
        <div className="month-navigation">
          {prevMes && (
            <Link href={`/meses/${prevMes.slug}`} className="nav-btn prev">
              ← {prevMes.title}
            </Link>
          )}
          {nextMes && (
            <Link href={`/meses/${nextMes.slug}`} className="nav-btn next">
              {nextMes.title} →
            </Link>
          )}
        </div>
      )}

      <footer>
        <p>Para ti, con todo mi amor</p>
        <div className="signature">❤️ Tu compañero para siempre</div>
      </footer>
    </div>
  )
}
