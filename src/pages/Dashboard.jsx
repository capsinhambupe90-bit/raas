import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar } from 'lucide-react';

export default function Dashboard() {
  const { pacientes, profissionais, fichas } = useApp();
  const [mesFiltro, setMesFiltro] = useState('2026-08');

  const fichasDoMes = fichas.filter(f => f.mes_atendimento === mesFiltro);
  
  // Total de procedimentos/ações somados em todas as fichas do mês
  const totalAcoesDoMes = fichasDoMes.reduce((acc, f) => acc + f.acoes.length, 0);

  const formatMesExibicao = (mesStr) => {
    if (!mesStr) return '';
    const [ano, mes] = mesStr.split('-');
    return `${mes}/${ano}`;
  };

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Visão geral do sistema e indicadores de produção.</p>
        </div>

        {/* Seletor de Mês do Dashboard */}
        <div className="flex items-center gap-3 bg-white p-3 card" style={{ padding: '0.6rem 1.2rem' }}>
          <Calendar size={20} color="var(--primary-color)" />
          <span className="form-label" style={{ margin: 0, fontWeight: 600 }}>Mês de Referência:</span>
          <input 
            type="month" 
            className="form-control" 
            value={mesFiltro} 
            onChange={e => setMesFiltro(e.target.value)} 
            style={{ width: 'auto', fontWeight: 600, color: 'var(--primary-color)' }}
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card">
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Total de Pacientes</h3>
          <p style={{ fontSize: '2.25rem', fontWeight: '700', marginTop: '0.5rem', color: 'var(--primary-color)' }}>
            {pacientes.length}
          </p>
        </div>

        <div className="card">
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Fichas em {formatMesExibicao(mesFiltro)}</h3>
          <p style={{ fontSize: '2.25rem', fontWeight: '700', marginTop: '0.5rem', color: 'var(--secondary-color)' }}>
            {fichasDoMes.length}
          </p>
        </div>

        <div className="card">
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Ações em {formatMesExibicao(mesFiltro)}</h3>
          <p style={{ fontSize: '2.25rem', fontWeight: '700', marginTop: '0.5rem', color: '#8b5cf6' }}>
            {totalAcoesDoMes}
          </p>
        </div>

        <div className="card">
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Profissionais</h3>
          <p style={{ fontSize: '2.25rem', fontWeight: '700', marginTop: '0.5rem', color: 'var(--text-main)' }}>
            {profissionais.length}
          </p>
        </div>
      </div>
    </div>
  );
}
