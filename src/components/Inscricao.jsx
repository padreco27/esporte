import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import './Inscricao.css'

export default function Inscricao({ onSubmit }) {
  const revealRefs = useRef([])
  const [nome, setNome] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [idade, setIdade] = useState('')
  const [telefone, setTelefone] = useState('')
  const [participacaoConfirmada, setParticipacaoConfirmada] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('pix')
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [copiedPix, setCopiedPix] = useState(false)
  const pixKey = 'paroquiaparaopeba@diocesedesetelagoas.com.br'

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('visible')
      }),
      { threshold: 0.1 }
    )
    revealRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!dataNascimento) return
    const birth = new Date(dataNascimento)
    const today = new Date()
    let years = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      years -= 1
    }
    if (years >= 0) setIdade(String(years))
  }, [dataNascimento])

  const addRef = (el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!nome || !dataNascimento || !idade || !telefone) {
      setErrorMessage('Preencha todos os campos obrigatórios antes de enviar.')
      setSuccessMessage('')
      return
    }

    if (!participacaoConfirmada) {
      setErrorMessage('Confirme sua participação no percurso para continuar.')
      setSuccessMessage('')
      return
    }

    if (!termsAccepted) {
      setErrorMessage('É preciso aceitar os termos para concluir a inscrição.')
      setSuccessMessage('')
      return
    }

    if (!supabase) {
      setErrorMessage('Supabase não configurado. A inscrição não pode ser salva na nuvem no momento.')
      setSuccessMessage('')
      return
    }

    setSubmitting(true)
    const submission = {
      nome,
      data_nascimento: dataNascimento,
      idade,
      telefone,
      participacao_confirmada: participacaoConfirmada,
      payment_method: paymentMethod === 'pix' ? 'PIX' : 'No dia',
      termos_aceitos: termsAccepted,
      submitted_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('inscricoes')
      .insert([submission])
      .select()

    if (error) {
      setErrorMessage('Não foi possível salvar a inscrição no Supabase. Verifique a conexão e tente novamente.')
      setSuccessMessage('')
      setSubmitting(false)
      return
    }

    const saved = data?.[0]
    const localSubmission = {
      id: saved?.id ?? Date.now(),
      nome,
      dataNascimento,
      idade,
      telefone,
      participacaoConfirmada,
      paymentMethod,
      termsAccepted,
      submittedAt: submission.submitted_at,
    }

    onSubmit?.(localSubmission)

    const whatsappText = encodeURIComponent(
      `Nova inscrição Caminhada da Padroeira:\n` +
      `Nome: ${nome}\n` +
      `Data de Nascimento: ${dataNascimento}\n` +
      `Idade: ${idade}\n` +
      `Telefone: ${telefone}\n` +
      `Participa do percurso de 5 km: ${participacaoConfirmada ? 'Sim' : 'Não'}\n` +
      `Forma de pagamento: ${paymentMethod === 'pix' ? 'PIX' : 'No dia'}\n` +
      `Termos aceitos: Sim`
    )

    setSuccessMessage('Inscrição registrada! Abrindo WhatsApp para confirmação automática...')
    setErrorMessage('')
    setNome('')
    setDataNascimento('')
    setIdade('')
    setTelefone('')
    setParticipacaoConfirmada(false)
    setTermsAccepted(false)
    setPaymentMethod('pix')
    setCopiedPix(false)

    setTimeout(() => {
      window.open(
        `https://wa.me/553137141018?text=${whatsappText}`,
        '_blank'
      )
      setSubmitting(false)
    }, 150)
  }

  const handleCopyPix = async () => {
    await navigator.clipboard.writeText(pixKey)
    setCopiedPix(true)
    setTimeout(() => setCopiedPix(false), 2500)
  }

  return (
    <section id="inscricao" className="inscricao-section">
      <div className="container">
        <div className="inscricao-card reveal" ref={addRef}>
          <div className="inscricao-icon">📋</div>
          <h2 className="inscricao-title">Faça sua Inscrição</h2>
          <p className="inscricao-desc">
            Preencha o formulário abaixo para se inscrever na Caminhada da Padroeira. O envio abrirá o WhatsApp automaticamente.
          </p>

          <form className="inscricao-form" onSubmit={handleSubmit}>
            {errorMessage && <div className="inscricao-alert error">{errorMessage}</div>}
            {successMessage && <div className="inscricao-alert success">{successMessage}</div>}

            <div className="inscricao-form-grid">
              <label>
                Nome completo*
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome completo"
                  required
                />
              </label>

              <label>
                Data de Nascimento*
                <input
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  required
                />
              </label>

              <label>
                Idade*
                <input
                  type="number"
                  min="1"
                  value={idade}
                  onChange={(e) => setIdade(e.target.value)}
                  placeholder="Idade"
                  required
                />
              </label>

              <label>
                Número de telefone*
                <input
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(31) 99999-9999"
                  required
                />
              </label>
            </div>

            <label className="inscricao-checkbox">
              <input
                type="checkbox"
                checked={participacaoConfirmada}
                onChange={(e) => setParticipacaoConfirmada(e.target.checked)}
              />
              Eu participarei da CAMINHADA DA PADROEIRA com percurso de 5 km saindo da praça da Paróquia, indo até o Flona e voltando à praça da Paróquia.
            </label>

            <fieldset className="inscricao-fieldset">
              <legend>Forma de pagamento</legend>
              <label className="inscricao-radio">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="pix"
                  checked={paymentMethod === 'pix'}
                  onChange={() => setPaymentMethod('pix')}
                />
                Pagar por PIX (QR code e chave PIX)
              </label>
              <label className="inscricao-radio">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="dia"
                  checked={paymentMethod === 'dia'}
                  onChange={() => setPaymentMethod('dia')}
                />
                Pagar no dia da corrida
              </label>
            </fieldset>

            {paymentMethod === 'pix' && (
              <div className="inscricao-pix-details">
                <strong>Chave PIX (copiar e colar):</strong>
                <div className="pix-copy-row">
                  <input
                    type="text"
                    readOnly
                    value={pixKey}
                    className="pix-copy-input"
                    aria-label="Chave PIX para copiar"
                  />
                  <button
                    type="button"
                    className="pix-copy-button"
                    onClick={handleCopyPix}
                  >
                    {copiedPix ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
                <p className="pix-copy-note">Use copiar e colar no seu app de banco ou carteira digital.</p>
                <div className="pix-qr-placeholder">QR CODE</div>
              </div>
            )}

            <label className="inscricao-checkbox">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              Eu entendo que precisarei pagar R$ 20,00 no ato da inscrição através de PIX e no dia levar 1 litro de leite.
            </label>

            <button type="submit" className="inscricao-submit" disabled={submitting}>
              {submitting ? 'Enviando...' : 'Enviar inscrição'}
            </button>

            <p className="inscricao-note">
              🔒 Seus dados estão seguros &nbsp;|&nbsp; 📱 Ao enviar, o WhatsApp será aberto automaticamente.
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}

