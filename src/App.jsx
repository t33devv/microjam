import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { Routes, Route } from 'react-router-dom'

import Home from './pages/Home'
import Jams from './pages/Jams'
import HoF from './pages/HoF'
import HoC from './pages/HoC'
import Voting from './pages/Voting'
import VotingResults from './pages/VotingResults'
import NotFound from './pages/NotFound'
import DiscordRedirect from './pages/DiscordRedirect'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jams" element={<Jams />} />
        <Route path="/hof" element={<HoF />} />
        <Route path="/hoc" element={<HoC />} />
        <Route path="/voting" element={<Voting />} />
        <Route path="/voting/results" element={<VotingResults />} />
        <Route path="/discord" element={<DiscordRedirect />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App