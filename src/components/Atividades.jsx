import { useEffect, useRef } from 'react'
import './Atividades.css'
import caminhadaImg from '../assets/hero_caminhada.png'
import corridaImg from '../assets/corrida_nova.jpg'

export default function Atividades() {
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
    <section id="atividades" className="atividades-section">
      <div className="container">
        <div className="reveal text-center" ref={addRef}>
          <span className="section-tag">🏃 Atividades</span>
          <h2 className="section-title">O que esperar do evento</h2>
          <p className="section-desc">
            Duas atividades incríveis em um único dia de celebração
          </p>
        </div>
        
        <div className="atividades-grid">
          <div className="atividade-card reveal" ref={addRef} style={{ transitionDelay: '0.1s' }}>
            <img className="atividade-img" src={caminhadaImg} alt="Caminhada Ecológica" />
            <div className="atividade-body">
              <div className="atividade-emoji">🌿</div>
              <h3 className="atividade-title">Caminhada Ecológica</h3>
              <p className="atividade-desc">
                Percorra trilhas deslumbrantes em meio à natureza, aprenda sobre o ecossistema 
                local e viva uma experiência de reconexão com o meio ambiente. Aberta para todos!
              </p>
              <div className="atividade-details">
                <div className="atividade-detail">✅ Para todas as idades e condicionamentos</div>
                <div className="atividade-detail">✅ Guias e monitores no percurso</div>
                <div className="atividade-detail">✅ Contato com flora e fauna local</div>
              </div>
            </div>
          </div>

          <div className="atividade-card reveal" ref={addRef} style={{ transitionDelay: '0.25s' }}>
            <img className="atividade-img" src={corridaImg} alt="Corrida de 5 quilômetros" />
            <div className="atividade-body">
              <div className="atividade-emoji">⚡</div>
              <h3 className="atividade-title">Corrida de 5 quilômetros</h3>
              <p className="atividade-desc">
                Participe da Corrida de 5 Quilômetros e aproveite uma experiência agradável ao ar livre. Um percurso ideal para quem busca se exercitar, desafiar seus limites e curtir o momento em um ambiente de esporte e bem-estar.
              </p>
              <div className="atividade-details">
                <div className="atividade-detail">🏆 Premiação para todos os participantes</div>
                <div className="atividade-detail">✅ Mesa de frutas e hidratação durante o percurso. </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
