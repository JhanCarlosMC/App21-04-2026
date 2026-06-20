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

      // Calcular diferencia en meses y días
      let months = 0
      let days = 0
      let hours = 0
      let minutes = 0
      let seconds = 0

      // Calcular meses completos
      const yearDiff = now.getFullYear() - start.getFullYear()
      const monthDiff = now.getMonth() - start.getMonth()
      months = yearDiff * 12 + monthDiff

      // Ajustar si el día actual es menor al día de inicio
      const tempDate = new Date(start)
      tempDate.setMonth(tempDate.getMonth() + months)
      if (now.getDate() < start.getDate()) {
        months--
        tempDate.setMonth(tempDate.getMonth() - 1)
      }

      // Calcular días restantes
      const dayDiff = Math.floor((now.getTime() - tempDate.getTime()) / (1000 * 60 * 60 * 24))
      days = dayDiff

      // Calcular horas, minutos, segundos
      const diff = now.getTime() - start.getTime()
      hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTime({ months, days, hours, minutes, seconds })
    }

    calculateTime()
    const interval = setInterval(calculateTime, 1000)
    return () => clearInterval(interval)
  }, [startDate])

  return (
    <section className="time-counter">
      <div className="heart-container">
        <div className="months-label">Meses</div>
        <div className="beating-heart">
          <span className="heart-number">{time.months}</span>
        </div>
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
    </section>
  )
}
