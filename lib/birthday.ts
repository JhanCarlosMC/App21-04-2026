// This surprise follows October 8, 2026 in Colombia, regardless of device timezone.
export const BIRTHDAY_START = Date.parse('2026-10-08T00:00:00-05:00')
export const BIRTHDAY_END = Date.parse('2026-10-09T00:00:00-05:00')

export function isBirthdayDay(now = Date.now()): boolean {
  return now >= BIRTHDAY_START && now < BIRTHDAY_END
}
