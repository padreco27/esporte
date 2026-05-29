import { useState, useEffect } from 'react'
import './Navbar.css'

export default function Navbar({ onAdminClick }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <a href="#hero" className="nav-logo">
        <span className="nav-logo-icon">🌿</span>
        <div className="nav-logo-text">
          Caminhada<br /><span>Ecológica</span>
        </div>
      </a>
      <ul className="nav-links">
        <li><a href="#sobre">Sobre</a></li>
        <li><a href="#atividades">Atividades</a></li>
        <li><a href="#inscricao" className="nav-cta">Inscreva-se</a></li>
      </ul>
      <button type="button" className="nav-admin" onClick={onAdminClick} aria-label="Abrir painel administrativo">
        <span className="nav-admin-icon">⚙️</span>
      </button>
    </nav>
  )
}
