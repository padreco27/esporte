import './Hero.css'
import heroBg from '../assets/hero_caminhada.png'

export default function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="hero-bg" style={{ backgroundImage: `url(${heroBg})` }} />
      <div className="hero-overlay" />
      <div className="hero-content">
        <div className="hero-badge">🌿 Evento da Padroeira</div>
        <h1 className="hero-title">
          Caminhada<br />
          <span className="highlight">Ecológica</span><br />
          da Padroeira
        </h1>
        <p className="hero-subtitle">
          Uma experiência única em plena natureza —<br />
          Caminhada ecológica &amp; Corrida de 5 quilômetros
        </p>
        <div className="hero-info-row">
          <div className="hero-info-item">
            <span className="icon">📅</span>
            <span>05/07 — Caminhada 07:30 / Corrida 08:00</span>
          </div>
          <div className="hero-info-item">
            <span className="icon">📍</span>
            <span>Largada e termino ao lado da Igreja Matriz</span>
          </div>
          <div className="hero-info-item">
            <span className="icon">👨‍👩‍👧‍👦</span>
            <span>Para toda a família</span>
          </div>
        </div>
        <div className="hero-btns">
          <a href="#inscricao" className="btn-primary">🏃 Inscreva-se Agora</a>
          <a href="#sobre" className="btn-secondary">Saiba mais</a>
        </div>
      </div>
      <div className="hero-scroll">
        <span />
      </div>
    </section>
  )
}
