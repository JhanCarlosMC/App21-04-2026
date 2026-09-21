import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import YellowBouquet from '../components/YellowBouquet'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Flores amarillas para ti · Nuestro Álbum',
  description: 'Un pequeño jardín de flores, recuerdos y mucho amor para ti.'
}

const memories = [
  { file: '0.Carrucel.webp', alt: 'Un beso de nosotros entre flores y luces violetas', caption: 'Por todos los besos que nos faltan.', label: 'Tú, yo y un poquito de magia', position: 'center' },
  { file: '1.Featured.webp', alt: 'Los dos abrazados frente al espejo con gafas de colores', caption: 'Por lo bonito de ser nosotros.', label: 'Mi lugar favorito es contigo', position: 'center 35%' },
  { file: 'IMG_1434.webp', alt: 'Una selfie de los dos sonriendo juntos', caption: 'Por esa sonrisa que ilumina todo.', label: 'Así se ve mi felicidad', position: 'center 35%' }
]

export default function YellowFlowersPage() {
  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href="/">← Volver a nuestro álbum</Link>
        <span>Un detalle para mi persona favorita</span>
      </header>

      <section className={styles.hero} aria-labelledby="flowers-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Para ti · 21 de septiembre de 2026</p>
          <h1 id="flowers-title">Tú haces florecer<br /><em>mis días.</em></h1>
          <p className={styles.intro}>Si pudiera guardar en un ramo todo lo que siento por ti, no me alcanzarían las flores del mundo.</p>
          <a className={styles.button} href="#carta">Tengo algo que decirte <span aria-hidden="true">↓</span></a>
          <p className={styles.handwritten}>Estas flores amarillas son para ti, mi amor.</p>
        </div>
        <div className={styles.bouquetWrap}>
          <span className={styles.circle} />
          <YellowBouquet className={styles.bouquet} />
          <span className={styles.bouquetNote}>un ramo que nunca se marchita</span>
        </div>
      </section>

      <section id="carta" className={styles.letterSection} aria-labelledby="letter-title">
        <p className={styles.eyebrow}>Hay cosas que merecen decirse despacito</p>
        <h2 id="letter-title">Una cartita para ti</h2>
        <details className={styles.letter}>
          <summary><span className={styles.seal} aria-hidden="true">✿</span><span>Mi amor, esto es para ti<small>Abre esta carta</small></span><span className={styles.plus} aria-hidden="true">+</span></summary>
          <div className={styles.letterBody}>
            <p>Mi amor:</p>
            <p>Hoy quería regalarte flores amarillas, pero también recordarte algo: qué bonito es que existas y qué suerte la mía poder compartir mis días contigo.</p>
            <p>Gracias por tus abrazos, por nuestras risas y por esos momentos sencillos que, cuando son contigo, se vuelven mis favoritos. Miro nuestras fotos y siempre pienso lo mismo: quiero seguir llenando la vida de recuerdos a tu lado.</p>
            <p>Estas flores llevan un deseo muy mío: seguir viéndote sonreír, acompañarte en tus sueños y seguir eligiéndonos, incluso en los días que no son tan fáciles.</p>
            <p>No solo hoy. En todos los días que nos faltan, quiero seguir encontrando maneras de hacerte sentir amada.</p>
            <p className={styles.signature}>Te amo. Hoy, mañana y en cada primavera.<br /><span>Tu compañero para siempre ♡</span></p>
          </div>
        </details>
      </section>

      <section className={styles.memories} aria-labelledby="memories-title">
        <p className={styles.eyebrow}>Pequeños instantes, un amor enorme</p>
        <h2 id="memories-title">Mi manera favorita de ver la vida:<br /><em>contigo.</em></h2>
        <div className={styles.photoGrid}>
          {memories.map((memory, index) => (
            <figure className={styles.polaroid} key={memory.file}>
              <span className={styles.tape} aria-hidden="true" />
              <div className={styles.photo}>
                <Image src={`/meses/sexto-mes/${memory.file}`} alt={memory.alt} fill sizes="(max-width: 700px) 85vw, 30vw" style={{ objectPosition: memory.position }} />
              </div>
              <figcaption><small>0{index + 1} / {memory.label}</small><p>{memory.caption}</p></figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className={styles.closing}>
        <span aria-hidden="true">✿</span>
        <p>Las flores son amarillas.<br />La suerte de tenerte, <em>infinita.</em></p>
        <Link href="/">Sigamos escribiendo nuestra historia <span aria-hidden="true">→</span></Link>
        <small>Hecho para ti, con todo mi amor · 21.09.2026</small>
      </section>
    </main>
  )
}
