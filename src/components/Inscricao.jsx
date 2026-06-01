import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import './Inscricao.css'

const formatarTelefone = (valor) => {
  const numeros = valor.replace(/\D/g, "");

  if (numeros.length <= 2) {
    return `(${numeros}`;
  }

  if (numeros.length <= 7) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  }

  if (numeros.length <= 11) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
  }

  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
};

export default function Inscricao({ onSubmit }) {
  const revealRefs = useRef([])
  const [nome, setNome] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [idade, setIdade] = useState('')
  const [telefone, setTelefone] = useState('')
  const [evento, setEvento] = useState('caminhada')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('pix')
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [copiedPix, setCopiedPix] = useState(false)
  const [caminhadaOptionText, setCaminhadaOptionText] = useState(
    'Eu participarei da CAMINHADA DA PADROEIRA com percurso de 5 km saindo da praça da Paróquia, indo até o Flona e voltando à praça da Paróquia.'
  )
  const [corridaOptionText, setCorridaOptionText] = useState(
    'Eu participarei da CORRIDA DA PADROEIRA de 100 metros com largada e chegada na praça da Paróquia.'
  )
  const [termsText, setTermsText] = useState(
    'Eu entendo que precisarei pagar R$30,00 no ato da inscrição através de PIX e no dia levar 1 litro de leite.'
  )
  const [qrCodeImage, setQrCodeImage] = useState(null)
  const [pixKey, setPixKey] = useState('paroquiaparaopeba@diocesedesetelagoas.com.br')

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
    if (!supabase) {
      console.error('❌ Supabase não inicializado. Variáveis de ambiente podem estar faltando.')
    } else {
      console.log('✓ Supabase está disponível para inscrições')
    }
  }, [])

  useEffect(() => {
    if (!supabase) return

    const loadFormTexts = async () => {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('key, value')
        .in('key', ['walkingOptionText', 'runningOptionText', 'termsText', 'qrCodeData', 'pixKey'])

      if (error) {
        console.warn('Não foi possível carregar textos do formulário:', error)
        return
      }

      data?.forEach((item) => {
        if (item.key === 'walkingOptionText') setCaminhadaOptionText(item.value)
        if (item.key === 'runningOptionText') setCorridaOptionText(item.value)
        if (item.key === 'termsText') setTermsText(item.value)
        if (item.key === 'qrCodeData') setQrCodeImage(item.value)
        if (item.key === 'pixKey') setPixKey(item.value)
      })
    }

    loadFormTexts()
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

    if (!evento) {
      setErrorMessage('Selecione se deseja a caminhada ou a corrida.')
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
      modalidade: evento === 'caminhada' ? 'Caminhada' : 'Corrida',
      payment_method: paymentMethod === 'pix' ? 'PIX' : 'No dia',
      termos_aceitos: termsAccepted,
      submitted_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('inscricoes')
      .insert([submission])
      .select()

    if (error) {
      console.error('Erro ao salvar inscrição no Supabase:', error)
      const errorMsg = error.message || 'Erro desconhecido'
      const errorCode = error.code || ''
      const detailedMessage = `Erro: ${errorMsg}${errorCode ? ` (${errorCode})` : ''}`
      setErrorMessage(`Não foi possível salvar a inscrição. ${detailedMessage}`)
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
      modalidade: evento,
      paymentMethod,
      termsAccepted,
      submittedAt: submission.submitted_at,
    }

    onSubmit?.(localSubmission)

    const descricaoEvento = evento === 'caminhada'
      ? caminhadaOptionText
      : corridaOptionText

    const whatsappText = encodeURIComponent(
      `Nova inscrição Evento da Padroeira:\n` +
      `Nome: ${nome}\n` +
      `Data de Nascimento: ${dataNascimento}\n` +
      `Idade: ${idade}\n` +
      `Telefone: ${telefone}\n` +
      `Modalidade: ${evento === 'caminhada' ? 'Caminhada' : 'Corrida'}\n` +
      `${descricaoEvento}\n` +
      `Forma de pagamento: ${paymentMethod === 'pix' ? 'PIX' : 'No dia'}\n` +
      `Termos aceitos: Sim`
    )

    setSuccessMessage('Inscrição registrada! Abrindo WhatsApp para confirmação automática...')
    setErrorMessage('')
    setNome('')
    setDataNascimento('')
    setIdade('')
    setTelefone('')
    setEvento('caminhada')
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
                  placeholder="dd/mm/aaaa"
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
                  id="telefone"
                  value={telefone}
                  onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                  placeholder="(31) 99999-9999"
                  required
                />
              </label>
            </div>

            <fieldset className="inscricao-fieldset">
              <legend>Modalidade*</legend>
              <label className="inscricao-radio">
                <input
                  type="radio"
                  name="evento"
                  value="caminhada"
                  checked={evento === 'caminhada'}
                  onChange={() => setEvento('caminhada')}
                />
                {caminhadaOptionText}
              </label>
              <label className="inscricao-radio">
                <input
                  type="radio"
                  name="evento"
                  value="corrida"
                  checked={evento === 'corrida'}
                  onChange={() => setEvento('corrida')}
                />
                {corridaOptionText}
              </label>
            </fieldset>

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
                <button
                  type="button"
                  className="pix-copy-button"
                  onClick={handleCopyPix}
                >
                  {copiedPix ? 'Copiado!' : 'PIX Copia e Cola'}
                </button>
                {qrCodeImage ? (
                  <img src={qrCodeImage} alt="QR Code PIX" className="pix-qr-image" />
                ) : (
                  <div className="pix-qr-placeholder">QR CODE</div>
                )}
              </div>
            )}

            <label className="inscricao-checkbox">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              {termsText}
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

