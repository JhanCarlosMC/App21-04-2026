import { getConfig, getAllMonths } from '@/lib/content'
import TimeCounter from './components/TimeCounter'
import ScrollingCarousel from './components/ScrollingCarousel'
import History from './components/History'
import DateAlbumPreview from './components/DateAlbumPreview'
import YellowFlowersInvitation from './components/YellowFlowersInvitation'

function numberToText(num: number): string {
  const units = ['', 'Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve']
  const teens = ['Diez', 'Once', 'Doce', 'Trece', 'Catorce', 'Quince', 'Dieciséis', 'Diecisiete', 'Dieciocho', 'Diecinueve']
  const tens = ['', '', 'Veinte', 'Treinta', 'Cuarenta', 'Cincuenta', 'Sesenta', 'Setenta', 'Ochenta', 'Noventa']

  if (num === 0) return 'Cero'
  if (num < 10) return units[num]
  if (num < 20) return teens[num - 10]
  if (num < 30) return num === 20 ? 'Veinte' : 'Veinti' + units[num % 10]
  if (num < 100) {
    const ten = Math.floor(num / 10)
    const unit = num % 10
    return unit > 0 ? tens[ten] + ' y ' + units[unit] : tens[ten]
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100)
    const remainder = num % 100
    if (hundred === 1) {
      return remainder > 0 ? 'Ciento ' + numberToText(remainder) : 'Cien'
    }
    const hundredText = units[hundred] + 'cientos'
    return remainder > 0 ? hundredText + ' ' + numberToText(remainder) : hundredText
  }
  return num.toString()
}

export default function HomePage() {
  const config = getConfig()
  const meses = getAllMonths()
  const monthsCount = meses.length
  const monthsText = numberToText(monthsCount)
  const heroEyebrow = `${monthsText} meses · una historia para siempre`

  // Crear items para History - una foto destacada de cada mes
  const historyItems = meses.flatMap((mes) => {
    const featuredPhoto = mes.photos.find(p => p.featured) || mes.photos[0]
    if (!featuredPhoto) return []
    return [{
      month: mes.slug,
      monthTitle: mes.title.split(' ')[0], // Solo "Primer", "Segundo", etc.
      monthFullTitle: mes.title,
      monthDate: mes.date,
      photo: {
        ...featuredPhoto,
        caption: mes.timelineCaption || featuredPhoto.caption
      },
      index: mes.order
    }]
  })

  return (
    <div className="container">
      <YellowFlowersInvitation />
      <section className="hero">
        <p className="hero-eyebrow">{heroEyebrow}</p>
        <h1>{config.heroTitle}</h1>
        <div className="hero-flourish" aria-hidden="true">
          <span />
          <b>♥</b>
          <span />
        </div>
      </section>

      <section className="hero-content">
        <p className="subtitle">{config.heroSubtitle}</p>
        <TimeCounter startDate={config.startDate} />
      </section>

      <section className="recap-section">
        <ScrollingCarousel photos={config.recapPhotos} />
      </section>

      <History items={historyItems} />

      <DateAlbumPreview />

      <footer>
        <p>Para ti, con todo mi amor</p>
        <div className="signature">❤️ Tu compañero para siempre</div>
      </footer>
    </div>
  )
}
