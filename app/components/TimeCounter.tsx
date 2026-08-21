'use client'

import { useEffect, useState } from 'react'

export default function TimeCounter({ startDate }: { startDate: string }) {
  const [time, setTime] = useState({
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(startDate)
      const now = new Date()

      // Calcular meses completos
      const yearDiff = now.getFullYear() - start.getFullYear()
      const monthDiff = now.getMonth() - start.getMonth()
      let totalMonths = yearDiff * 12 + monthDiff

      // Ajustar meses si el día actual es menor al día de inicio
      // o si es el mismo día pero la hora es menor
      if (now.getDate() < start.getDate() ||
          (now.getDate() === start.getDate() && now.getHours() < start.getHours())) {
        totalMonths--
      }

      // Fecha del último mes completo
      const lastMonthDate = new Date(start)
      lastMonthDate.setMonth(lastMonthDate.getMonth() + totalMonths)

      // Tiempo restante desde el último mes completo
      const remainingMs = now.getTime() - lastMonthDate.getTime()
      const remainingSeconds = Math.floor(remainingMs / 1000)
      const days = Math.floor(remainingSeconds / 86400) // 86400 = 24 * 60 * 60
      const hours = Math.floor((remainingSeconds % 86400) / 3600)
      const minutes = Math.floor((remainingSeconds % 3600) / 60)
      const seconds = remainingSeconds % 60

      setTime({
        months: Math.max(1, totalMonths),
        days,
        hours,
        minutes,
        seconds
      })
    }

    calculateTime()
    const interval = setInterval(calculateTime, 1000)
    return () => clearInterval(interval)
  }, [startDate])

  return (
    <div className="time-counter" role="timer" aria-label="Tiempo que llevamos juntos">
      <div className="time-content">
        <div className="heart-container">
          <div className="beating-heart">
            <span className="heart-number">{time.months}</span>
          </div>
        </div>
        <div className="time-info">
          <div className="small-units">
            <span className="unit">{time.days}d</span>
            <span className="separator">:</span>
            <span className="unit">{time.hours}h</span>
            <span className="separator">:</span>
            <span className="unit">{time.minutes}m</span>
            <span className="separator">:</span>
            <span className="unit">{time.seconds}s</span>
          </div>
        </div>
      </div>
    </div>
  )
}
