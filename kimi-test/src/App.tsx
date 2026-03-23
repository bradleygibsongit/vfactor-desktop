import { Header } from "./components/Header"
import { Hero } from "./components/Hero"
import { Services } from "./components/Services"
import { WhyUs } from "./components/WhyUs"
import { Projects } from "./components/Projects"
import { Testimonials } from "./components/Testimonials"
import { FAQ } from "./components/FAQ"
import { Contact } from "./components/Contact"
import { Footer } from "./components/Footer"

function App() {
  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <main>
        <Hero />
        <Services />
        <WhyUs />
        <Projects />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

export default App
