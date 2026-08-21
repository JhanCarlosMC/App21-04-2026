import 'client-only'

import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  writeBatch,
  type DocumentData,
  type Unsubscribe
} from 'firebase/firestore'
import { dateIdeas } from '@/lib/dateIdeas'
import { albumId, firestore } from './client'

export type PlanStatus = 'tentative' | 'confirmed'

export interface DatePlan {
  status: PlanStatus
  date: string
  bookCompleted: boolean
}

export interface DateAlbumState {
  completed: Record<string, boolean>
  customTitles: Record<string, string>
  plans: Record<string, DatePlan>
}

interface DateEntryUpdate {
  completed?: boolean
  customTitle?: string
  plan?: DatePlan | null
}

const legacyStorageKeys = {
  completed: 'nuestro-album-citas-v1',
  customTitles: 'nuestro-album-citas-personalizadas-v1',
  plans: 'nuestro-album-citas-agenda-v1'
} as const

const ideaIds = new Set(dateIdeas.map((idea) => idea.id))
const initialCompleted = Object.fromEntries(
  dateIdeas.map((idea) => [idea.id, Boolean(idea.initiallyCompleted)])
)

const datesCollection = collection(firestore, 'albums', albumId, 'dates')

function isDatePlan(value: unknown): value is DatePlan {
  if (!value || typeof value !== 'object') return false

  const plan = value as Partial<DatePlan>
  return (plan.status === 'tentative' || plan.status === 'confirmed')
    && typeof plan.date === 'string'
    && typeof plan.bookCompleted === 'boolean'
}

function parseRecord(value: string | null): Record<string, unknown> {
  if (!value) return {}

  try {
    const parsed = JSON.parse(value) as unknown
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : {}
  } catch {
    return {}
  }
}

function getLegacyStorage(key: string) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function removeLegacyStorage() {
  try {
    Object.values(legacyStorageKeys).forEach((key) => window.localStorage.removeItem(key))
  } catch {
    // Firestore remains the source of truth even if browser storage is unavailable.
  }
}

function stateFromDocuments(documents: Array<{ id: string; data: () => DocumentData }>): DateAlbumState {
  const completed = { ...initialCompleted }
  const customTitles: Record<string, string> = {}
  const plans: Record<string, DatePlan> = {}

  documents.forEach((entry) => {
    if (!ideaIds.has(entry.id)) return

    const data = entry.data()
    if (typeof data.completed === 'boolean') completed[entry.id] = data.completed
    if (typeof data.customTitle === 'string') customTitles[entry.id] = data.customTitle
    if (isDatePlan(data.plan)) plans[entry.id] = data.plan
  })

  return { completed, customTitles, plans }
}

export async function migrateLegacyDateAlbum(userId: string) {
  const existing = await getDocs(datesCollection)

  if (!existing.empty) {
    removeLegacyStorage()
    return false
  }

  const savedCompleted = parseRecord(getLegacyStorage(legacyStorageKeys.completed))
  const savedCustomTitles = parseRecord(getLegacyStorage(legacyStorageKeys.customTitles))
  const savedPlans = parseRecord(getLegacyStorage(legacyStorageKeys.plans))
  const hasLegacyData = Object.keys(savedCompleted).length > 0
    || Object.keys(savedCustomTitles).length > 0
    || Object.keys(savedPlans).length > 0

  if (!hasLegacyData) {
    removeLegacyStorage()
    return false
  }

  const batch = writeBatch(firestore)

  dateIdeas.forEach((idea) => {
    const savedPlan = savedPlans[idea.id]
    const customTitle = savedCustomTitles[idea.id]
    const completed = savedCompleted[idea.id]

    batch.set(doc(datesCollection, idea.id), {
      completed: typeof completed === 'boolean'
        ? completed
        : Boolean(idea.initiallyCompleted),
      customTitle: typeof customTitle === 'string' ? customTitle : '',
      plan: isDatePlan(savedPlan) ? savedPlan : null,
      schemaVersion: 1,
      updatedAt: serverTimestamp(),
      updatedBy: userId
    })
  })

  await batch.commit()
  removeLegacyStorage()
  return true
}

export function subscribeToDateAlbum(
  onChange: (state: DateAlbumState) => void,
  onError: (error: Error) => void
): Unsubscribe {
  return onSnapshot(
    datesCollection,
    (snapshot) => onChange(stateFromDocuments(snapshot.docs)),
    onError
  )
}

export async function saveDateEntry(
  ideaId: string,
  update: DateEntryUpdate,
  userId: string
) {
  if (!ideaIds.has(ideaId)) throw new Error('La cita no pertenece a este álbum.')

  await setDoc(doc(datesCollection, ideaId), {
    ...update,
    schemaVersion: 1,
    updatedAt: serverTimestamp(),
    updatedBy: userId
  }, { merge: true })
}
