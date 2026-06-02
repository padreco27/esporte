import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-logo">🌿</div>
      <div className="footer-title">Caminhada Ecológica da Padroeira</div>
      <div className="footer-subtitle">&amp; Corrida de 5 Quilômetros</div>
      <hr className="footer-divider" />
      <a
        href="https://instagram.com/presenca__pro"
        target="_blank"
        rel="noreferrer"
        className="footer-instagram-button"
      >
        📸 Instagram — Criadores do site
      </a>
      <p className="footer-copy">© 2026 — Evento da Padroeira. Todos os direitos reservados.</p>
    </footer>
  )
}
