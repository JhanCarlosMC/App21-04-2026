'use client'

import { useEffect, useState } from 'react'

export default function TimeCounter({ startDate }: { startDate: string }) {
  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(startDate)
      const now = new Date()
      const diff = now.getTime() - start.getTime()

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTime({ days, hours, minutes, seconds })
    }

    calculateTime()
    const interval = setInterval(calculateTime, 1000)
    return () => clearInterval(interval)
  }, [startDate])

  return (
    <section className="time-counter">
      <h2>Tiempo Juntos</h2>
      <div className="counter-grid">
        <div className="counter-item">
          <div className="number">{time.days}</div>
          <div className="label">Días</div>
        </div>
        <div className="counter-item">
          <div className="number">{time.hours}</div>
          <div className="label">Horas</div>
        </div>
        <div className="counter-item">
          <div className="number">{time.minutes}</div>
          <div className="label">Minutos</div>
        </div>
        <div className="counter-item">
          <div className="number">{time.seconds}</div>
          <div className="label">Segundos</div>
        </div>
      </div>
    </section>
  )
}
