import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import './Admin.css'

export default function Admin({ onBack, submissions = [] }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [submissionsState, setSubmissionsState] = useState(submissions)
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [pixValue, setPixValue] = useState(20)
  const [qrCodeImage, setQrCodeImage] = useState(null)
  const [qrCodePreview, setQrCodePreview] = useState('')

  useEffect(() => {
    console.log('Supabase object:', supabase)
    console.log('Env URL:', import.meta.env.VITE_SUPABASE_URL)
    console.log('Env Key:', import.meta.env.VITE_SUPABASE_ANON_KEY)

    if (!supabase) {
      const debugMsg = `Supabase não configurado. URL: ${import.meta.env.VITE_SUPABASE_URL}, Key: ${import.meta.env.VITE_SUPABASE_ANON_KEY ? 'existe' : 'não existe'}`
      console.error(debugMsg)
      setMessage(debugMsg)
      return
    }

    let mounted = true

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setUser(data.session?.user ?? null)
    }

    loadSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!user || !supabase) return

    const loadSubmissions = async () => {
      setLoadingSubmissions(true)
      const { data, error } = await supabase
        .from('inscricoes')
        .select('*')
        .order('submitted_at', { ascending: false })

      if (error) {
        setFetchError('Não foi possível carregar as inscrições do Supabase.')
        setLoadingSubmissions(false)
        return
      }

      setSubmissionsState(
        data.map((item) => ({
          id: item.id,
          nome: item.nome,
          dataNascimento: item.data_nascimento,
          idade: item.idade,
          telefone: item.telefone,
          participacaoConfirmada: item.participacao_confirmada,
          paymentMethod: item.payment_method,
          termsAccepted: item.termos_aceitos,
          submittedAt: item.submitted_at,
        }))
      )
      setFetchError('')
      setLoadingSubmissions(false)
    }

    loadSubmissions()
  }, [user])

  const handleSignIn = async (event) => {
    event.preventDefault()

    if (!supabase) {
      setMessage('Supabase não está configurado. Verifique o arquivo .env.')
      return
    }

    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Login realizado com sucesso!')
      setEmail('')
      setPassword('')
    }

    setLoading(false)
  }

  const handleQrCodeUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setQrCodeImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setQrCodePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut()
    setUser(null)
    setMessage('Sessão encerrada.')
  }

  const totalSubmissions = submissionsState.length
  const pixCount = submissionsState.filter((item) => item.paymentMethod === 'PIX').length
  const onDayCount = submissionsState.filter((item) => item.paymentMethod === 'No dia').length

  return (
    <section className="admin-page">
      <div className="admin-hero">
        <div className="admin-hero-card">
          <span className="admin-badge">Painel ADM</span>
          <h1>{user ? 'Bem-vindo ao painel administrativo' : 'Acesse com seu e-mail e senha'}</h1>
          <p>
            {user
              ? 'Acompanhe inscrições, pagamentos e confirme participantes direto no painel administrativo.'
              : 'Use seu usuário do administrativo para acessar as informações administrativas do evento.'
              }
          </p>
          <div className="admin-hero-actions">
            {user ? (
              <button type="button" className="admin-back-button" onClick={handleSignOut}>
                Sair da área ADM
              </button>
            ) : (
              <button type="button" className="admin-back-button" onClick={onBack}>
                Voltar ao site
              </button>
            )}
          </div>
        </div>
      </div>

      {message && <div className="admin-error">{message}</div>}

      {!user ? (
        <div className="admin-login-panel">
          <div className="admin-login-card">
            <form onSubmit={handleSignIn} className="admin-login-form">
              <label htmlFor="admin-email">E-mail</label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />

              <label htmlFor="admin-password">Senha</label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha segura"
                required
              />

              <button type="submit" className="admin-login-button" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <>
          <div className="admin-grid">
            <article className="admin-card">
              <h2>Total de inscrições</h2>
              <p>Lista com todas as inscrições realizadas no site e enviadas para o WhatsApp.</p>
              <div className="admin-stat">{totalSubmissions} inscritos</div>
            </article>

            <article className="admin-card">
              <h2>Pagou por PIX</h2>
              <p>Inscrições que marcaram pagamento via PIX.</p>
              <div className="admin-stat">{pixCount} registros</div>
            </article>

            <article className="admin-card">
              <h2>Pagamento no dia</h2>
              <p>Inscrições que escolhem pagar presencialmente no evento.</p>
              <div className="admin-stat">{onDayCount} registros</div>
            </article>
          </div>

          <div className="admin-grid admin-payments-grid">
            <article className="admin-card">
              <h2>Pagamento por PIX</h2>
              <p>Use a chave abaixo para confirmar o pagamento.</p>
              
              <label htmlFor="pix-value" style={{ display: 'block', marginTop: '15px', marginBottom: '5px', fontWeight: 'bold' }}>
                Valor do PIX (R$):
              </label>
              <input
                id="pix-value"
                type="number"
                value={pixValue}
                onChange={(e) => setPixValue(Math.max(0, parseFloat(e.target.value) || 0))}
                step="0.01"
                min="0"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '16px',
                  marginBottom: '15px',
                }}
              />
              
              <div className="pix-key-box">paroquiaparaopeba@diocesedesetelagoas.com.br</div>
              
              <label htmlFor="qr-code-upload" style={{ display: 'block', marginTop: '15px', marginBottom: '8px', fontWeight: 'bold' }}>
                QR Code (Clique para escolher imagem):
              </label>
              <input
                id="qr-code-upload"
                type="file"
                accept="image/*"
                onChange={handleQrCodeUpload}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  marginBottom: '15px',
                  cursor: 'pointer',
                }}
              />
              {qrCodePreview && (
                <div style={{ marginTop: '15px', textAlign: 'center' }}>
                  <img
                    src={qrCodePreview}
                    alt="QR Code Preview"
                    style={{
                      maxWidth: '200px',
                      maxHeight: '200px',
                      borderRadius: '8px',
                      border: '2px solid #ddd',
                    }}
                  />
                  <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                    {qrCodeImage?.name}
                  </p>
                </div>
              )}
              {!qrCodePreview && (
                <div className="pix-qr-placeholder">Nenhuma imagem de QR Code anexada</div>
              )}
            </article>

            <article className="admin-card">
              <h2>Pagamento no dia</h2>
              <p>O participante poderá pagar no dia da corrida e apresentar o comprovante ou confirmar com a equipe.</p>
              <div className="admin-stat">Pagamento presencial disponível</div>
            </article>
          </div>

          <div className="admin-confirmed">
            <div className="admin-listing-header">
              <h2>Confirmados para o percurso</h2>
              <p>Lista de pessoas que confirmaram presença no percurso de 5 km.</p>
            </div>
            {submissionsState.filter((item) => item.participacaoConfirmada).length === 0 ? (
              <p className="admin-empty">Ainda não há confirmados para o percurso.</p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Telefone</th>
                      <th>Status de pagamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissionsState
                      .filter((item) => item.participacaoConfirmada)
                      .map((item) => (
                        <tr key={`confirmado-${item.id}`}>
                          <td>{item.nome}</td>
                          <td>{item.telefone}</td>
                          <td>{item.paymentMethod === 'PIX' ? 'Pago por PIX' : 'Paga no dia'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="admin-listing">
            <div className="admin-listing-header">
              <h2>Inscrições recentes</h2>
              <p>As inscrições aparecem aqui assim que são enviadas pelo formulário do site.</p>
            </div>

            {loadingSubmissions ? (
              <p className="admin-empty">Carregando inscrições do Supabase...</p>
            ) : fetchError ? (
              <p className="admin-empty">{fetchError}</p>
            ) : submissionsState.length === 0 ? (
              <p className="admin-empty">Nenhuma inscrição encontrada ainda.</p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Data Nasc.</th>
                      <th>Idade</th>
                      <th>Telefone</th>
                      <th>Percurso</th>
                      <th>Pagamento</th>
                      <th>Enviado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissionsState.map((item) => (
                      <tr key={item.id}>
                        <td>{item.nome}</td>
                        <td>{item.dataNascimento}</td>
                        <td>{item.idade}</td>
                        <td>{item.telefone}</td>
                        <td>{item.participacaoConfirmada ? 'Sim' : 'Não'}</td>
                        <td>{item.paymentMethod}</td>
                        <td>{new Date(item.submittedAt).toLocaleString('pt-BR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  )
}
