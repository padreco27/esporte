import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import './Admin.css'

export default function Admin({ onBack }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

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

  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut()
    setUser(null)
    setMessage('Sessão encerrada.')
  }

  return (
    <section className="admin-page">
      <div className="admin-hero">
        <div className="admin-hero-card">
          <span className="admin-badge">Painel ADM</span>
          <h1>{user ? 'Bem-vindo ao painel administrativo' : 'Acesse com seu e-mail e senha'}</h1>
          <p>
            {user
              ? 'Acompanhe inscrições, ajuste detalhes do evento e mantenha tudo pronto para a próxima caminhada.'
              : 'Use seu usuário do Supabase para acessar as informações administrativas do evento.'}
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
        <div className="admin-grid">
          <article className="admin-card">
            <h2>Inscrições</h2>
            <p>Visualize o número de participantes e confirme presença de forma rápida.</p>
            <div className="admin-stat">232 inscritos</div>
            <button type="button">Ver inscrições</button>
          </article>

          <article className="admin-card">
            <h2>Atividades</h2>
            <p>Atualize horários, trilhas e conteúdos das atividades para garantir o melhor fluxo.</p>
            <div className="admin-stat">5 atividades programadas</div>
            <button type="button">Editar atividades</button>
          </article>

          <article className="admin-card">
            <h2>Configurações</h2>
            <p>Gerencie informações do evento, cores e chamadas rápidas para o público.</p>
            <div className="admin-stat">Tema verde e dourado</div>
            <button type="button">Ajustar detalhes</button>
          </article>
        </div>
      )}
    </section>
  )
}
