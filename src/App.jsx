import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Countdown from './components/Countdown'
import About from './components/About'
import Atividades from './components/Atividades'
import Inscricao from './components/Inscricao'
import Footer from './components/Footer'
import Admin from './components/Admin'

function App() {
  const [isAdminPage, setIsAdminPage] = useState(false)
  const [submissions, setSubmissions] = useState(() => {
    if (typeof window === 'undefined') return []
    const saved = window.localStorage.getItem('inscricoes')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('inscricoes', JSON.stringify(submissions))
  }, [submissions])

  const handleNewSubmission = (submission) => {
    setSubmissions((prev) => [submission, ...prev])
  }

  return (
    <>
      <Navbar onAdminClick={() => setIsAdminPage(true)} />
      {isAdminPage ? (
        <Admin onBack={() => setIsAdminPage(false)} submissions={submissions} />
      ) : (
        <main>
          <Hero />
          <Countdown />
          <About />
          <Atividades />
          <Inscricao onSubmit={handleNewSubmission} />
          <Footer />
        </main>
      )}
    </>
  )
}

export default App
