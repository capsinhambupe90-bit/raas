import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, ClipboardList, Stethoscope } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Profissionais from './pages/Profissionais';
import Pacientes from './pages/Pacientes';
import Procedimentos from './pages/Procedimentos';
import FichaRAAS from './pages/FichaRAAS';
import LancamentoMassa from './pages/LancamentoMassa';
import { AppProvider } from './context/AppContext';

function Sidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <aside className="sidebar no-print">
      <div className="sidebar-title">
        <Stethoscope size={28} />
        <span>RAAS System</span>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Link to="/" className={`nav-link ${isActive('/')}`}>
          <LayoutDashboard size={20} /> Dashboard
        </Link>
        <Link to="/pacientes" className={`nav-link ${isActive('/pacientes')}`}>
          <Users size={20} /> Pacientes
        </Link>
        <Link to="/profissionais" className={`nav-link ${isActive('/profissionais')}`}>
          <Stethoscope size={20} /> Profissionais
        </Link>
        <Link to="/procedimentos" className={`nav-link ${isActive('/procedimentos')}`}>
          <FileText size={20} /> Procedimentos
        </Link>
        <Link to="/fichas" className={`nav-link ${isActive('/fichas')}`}>
          <ClipboardList size={20} /> Ficha RAAS
        </Link>
        <Link to="/massa" className={`nav-link ${isActive('/massa')}`}>
          <Users size={20} /> Lançamento em Massa
        </Link>
      </nav>
    </aside>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pacientes" element={<Pacientes />} />
              <Route path="/profissionais" element={<Profissionais />} />
              <Route path="/procedimentos" element={<Procedimentos />} />
              <Route path="/fichas" element={<FichaRAAS />} />
              <Route path="/massa" element={<LancamentoMassa />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
