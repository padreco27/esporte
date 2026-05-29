import { useState } from 'react'
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

  return (
    <>
      <Navbar onAdminClick={() => setIsAdminPage(true)} />
      {isAdminPage ? (
        <Admin onBack={() => setIsAdminPage(false)} />
      ) : (
        <main>
          <Hero />
          <Countdown />
          <About />
          <Atividades />
          <Inscricao />
          <Footer />
        </main>
      )}
    </>
  )
}

export default App
