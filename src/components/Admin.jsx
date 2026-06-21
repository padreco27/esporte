import { useEffect, useState } from 'react'
import { supabase, supabaseConfigMessage } from '../lib/supabaseClient'
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
  const pixValue = 30
  const [pixKey, setPixKey] = useState('paroquiaparaopeba@diocesedesetelagoas.com.br')
  const [qrCodeImage, setQrCodeImage] = useState(null)
  const [qrCodePreview, setQrCodePreview] = useState('')
  const [walkingOptionText, setWalkingOptionText] = useState(
    'Eu participarei da CAMINHADA DA PADROEIRA com percurso de 5 km saindo da praça da Paróquia, indo até o Flona e voltando à praça da Paróquia.'
  )
  const [runningOptionText, setRunningOptionText] = useState(
    'Eu participarei da CORRIDA DA PADROEIRA de 100 metros com largada e chegada na praça da Paróquia.'
  )
  const [termsText, setTermsText] = useState(
    'Eu entendo que precisarei pagar R$30,00 no ato da inscrição através de PIX e no dia levar 1 litro de leite.'
  )
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsMessage, setSettingsMessage] = useState('')

  useEffect(() => {
    console.log('Supabase object:', supabase)
    console.log('Env URL:', import.meta.env.VITE_SUPABASE_URL)
    console.log('Env Key:', import.meta.env.VITE_SUPABASE_ANON_KEY)

    if (!supabase) {
      const debugMsg = supabaseConfigMessage || `Supabase não configurado. URL: ${import.meta.env.VITE_SUPABASE_URL}, Key: ${import.meta.env.VITE_SUPABASE_ANON_KEY ? 'existe' : 'não existe'}`
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
          modalidade: item.modalidade || 'N/D',
          paymentMethod: item.payment_method,
          termsAccepted: item.termos_aceitos,
          submittedAt: item.submitted_at,
        }))
      )
      setFetchError('')
      setLoadingSubmissions(false)
    }

    const loadSettings = async () => {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('key, value')
        .in('key', ['walkingOptionText', 'runningOptionText', 'termsText', 'qrCodeData', 'pixKey'])

      if (error) {
        console.warn('Não foi possível carregar as configurações do ADM:', error)
        return
      }

      data?.forEach((item) => {
        if (item.key === 'walkingOptionText') setWalkingOptionText(item.value)
        if (item.key === 'runningOptionText') setRunningOptionText(item.value)
        if (item.key === 'termsText') setTermsText(item.value)
        if (item.key === 'qrCodeData') setQrCodePreview(item.value)
        if (item.key === 'pixKey') setPixKey(item.value)
      })
    }

    loadSubmissions()
    loadSettings()
  }, [user])

  const handleSignIn = async (event) => {
    event.preventDefault()

    if (!supabase) {
      setMessage(supabaseConfigMessage || 'Supabase não está configurado. Verifique o arquivo .env.')
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

  const handleQrCodeUpload = async (event) => {
    const file = event.target.files[0]
    if (file && supabase) {
      setQrCodeImage(file)
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64Data = reader.result
        setQrCodePreview(base64Data)

        // Salvar no Supabase
        const { error } = await supabase
          .from('configuracoes')
          .upsert(
            { key: 'qrCodeData', value: base64Data },
            { onConflict: 'key' }
          )

        if (error) {
          console.error('Erro ao salvar QR Code:', error)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut()
    setUser(null)
    setMessage('Sessão encerrada.')
  }

  const handleSaveSettings = async () => {
    if (!supabase) {
      setSettingsMessage('Supabase não configurado. Não foi possível salvar as configurações.')
      return
    }

    setSavingSettings(true)
    setSettingsMessage('')

    const settingsToSave = [
      { key: 'walkingOptionText', value: walkingOptionText },
      { key: 'runningOptionText', value: runningOptionText },
      { key: 'termsText', value: termsText },
      { key: 'pixKey', value: pixKey },
    ]

    if (qrCodePreview) {
      settingsToSave.push({ key: 'qrCodeData', value: qrCodePreview })
    }

    const { error } = await supabase
      .from('configuracoes')
      .upsert(settingsToSave, { onConflict: 'key' })

    if (error) {
      setSettingsMessage(`Erro ao salvar as configurações: ${error.message}`)
    } else {
      setSettingsMessage('Configurações salvas com sucesso.')
    }

    setSavingSettings(false)
  }

  const totalSubmissions = submissionsState.length
  const pixCount = submissionsState.filter((item) => item.paymentMethod === 'PIX').length

  return (
    <section className="admin-page">
      <div className="admin-hero">
        <div className="admin-hero-card">
          <span className="admin-badge">Painel ADM</span>
          <h1>{user ? 'Bem-vindo ao painel administrativo' : 'Acesse com seu e-mail e senha'}</h1>
          <p>
            {user
              ? 'Acompanhe inscrições, pagamentos e confirme participantes direto no painel administrativo.'
              : 'Use seu usuário do administrativo para acessar as informações e configurações da pagina.'
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

      <div className="admin-content">
        {!user ? (
          <div className="admin-login-panel">
            <div className="admin-login-card admin-card--elevated">
              <h2>Entrar no painel ADM</h2>
              <p>Use suas credenciais para acessar o painel administrativo.</p>
              <form onSubmit={handleSignIn} className="admin-login-form">
                <label htmlFor="admin-email">E-mail</label>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="admin-input"
                />

                <label htmlFor="admin-password">Senha</label>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha segura"
                  required
                  className="admin-input"
                />

                <button type="submit" className="admin-save-button admin-full-width" disabled={loading}>
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <>
            <section className="admin-section admin-summary-section">
              <div className="admin-stats-grid">
                <article className="admin-card stats-card">
                  <span className="admin-card-label">Total de inscrições</span>
                  <div className="admin-stat large">{totalSubmissions}</div>
                  <p>Inscrições recebidas pelo site e enviadas ao WhatsApp.</p>
                </article>

                <article className="admin-card stats-card stats-card--accent">
                  <span className="admin-card-label">Pagou por PIX</span>
                  <div className="admin-stat large">{pixCount}</div>
                  <p>Participantes que escolheram o pagamento via PIX.</p>
                </article>
              </div>
            </section>

            <section className="admin-section admin-panel-grid">
              <article className="admin-card admin-panel-card admin-card--wide">
                <div className="admin-card-header">
                  <h2>Pagamento por PIX</h2>
                  <p>O valor do PIX está fixo em R$30,00 e o QR Code aparece no formulário.</p>
                </div>

                <div className="admin-field-group">
                  <label>Valor do PIX (R$)</label>
                  <div className="admin-input admin-fixed-value">R$ 30,00</div>
                </div>

                <div className="admin-field-group">
                  <label htmlFor="pix-key">Chave PIX (CPF, telefone, email ou aleatória)</label>
                  <input
                    id="pix-key"
                    type="text"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    placeholder="Chave PIX..."
                    className="admin-input"
                  />
                </div>

                <div className="admin-field-group">
                  <label htmlFor="qr-code-upload">QR Code do PIX</label>
                  <input
                    id="qr-code-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleQrCodeUpload}
                    className="admin-file-input"
                  />
                </div>

                {qrCodePreview ? (
                  <div className="admin-qr-preview">
                    <img src={qrCodePreview} alt="QR Code Preview" className="admin-qr-image" />
                    <p className="admin-qr-meta">{qrCodeImage?.name}</p>
                  </div>
                ) : (
                  <div className="pix-qr-placeholder">Nenhuma imagem de QR Code anexada</div>
                )}
              </article>

              <article className="admin-card admin-panel-card admin-card--wide">
                <div className="admin-card-header">
                  <h2>Textos do formulário</h2>
                  <p>Mude o texto exibido nas opções de modalidade e no termo de inscrição.</p>
                </div>

                <div className="admin-field-group">
                  <label htmlFor="walking-option">Texto da opção CAMINHADA</label>
                  <textarea
                    id="walking-option"
                    value={walkingOptionText}
                    onChange={(e) => setWalkingOptionText(e.target.value)}
                    rows={4}
                    className="admin-textarea"
                  />
                </div>

                <div className="admin-field-group">
                  <label htmlFor="running-option">Texto da opção CORRIDA</label>
                  <textarea
                    id="running-option"
                    value={runningOptionText}
                    onChange={(e) => setRunningOptionText(e.target.value)}
                    rows={4}
                    className="admin-textarea"
                  />
                </div>

                <div className="admin-field-group">
                  <label htmlFor="terms-text">Texto do termo de inscrição</label>
                  <textarea
                    id="terms-text"
                    value={termsText}
                    onChange={(e) => setTermsText(e.target.value)}
                    rows={3}
                    className="admin-textarea"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="admin-save-button"
                >
                  {savingSettings ? 'Salvando...' : 'Salvar alterações'}
                </button>
                {settingsMessage && (
                  <p className="admin-settings-message">{settingsMessage}</p>
                )}
              </article>
            </section>

            <section className="admin-section admin-table-section">
              <article className="admin-card admin-table-card">
                <div className="admin-card-header">
                  <h2>Incrições recentes</h2>
                  <p>Acompanhe os últimos inscritos no evento.</p>
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
                          <th>Data de Nascimento</th>
                          <th>Idade</th>
                          <th>Telefone</th>
                          <th>Modalidade</th>
                          <th>Pagamento</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissionsState.map((item) => (
                          <tr key={item.id}>
                            <td>{item.nome}</td>
                            <td>{item.dataNascimento}</td>
                            <td>{item.idade}</td>
                            <td>{item.telefone}</td>
                            <td>{item.modalidade}</td>
                            <td>{item.paymentMethod}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </article>
            </section>
          </>
        )}
      </div>
    </section>
  )
}
