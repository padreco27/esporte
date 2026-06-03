import { useState, useEffect } from 'react'
import './Countdown.css'

// ⚠️ Atualize aqui a data do evento!
const EVENT_DATE = new Date('2026-07-05T07:30:00')

function pad(n) {
  return String(n).padStart(2, '0')
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    function update() {
      const diff = EVENT_DATE - new Date()
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="countdown-section">
      <p className="countdown-label">⏳ Contagem regressiva para o evento</p>
      <div className="countdown-grid">
        <CountItem value={pad(timeLeft.days)} unit="Dias" />
        <span className="countdown-divider">:</span>
        <CountItem value={pad(timeLeft.hours)} unit="Horas" />
        <span className="countdown-divider">:</span>
        <CountItem value={pad(timeLeft.minutes)} unit="Min" />
        <span className="countdown-divider">:</span>
        <CountItem value={pad(timeLeft.seconds)} unit="Seg" />
      </div>
    </div>
  )
}

function CountItem({ value, unit }) {
  return (
    <div className="countdown-item">
      <div className="countdown-number">{value}</div>
      <div className="countdown-unit">{unit}</div>
    </div>
  )
}
