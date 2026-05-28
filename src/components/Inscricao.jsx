import { useEffect, useRef, useState } from 'react'
import './Inscricao.css'

export default function Inscricao() {
  const revealRefs = useRef([])
  const [iframeLoading, setIframeLoading] = useState(true)

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
    <section id="inscricao" className="inscricao-section">
      <div className="container">
        <div className="inscricao-card reveal" ref={addRef}>
          <div className="inscricao-icon">📋</div>
          <h2 className="inscricao-title">Faça sua Inscrição</h2>
          <p className="inscricao-desc">
            Preencha o formulário abaixo diretamente na página para garantir sua vaga gratuita no evento!
          </p>

          <div className="iframe-wrapper">
            {iframeLoading && (
              <div className="iframe-loader">
                <div className="spinner"></div>
                <p>Carregando formulário de inscrição...</p>
              </div>
            )}
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSd2XSrsRBYzMmec4Hy1agu31c6sEzqJRL38SPuIHKr69OuhrA/viewform?embedded=true"
              className="inscricao-iframe"
              onLoad={() => setIframeLoading(false)}
              title="Formulário de Inscrição"
            >
              Carregando…
            </iframe>
          </div>

          <p className="inscricao-note">
            🔒 Seus dados estão seguros &nbsp;|&nbsp; 📱 Funciona no celular
          </p>
        </div>
      </div>
    </section>
  )
}

