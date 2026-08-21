'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useAlbumAuth } from './AuthGate'
import { dateIdeas, type DateIdea } from '@/lib/dateIdeas'
import {
  migrateLegacyDateAlbum,
  saveDateEntry,
  subscribeToDateAlbum,
  type DatePlan
} from '@/lib/firebase/dateAlbum'
import styles from './DateAlbum.module.css'

type Filter = 'all' | 'upcoming' | 'pending' | 'completed'

interface PlanDraft extends DatePlan {
  lived: boolean
}

const initialCompleted = Object.fromEntries(
  dateIdeas.map((idea) => [idea.id, Boolean(idea.initiallyCompleted)])
)

const ideaNumberById = new Map(
  dateIdeas.map((idea, index) => [idea.id, index + 1])
)

const emptyDraft: PlanDraft = {
  status: 'tentative',
  date: '',
  bookCompleted: false,
  lived: false
}

function formatPlannedDate(date: string) {
  if (!date) return 'Fecha por definir'

  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(`${date}T12:00:00`))
}

function getIdeaTitle(idea: DateIdea, customTitles: Record<string, string>) {
  return idea.custom ? customTitles[idea.id]?.trim() ?? '' : idea.title
}

export default function DateAlbum() {
  const { user } = useAlbumAuth()
  const [completed, setCompleted] = useState<Record<string, boolean>>(initialCompleted)
  const [plans, setPlans] = useState<Record<string, DatePlan>>({})
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [suggestionId, setSuggestionId] = useState<string>()
  const [customTitles, setCustomTitles] = useState<Record<string, string>>({})
  const [activeIdeaId, setActiveIdeaId] = useState<string>()
  const [draft, setDraft] = useState<PlanDraft>(emptyDraft)
  const [isSynced, setIsSynced] = useState(false)
  const [syncError, setSyncError] = useState('')
  const dateInputRef = useRef<HTMLInputElement>(null)
  const dialogTitleId = useId()

  useEffect(() => {
    let active = true
    let unsubscribe: (() => void) | undefined

    const connectToFirestore = async () => {
      try {
        await migrateLegacyDateAlbum(user.uid)
        if (!active) return

        unsubscribe = subscribeToDateAlbum(
          (state) => {
            if (!active) return
            setCompleted(state.completed)
            setCustomTitles(state.customTitles)
            setPlans(state.plans)
            setIsSynced(true)
            setSyncError('')
          },
          () => {
            if (!active) return
            setSyncError('No pudimos sincronizar las citas con Firebase.')
          }
        )
      } catch {
        if (active) setSyncError('No pudimos conectar la agenda con Firestore.')
      }
    }

    void connectToFirestore()

    return () => {
      active = false
      unsubscribe?.()
    }
  }, [user.uid])

  useEffect(() => {
    if (!activeIdeaId) return

    const previousOverflow = document.body.style.overflow
    const frame = window.requestAnimationFrame(() => dateInputRef.current?.focus())
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveIdeaId(undefined)
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', closeOnEscape)

    return () => {
      window.cancelAnimationFrame(frame)
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [activeIdeaId])

  const completedCount = dateIdeas.filter((idea) => completed[idea.id]).length
  const progress = Math.round((completedCount / dateIdeas.length) * 100)

  const upcomingIdeas = useMemo(() => {
    return dateIdeas
      .flatMap((idea) => {
        const plan = plans[idea.id]
        const title = getIdeaTitle(idea, customTitles)
        if (!plan || completed[idea.id] || !title) return []
        return [{ idea, plan, title }]
      })
      .sort((a, b) => {
        if (a.plan.date && b.plan.date) return a.plan.date.localeCompare(b.plan.date)
        if (a.plan.date) return -1
        if (b.plan.date) return 1
        return (ideaNumberById.get(a.idea.id) ?? 0) - (ideaNumberById.get(b.idea.id) ?? 0)
      })
  }, [completed, customTitles, plans])

  const visibleIdeas = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('es')

    return dateIdeas.filter((idea) => {
      const ideaTitle = getIdeaTitle(idea, customTitles)
      const matchesFilter = filter === 'all'
        || (filter === 'completed' && completed[idea.id])
        || (filter === 'pending' && !completed[idea.id])
        || (filter === 'upcoming' && Boolean(plans[idea.id]) && !completed[idea.id])
      const matchesSearch = !normalizedSearch
        || ideaTitle.toLocaleLowerCase('es').includes(normalizedSearch)

      return matchesFilter && matchesSearch
    })
  }, [completed, customTitles, filter, plans, search])

  const persistEntry = (
    id: string,
    update: Parameters<typeof saveDateEntry>[1]
  ) => {
    setSyncError('')
    void saveDateEntry(id, update, user.uid).catch(() => {
      setSyncError('El cambio no pudo guardarse. Revisa tu conexión e inténtalo otra vez.')
    })
  }

  const updateCustomTitle = (id: string, title: string) => {
    setCustomTitles((current) => ({ ...current, [id]: title }))

    if (!title.trim()) {
      setCompleted((current) => {
        if (!current[id]) return current
        return { ...current, [id]: false }
      })

      setPlans((current) => {
        if (!current[id]) return current
        const next = { ...current }
        delete next[id]
        return next
      })
    }
  }

  const persistCustomTitle = (id: string) => {
    const customTitle = customTitles[id] ?? ''
    persistEntry(id, customTitle.trim()
      ? { customTitle }
      : { customTitle: '', completed: false, plan: null })
  }

  const openSchedule = (id: string, markAsLived = false) => {
    const idea = dateIdeas.find((item) => item.id === id)
    if (!idea || (idea.custom && !customTitles[id]?.trim())) return

    const plan = plans[id]
    setDraft({
      status: plan?.status ?? 'tentative',
      date: plan?.date ?? '',
      bookCompleted: plan?.bookCompleted ?? false,
      lived: markAsLived || Boolean(completed[id])
    })
    setActiveIdeaId(id)
  }

  const closeSchedule = () => setActiveIdeaId(undefined)

  const saveSchedule = () => {
    if (!activeIdeaId) return

    const plan: DatePlan = {
      status: draft.lived ? 'confirmed' : draft.status,
      date: draft.date,
      bookCompleted: draft.bookCompleted
    }

    setPlans((current) => {
      const next = {
        ...current,
        [activeIdeaId]: plan
      }
      return next
    })

    setCompleted((current) => ({ ...current, [activeIdeaId]: draft.lived }))
    persistEntry(activeIdeaId, { completed: draft.lived, plan })

    closeSchedule()
  }

  const clearSchedule = () => {
    if (!activeIdeaId) return

    setPlans((current) => {
      const next = { ...current }
      delete next[activeIdeaId]
      return next
    })

    persistEntry(activeIdeaId, { plan: null })
    closeSchedule()
  }

  const chooseNextDate = () => {
    const pending = dateIdeas.filter((idea) => {
      const hasTitle = !idea.custom || Boolean(customTitles[idea.id]?.trim())
      return !completed[idea.id] && hasTitle
    })

    if (pending.length === 0) {
      setSuggestionId(undefined)
      return
    }

    const nextIdea = pending[Math.floor(Math.random() * pending.length)]
    setSuggestionId(nextIdea.id)
  }

  const suggestion = dateIdeas.find((idea) => idea.id === suggestionId)
  const suggestionTitle = suggestion ? getIdeaTitle(suggestion, customTitles) : ''
  const activeIdea = dateIdeas.find((idea) => idea.id === activeIdeaId)
  const activeTitle = activeIdea ? getIdeaTitle(activeIdea, customTitles) : ''

  return (
    <section className={styles.section} id="album-citas" aria-labelledby="date-album-title">
      <div className={styles.heading}>
        <p className={styles.eyebrow}>Planes, aventuras y sueños compartidos</p>
        <h2 id="date-album-title">Nuestro álbum de citas</h2>
        <p className={styles.intro}>
          Una colección de momentos por vivir y recuerdos que ya forman parte de nosotros.
        </p>
        <p
          className={`${styles.syncStatus} ${syncError ? styles.syncError : ''}`}
          role="status"
        >
          <span aria-hidden="true" />
          {syncError || (isSynced ? 'Sincronizado con Firebase' : 'Conectando con Firebase…')}
        </p>
      </div>

      <div className={styles.dashboard}>
        <div className={styles.progressCopy}>
          <span className={styles.progressHeart} aria-hidden="true">♥</span>
          <div>
            <strong>{completedCount} de {dateIdeas.length}</strong>
            <span>aventuras vividas</span>
          </div>
        </div>
        <div className={styles.progressDetails}>
          <span>{progress}% de nuestra lista</span>
          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-label="Progreso del álbum de citas"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
        <button type="button" className={styles.randomButton} onClick={chooseNextDate}>
          <span aria-hidden="true">✦</span>
          Elegir nuestra próxima cita
        </button>
      </div>

      {suggestion && suggestionTitle && (
        <div className={styles.suggestion} role="status">
          <span>La próxima aventura podría ser</span>
          <strong>{suggestionTitle}</strong>
          <div className={styles.suggestionActions}>
            <button type="button" onClick={() => openSchedule(suggestion.id)}>Agendarla</button>
            <button type="button" onClick={chooseNextDate} aria-label="Elegir otra cita">Otra idea</button>
          </div>
        </div>
      )}

      <section className={styles.upcoming} aria-labelledby="upcoming-title">
        <div className={styles.upcomingHeading}>
          <div>
            <p>Agenda compartida</p>
            <h3 id="upcoming-title">Nuestras próximas citas</h3>
          </div>
          <span>{upcomingIdeas.length} {upcomingIdeas.length === 1 ? 'seleccionada' : 'seleccionadas'}</span>
        </div>

        {upcomingIdeas.length > 0 ? (
          <div className={styles.upcomingList}>
            {upcomingIdeas.map(({ idea, plan, title }) => (
              <button
                key={idea.id}
                type="button"
                className={styles.upcomingItem}
                onClick={() => openSchedule(idea.id)}
              >
                <span className={styles.bookNumber} aria-hidden="true">
                  {String(ideaNumberById.get(idea.id) ?? 0).padStart(2, '0')}
                </span>
                <span className={styles.upcomingCopy}>
                  <strong>{title}</strong>
                  <small>{formatPlannedDate(plan.date)}</small>
                </span>
                <span className={`${styles.statusPill} ${plan.status === 'confirmed' ? styles.confirmedPill : ''}`}>
                  {plan.status === 'confirmed' ? 'Confirmada' : 'Tentativa'}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className={styles.upcomingEmpty}>
            Aún no han seleccionado una próxima cita. Abran una tarjeta y agréguenla a la agenda.
          </p>
        )}
      </section>

      <div className={styles.controls}>
        <div className={styles.filters} aria-label="Filtrar citas">
          {([
            ['all', 'Todas'],
            ['upcoming', 'Próximas'],
            ['pending', 'Pendientes'],
            ['completed', 'Vividas']
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={filter === value ? styles.activeFilter : ''}
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
            >
              {label}
            </button>
          ))}
        </div>
        <label className={styles.search}>
          <span aria-hidden="true">⌕</span>
          <span className={styles.srOnly}>Buscar una cita</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar una cita..."
          />
        </label>
      </div>

      <div className={styles.grid}>
        {visibleIdeas.map((idea) => {
          const isCompleted = completed[idea.id]
          const plan = plans[idea.id]
          const ideaNumber = ideaNumberById.get(idea.id) ?? 0
          const title = getIdeaTitle(idea, customTitles)
          const cardClassName = `${styles.card} ${idea.custom ? styles.customCard : ''} ${isCompleted ? styles.completed : ''} ${plan ? styles.planned : ''}`
          const dateSummary = isCompleted
            ? plan?.date
              ? `Realizada el ${formatPlannedDate(plan.date)}`
              : 'Falta registrar la fecha'
            : plan
              ? formatPlannedDate(plan.date)
              : idea.custom
                ? 'Página libre para ustedes'
                : 'Por descubrir'
          const actionLabel = isCompleted
            ? plan?.date ? 'Editar recuerdo' : 'Añadir fecha'
            : plan ? 'Editar' : 'Agendar'

          return (
            <article key={idea.id} className={cardClassName}>
              <span className={styles.number}>{String(ideaNumber).padStart(2, '0')}</span>

              {idea.custom ? (
                <label className={styles.cardText}>
                  <span className={styles.srOnly}>Escribir cita libre {ideaNumber - 94}</span>
                  <input
                    type="text"
                    value={title}
                    onChange={(event) => updateCustomTitle(idea.id, event.target.value)}
                    onBlur={() => persistCustomTitle(idea.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') event.currentTarget.blur()
                    }}
                    placeholder={`Escribe la cita libre ${ideaNumber - 94}...`}
                    maxLength={80}
                  />
                </label>
              ) : (
                <span className={styles.cardText}>
                  <strong>{title}</strong>
                </span>
              )}

              <small className={styles.dateSummary}>{dateSummary}</small>

              <div className={styles.cardActions}>
                <button
                  type="button"
                  className={`${styles.scheduleButton} ${plan ? styles.scheduledButton : ''}`}
                  onClick={() => openSchedule(idea.id)}
                  disabled={!title}
                  aria-label={isCompleted
                    ? `${actionLabel} de ${title || 'cita libre'}`
                    : plan ? `Editar agenda de ${title}` : `Agendar ${title || 'cita libre'}`}
                >
                  <span aria-hidden="true">{isCompleted ? '♥' : plan ? '▣' : '＋'}</span>
                  {actionLabel}
                </button>
                <button
                  type="button"
                  className={styles.check}
                  onClick={() => openSchedule(idea.id, true)}
                  disabled={!title}
                  aria-pressed={isCompleted}
                  aria-label={isCompleted
                    ? `Editar recuerdo de ${title}`
                    : `Registrar ${title || 'cita libre'} como realizada`}
                >
                  {isCompleted ? '✓' : '♡'}
                </button>
              </div>

              {(plan || isCompleted) && (
                <div className={styles.cardMeta}>
                  <span className={isCompleted
                    ? styles.metaCompleted
                    : plan?.status === 'confirmed' ? styles.metaConfirmed : ''}
                  >
                    {isCompleted ? 'Realizada' : plan?.status === 'confirmed' ? 'Confirmada' : 'Tentativa'}
                  </span>
                  {plan && (
                    <span className={plan.bookCompleted ? styles.metaBookReady : styles.metaBookPending}>
                      {plan.bookCompleted ? 'Libro listo ✓' : 'Falta libro físico'}
                    </span>
                  )}
                </div>
              )}
            </article>
          )
        })}
      </div>

      {visibleIdeas.length === 0 && (
        <p className={styles.empty}>No encontramos una cita con esos filtros.</p>
      )}

      {activeIdea && activeTitle && (
        <div
          className={styles.modalBackdrop}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeSchedule()
          }}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
          >
            <div className={styles.modalHeader}>
              <div>
                <p>{draft.lived ? 'Registrar nuestro recuerdo' : 'Planear nuestra cita'}</p>
                <h3 id={dialogTitleId}>{activeTitle}</h3>
              </div>
              <button type="button" className={styles.closeButton} onClick={closeSchedule} aria-label="Cerrar modal">
                ×
              </button>
            </div>

            <form
              className={styles.modalForm}
              onSubmit={(event) => {
                event.preventDefault()
                saveSchedule()
              }}
            >
              <label className={`${styles.livedToggle} ${draft.lived ? styles.livedToggleActive : ''}`}>
                <input
                  type="checkbox"
                  checked={draft.lived}
                  onChange={(event) => setDraft((current) => ({ ...current, lived: event.target.checked }))}
                />
                <span aria-hidden="true">♥</span>
                <span>
                  <strong>Ya vivimos esta cita</strong>
                  <small>
                    {draft.lived
                      ? 'Guardaremos cuándo ocurrió y no aparecerá como próxima cita.'
                      : 'Actívalo si la cita ya fue realizada.'}
                  </small>
                </span>
              </label>

              {!draft.lived && (
                <fieldset className={styles.fieldset}>
                  <legend>¿Qué tan definido está el plan?</legend>
                  <div className={styles.choiceGrid}>
                    <label className={draft.status === 'tentative' ? styles.selectedChoice : ''}>
                      <input
                        type="radio"
                        name="plan-status"
                        value="tentative"
                        checked={draft.status === 'tentative'}
                        onChange={() => setDraft((current) => ({ ...current, status: 'tentative' }))}
                      />
                      <span aria-hidden="true">♡</span>
                      <strong>Tentativa</strong>
                      <small>Nos gustaría hacerla</small>
                    </label>
                    <label className={draft.status === 'confirmed' ? styles.selectedChoice : ''}>
                      <input
                        type="radio"
                        name="plan-status"
                        value="confirmed"
                        checked={draft.status === 'confirmed'}
                        onChange={() => setDraft((current) => ({ ...current, status: 'confirmed' }))}
                      />
                      <span aria-hidden="true">♥</span>
                      <strong>Confirmada</strong>
                      <small>El plan ya está acordado</small>
                    </label>
                  </div>
                </fieldset>
              )}

              <label className={styles.dateField}>
                <span>{draft.lived ? 'Fecha en que realizamos la cita' : 'Fecha de la próxima cita'}</span>
                <small>
                  {draft.lived
                    ? 'Es necesaria para guardar este recuerdo.'
                    : 'Pueden dejarla vacía mientras deciden el día.'}
                </small>
                <input
                  ref={dateInputRef}
                  type="date"
                  value={draft.date}
                  required={draft.lived}
                  onInput={(event) => {
                    const date = event.currentTarget.value
                    setDraft((current) => ({ ...current, date }))
                  }}
                />
              </label>

              <fieldset className={styles.fieldset}>
                <legend>Estado en el libro físico</legend>
                <div className={styles.bookChoices}>
                  <label className={!draft.bookCompleted ? styles.selectedBookChoice : ''}>
                    <input
                      type="radio"
                      name="book-status"
                      checked={!draft.bookCompleted}
                      onChange={() => setDraft((current) => ({ ...current, bookCompleted: false }))}
                    />
                    <span>Pendiente por completar</span>
                  </label>
                  <label className={draft.bookCompleted ? styles.selectedBookChoice : ''}>
                    <input
                      type="radio"
                      name="book-status"
                      checked={draft.bookCompleted}
                      onChange={() => setDraft((current) => ({ ...current, bookCompleted: true }))}
                    />
                    <span>Completada en el libro ✓</span>
                  </label>
                </div>
              </fieldset>

              <div className={styles.modalActions}>
                {plans[activeIdea.id] && !draft.lived && (
                  <button type="button" className={styles.clearButton} onClick={clearSchedule}>
                    Quitar de la agenda
                  </button>
                )}
                <button type="button" className={styles.cancelButton} onClick={closeSchedule}>
                  Cancelar
                </button>
                <button type="submit" className={styles.saveButton}>
                  {draft.lived ? 'Guardar recuerdo' : 'Guardar cita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
