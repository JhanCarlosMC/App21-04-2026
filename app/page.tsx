import { getConfig, getAllMonths } from '@/lib/content'
import TimeCounter from './components/TimeCounter'
import ScrollingCarousel from './components/ScrollingCarousel'
import History from './components/History'

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
  const dynamicTitle = `${monthsText} Meses Juntos`

  // Crear items para History - una foto destacada de cada mes
  const historyItems = meses.flatMap((mes) => {
    const featuredPhoto = mes.photos.find(p => p.featured) || mes.photos[0]
    if (!featuredPhoto) return []
    return [{
      month: mes.slug,
      monthTitle: mes.title.split(' ')[0], // Solo "Primer", "Segundo", etc.
      monthFullTitle: mes.title,
      monthDate: (mes as any).date,
      photo: featuredPhoto,
      index: mes.order
    }]
  })

  return (
    <div className="container">
      <section className="hero">
        <h1>{dynamicTitle}</h1>
        <p className="subtitle">{config.heroSubtitle}</p>
      </section>

      <TimeCounter startDate={config.startDate} />

      <section className="recap-section">
        <ScrollingCarousel photos={config.recapPhotos} />
      </section>

      <History items={historyItems} />

      <footer>
        <p>Para ti, con todo mi amor</p>
        <div className="signature">❤️ Tu compañero para siempre</div>
      </footer>
    </div>
  )
}
