// A one-day surprise, using Colombia's UTC-05:00 offset, not the visitor's timezone.
export const YELLOW_FLOWERS_START = Date.parse('2026-09-21T00:00:00-05:00')
export const YELLOW_FLOWERS_END = Date.parse('2026-09-22T00:00:00-05:00')

export function isYellowFlowersDay(now = Date.now()): boolean {
  return now >= YELLOW_FLOWERS_START && now < YELLOW_FLOWERS_END
}
