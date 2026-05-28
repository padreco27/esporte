import { useEffect, useRef } from 'react'
import './About.css'
import heroBg from '../assets/hero_caminhada.png'

const features = [
  { icon: '🌳', title: 'Contato com a Natureza', text: 'Trilhas em área verde preservada' },
  { icon: '🏅', title: 'Competição Saudável', text: 'Corrida de 100m com premiação' },
  { icon: '👨‍👩‍👧', title: 'Toda a Família', text: 'Atividades para todas as idades' },
  { icon: '🙏', title: 'Devoção à Padroeira', text: 'Celebração comunitária e espiritual' },
]

export default function About() {
  const revealRefs = useRef([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible')
      }),
      { threshold: 0.1 }
    )
    revealRefs.current.forEach(el => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const addRef = (el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el)
  }

  return (
    <section id="sobre" className="about-section">
      <div className="container">
        <div className="about-grid">
          <div className="about-image-wrap reveal" ref={addRef}>
            <img src={heroBg} alt="Trilha ecológica na floresta" />
            <div className="about-badge-float">
              <div className="big-num">2</div>
              <div className="small-text">atividades<br />emocionantes</div>
            </div>
          </div>
          <div className="reveal" ref={addRef} style={{ transitionDelay: '0.15s' }}>
            <span className="section-tag">🌱 Sobre o Evento</span>
            <h2 className="section-title">Uma celebração da natureza e do esporte</h2>
            <p className="section-desc">
              A <strong>Caminhada Ecológica da Padroeira</strong> é um evento que une espiritualidade,
              natureza e esporte em uma experiência inesquecível. Venha caminhar por trilhas
              preservadas, respirar ar puro e ainda disputar a emocionante Corrida de 100 metros!
            </p>
            <p className="section-desc" style={{ marginTop: '1rem' }}>
              Um evento para toda a família, com atividades para todas as idades e condicionamentos físicos.
            </p>
            <div className="about-features">
              {features.map((f, i) => (
                <div className="feature-card" key={i}>
                  <span className="feature-icon">{f.icon}</span>
                  <div>
                    <div className="feature-title">{f.title}</div>
                    <div className="feature-text">{f.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
