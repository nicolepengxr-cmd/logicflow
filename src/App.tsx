import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import CleanSlate from './pages/CleanSlate';
import Solver from './pages/Solver';
import MistakeBook from './pages/MistakeBook';
import Privacy from './pages/Privacy';
import About from './pages/About';
import SymbolicBackground from './components/SymbolicBackground';

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <SymbolicBackground />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cleanslate" element={<CleanSlate />} />
            <Route path="/solver" element={<Solver />} />
            <Route path="/mistakebook" element={<MistakeBook />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

