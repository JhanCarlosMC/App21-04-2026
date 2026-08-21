'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode
} from 'react'
import { FirebaseError } from 'firebase/app'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { albumId, firebaseAuth, firestore } from '@/lib/firebase/client'
import styles from './AuthGate.module.css'

interface AuthContextValue {
  user: User
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function getAuthErrorMessage(error: unknown) {
  if (!(error instanceof FirebaseError)) {
    return 'No pudimos iniciar sesión. Inténtalo nuevamente.'
  }

  switch (error.code) {
    case 'auth/invalid-credential':
    case 'auth/invalid-email':
      return 'El correo o la contraseña no son correctos.'
    case 'auth/too-many-requests':
      return 'Hubo demasiados intentos. Espera un momento antes de volver a intentar.'
    case 'auth/network-request-failed':
      return 'No pudimos comunicarnos con Firebase. Revisa tu conexión.'
    default:
      return 'No pudimos iniciar sesión. Inténtalo nuevamente.'
  }
}

export function useAlbumAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAlbumAuth debe utilizarse dentro de AuthGate.')
  return context
}

export default function AuthGate({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<'loading' | 'signed-out' | 'ready'>('loading')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (nextUser) => {
      if (!active) return

      if (!nextUser) {
        setUser(null)
        setStatus('signed-out')
        return
      }

      setStatus('loading')

      try {
        const membership = await getDoc(
          doc(firestore, 'albums', albumId, 'members', nextUser.uid)
        )

        if (!membership.exists()) {
          await signOut(firebaseAuth)
          if (active) setErrorMessage('Esta cuenta no está autorizada para abrir el álbum.')
          return
        }

        if (active) {
          setUser(nextUser)
          setErrorMessage('')
          setStatus('ready')
        }
      } catch {
        await signOut(firebaseAuth)
        if (active) {
          setErrorMessage('No pudimos verificar el acceso. Revisa las reglas de Firestore.')
          setStatus('signed-out')
        }
      }
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setErrorMessage('')

    try {
      await signInWithEmailAndPassword(firebaseAuth, email.trim(), password)
      setPassword('')
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
      <main className={styles.authPage} aria-live="polite">
        <div className={styles.loadingCard}>
          <span className={styles.heart} aria-hidden="true">♥</span>
          <p>Abriendo nuestro álbum…</p>
        </div>
      </main>
    )
  }

  if (status === 'signed-out' || !user) {
    return (
      <main className={styles.authPage}>
        <section className={styles.loginCard} aria-labelledby="login-title">
          <p className={styles.eyebrow}>Un espacio solo para nosotros</p>
          <span className={styles.heart} aria-hidden="true">♥</span>
          <h1 id="login-title">Abrir nuestro álbum</h1>
          <p className={styles.intro}>Inicia sesión con una de las cuentas autorizadas.</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <label>
              <span>Correo electrónico</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </label>
            <label>
              <span>Contraseña</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </label>

            {errorMessage
              ? <p className={styles.error} role="alert">{errorMessage}</p>
              : null}

            <button type="submit" disabled={submitting}>
              {submitting ? 'Comprobando…' : 'Entrar al álbum'}
            </button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <AuthContext.Provider value={{ user, signOut: () => signOut(firebaseAuth) }}>
      <div className={styles.sessionBar}>
        <span>{user.email}</span>
        <button type="button" onClick={() => void signOut(firebaseAuth)}>Cerrar sesión</button>
      </div>
      {children}
    </AuthContext.Provider>
  )
}
