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
      <div className="nav-actions">
        <a
          href="https://instagram.com/presenca__pro"
          target="_blank"
          rel="noreferrer"
          className="nav-instagram"
          aria-label="Instagram dos criadores do site"
        >
          <span className="nav-instagram-icon">📸</span>
          <span className="nav-instagram-text">Instagram</span>
        </a>
        <button type="button" className="nav-admin" onClick={onAdminClick} aria-label="Abrir painel administrativo">
          <span className="nav-admin-icon">⚙️</span>
        </button>
      </div>
    </nav>
  )
}
