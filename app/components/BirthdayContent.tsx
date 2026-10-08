import Image from 'next/image'
import styles from './BirthdaySurprise.module.css'

const memories = [
  { file: 'IMG_1566.webp', alt: 'Tú sonriendo con tu ramo de rosas', caption: 'Que nunca te falten motivos para sonreír.' },
  { file: 'IMG_1434.webp', alt: 'Los dos sonriendo cerquita en una selfie', caption: 'Mi lugar favorito siempre será a tu lado.' },
  { file: '0.Carrucel2.webp', alt: 'Un beso de nosotros entre rosas y montañas', caption: 'Por todos los recuerdos que nos faltan.' },
]

export default function BirthdayContent({ titleId = 'birthday-title' }: { titleId?: string }) {
  return (
    <article className={styles.content}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>8 de octubre de 2026 · hoy celebramos tu vida</p>
        <div className={styles.candles} aria-hidden="true">✦ ♡ ✦</div>
        <h1 id={titleId}>Feliz cumpleaños,<br /><em>mi amor.</em></h1>
        <p className={styles.intro}>Qué bonito que existas.<br />Qué suerte la mía de coincidir contigo.</p>
        <span className={styles.dedication}>Un pequeño regalo, con todo mi corazón</span>
      </header>

      <section className={styles.memories} aria-label="Recuerdos contigo">
        {memories.map((memory, index) => (
          <figure className={styles.polaroid} key={memory.file}>
            <div className={styles.photo}>
              <Image src={`/meses/sexto-mes/${memory.file}`} alt={memory.alt} fill sizes="(max-width: 600px) 72vw, 250px" loading={index === 0 ? 'eager' : 'lazy'} />
            </div>
            <figcaption>{memory.caption}</figcaption>
          </figure>
        ))}
      </section>

      <section className={styles.letter} aria-labelledby={`${titleId}-letter`}>
        <p className={styles.eyebrow}>Hay un deseo que sí te puedo contar</p>
        <h2 id={`${titleId}-letter`}>Seguir celebrando la vida contigo.</h2>
        <p>Mi amor:</p>
        <p>Hoy cumple años mi persona favorita. Y yo solo puedo pensar en lo agradecido que estoy por tenerte en mi vida, por tus abrazos, por nuestras risas y por esa manera tan tuya de hacer especiales los días más sencillos.</p>
        <p>Si pudiera regalarte algo inmenso, te regalaría la certeza de lo mucho que vales y de lo profundamente amada que eres. Ojalá pudieras verte un ratito con mis ojos: entenderías por qué me haces tan feliz.</p>
        <p>Deseo que este nuevo año de tu vida te acerque a tus sueños, te traiga paz y esté lleno de momentos que te hagan sonreír de verdad. Quiero acompañarte, aplaudir tus logros, abrazarte cuando lo necesites y seguir construyendo recuerdos contigo.</p>
        <p>Gracias por ser tú y por dejarme compartir un pedacito de tu mundo. Hoy te celebro a ti, pero tenerte es un regalo que yo recibo todos los días.</p>
        <p className={styles.signature}>Feliz cumpleaños, mi amor. Te amo muchísimo.<br /><span>Tu compañero para siempre ♡</span></p>
      </section>

      <section className={styles.wishes} aria-labelledby={`${titleId}-wishes`}>
        <p className={styles.eyebrow}>Antes de soplar las velitas…</p>
        <h2 id={`${titleId}-wishes`}>Tres deseos para ti</h2>
        <div className={styles.wishGrid}>
          <div><span aria-hidden="true">✧</span><h3>Que sueñes en grande</h3><p>Y que la vida te abra caminos tan bonitos como tu corazón.</p></div>
          <div><span aria-hidden="true">♡</span><h3>Que te sientas amada</h3><p>En los días increíbles y en los que solo necesites un abrazo.</p></div>
          <div><span aria-hidden="true">☀</span><h3>Que seas muy feliz</h3><p>Con risas que no se acaben y muchos motivos para celebrar.</p></div>
        </div>
      </section>
      <p className={styles.ending}>Mi deseo favorito es seguir a tu lado.<span>Hoy, y en todos los cumpleaños que nos faltan. ♡</span></p>
    </article>
  )
}
