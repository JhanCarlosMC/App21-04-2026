'use client'

import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { isYellowFlowersDay, YELLOW_FLOWERS_START, YELLOW_FLOWERS_END } from '@/lib/yellowFlowers'

const YellowFlowersContext = createContext(false)
const getServerSnapshot = () => false

function subscribe(onChange: () => void) {
  // Recheck at midnight, on return to the tab, and after device clock changes.
  let timeout: ReturnType<typeof setTimeout>
  const schedule = () => {
    clearTimeout(timeout)
    onChange()
    const now = Date.now()
    const boundary = now < YELLOW_FLOWERS_START ? YELLOW_FLOWERS_START : YELLOW_FLOWERS_END
    timeout = setTimeout(schedule, Math.min(60_000, Math.max(1, boundary > now ? boundary - now : 60_000)))
  }
  schedule()
  window.addEventListener('focus', schedule)
  document.addEventListener('visibilitychange', schedule)
  return () => {
    clearTimeout(timeout)
    window.removeEventListener('focus', schedule)
    document.removeEventListener('visibilitychange', schedule)
  }
}

export function useYellowFlowersDay() {
  return useContext(YellowFlowersContext)
}

export default function YellowFlowersTheme({ children }: { children: ReactNode }) {
  const active = useSyncExternalStore(subscribe, isYellowFlowersDay, getServerSnapshot)
  const pathname = usePathname()
  return (
    <YellowFlowersContext.Provider value={active}>
      <div data-yellow-theme={active || pathname === '/flores-amarillas'}>
        {children}
      </div>
    </YellowFlowersContext.Provider>
  )
}
