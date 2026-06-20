import { getConfig, getAllMonths } from '@/lib/content'
import TimeCounter from './components/TimeCounter'
import RecapCarousel from './components/RecapCarousel'
import PhotoCard from './components/PhotoCard'
import VideoCard from './components/VideoCard'

export default function HomePage() {
  const config = getConfig()
  const meses = getAllMonths()

  return (
    <div className="container">
      <section className="hero">
        <h1>{config.heroTitle}</h1>
        <p className="subtitle">{config.heroSubtitle}</p>
        <div className="heart">❤️</div>
      </section>

      <TimeCounter startDate={config.startDate} />

      <section className="recap-section">
        <RecapCarousel photos={config.recapPhotos} />
      </section>

      <section className="messages">
        {config.messages.map((message, index) => (
          <div key={index} className="message-card">
            <p>{message}</p>
          </div>
        ))}
      </section>

      <section className="gallery">
        <h2 className="gallery-title">Nuestros Momentos Por Mes</h2>
        <div className="gallery">
          {meses.map((mes) => (
            <div key={mes.slug} className="month-section" id={mes.slug}>
              <div className="month-heading">
                <h3>{mes.title}</h3>
                <p>{mes.description}</p>
              </div>
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
            </div>
          ))}
        </div>
      </section>

      <footer>
        <p>Para ti, con todo mi amor</p>
        <div className="signature">❤️ Tu compañero para siempre</div>
      </footer>
    </div>
  )
}
