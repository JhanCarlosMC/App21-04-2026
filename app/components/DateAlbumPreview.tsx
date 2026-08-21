import Link from 'next/link'
import { dateIdeas } from '@/lib/dateIdeas'
import styles from './DateAlbumPreview.module.css'

export default function DateAlbumPreview() {
  return (
    <section className={styles.wrapper} aria-labelledby="date-album-preview-title">
      <p className={styles.eyebrow}>Todavía nos quedan muchas historias por vivir</p>

      <Link href="/citas" className={styles.preview}>
        <div className={styles.copy}>
          <span className={styles.kicker}>Una colección para los dos</span>
          <h2 id="date-album-preview-title">Nuestro álbum de citas</h2>
          <p>
            Un lugar para guardar lo que ya vivimos y elegir todas las aventuras
            que todavía nos esperan.
          </p>
          <span className={styles.openButton}>
            Abrir nuestro álbum
            <span aria-hidden="true">→</span>
          </span>
        </div>

        <div className={styles.bookScene} aria-hidden="true">
          <div className={styles.bookShadow} />
          <div className={styles.pages}>
            <span />
            <span />
            <span />
          </div>
          <div className={styles.cover}>
            <div className={styles.spine} />
            <span className={styles.coverKicker}>Nuestra lista de</span>
            <strong>Aventuras</strong>
            <div className={styles.coverHeart}>♥</div>
            <span className={styles.ideaCount}>{dateIdeas.length} citas para recordar</span>
            <div className={styles.coverLine} />
            <small>Juntos, siempre</small>
          </div>
        </div>
      </Link>
    </section>
  )
}
