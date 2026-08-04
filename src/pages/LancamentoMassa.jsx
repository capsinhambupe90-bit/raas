import React, { useState } from 'react';
import { Search, CheckSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LancamentoMassa() {
  const { pacientes, procedimentos, profissionais, lancarAcaoMassa } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  
  const [massaConfig, setMassaConfig] = useState({
    mes: '2026-08',
    procedimento_codigo: procedimentos[0]?.codigo || '',
    data: '2026-08-03',
    quantidade: '1',
    profissional_id: profissionais[0]?.id || '',
    local: 'CAPS'
  });

  const pacientesFiltrados = pacientes.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.cartao_sus.includes(searchTerm)
  );

  const isAllSelected = pacientesFiltrados.length > 0 && pacientesFiltrados.every(p => selectedIds.includes(p.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pacientesFiltrados.map(p => p.id));
    }
  };

  const togglePaciente = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const formatDateToBR = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('/')) return dateStr;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const handleLancarMassa = (e) => {
    e.preventDefault();
    if (selectedIds.length === 0) {
      alert("Por favor, selecione pelo menos um paciente na lista à esquerda.");
      return;
    }

    const profId = Number(massaConfig.profissional_id || profissionais[0]?.id);
    const prof = profissionais.find(p => p.id === profId) || profissionais[0];
    
    if (!prof) {
      alert("Nenhum profissional cadastrado.");
      return;
    }

    const procCodigo = massaConfig.procedimento_codigo || procedimentos[0]?.codigo || '0301010072';

    const novaAcao = {
      codigo: procCodigo,
      quantidade: massaConfig.quantidade || '1',
      data: formatDateToBR(massaConfig.data),
      cbo: prof.cbo,
      cns: prof.cns,
      local: massaConfig.local
    };

    lancarAcaoMassa(selectedIds, massaConfig.mes, novaAcao);
    alert(`Sucesso! ${selectedIds.length} ação(ões) lançadas nas fichas de ${massaConfig.mes}!`);
    setSelectedIds([]);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Lançamento em Massa</h1>
        <p style={{ color: 'var(--text-muted)' }}>Aplique o mesmo procedimento para múltiplos pacientes com apenas um clique.</p>
      </div>

      <div className="grid grid-cols-3 gap-4" style={{ gridTemplateColumns: '1fr 340px' }}>
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 style={{ fontWeight: 600 }}>Pacientes Cadastrados</h3>
            <div className="form-control flex items-center" style={{ width: '250px', display: 'flex', gap: '0.5rem', padding: '0.4rem 0.8rem' }}>
              <Search size={16} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder="Filtrar por nome ou SUS..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.875rem' }} 
              />
            </div>
          </div>
          
          <div className="table-wrapper" style={{ maxHeight: '450px', overflowY: 'auto' }}>
            <table className="table">
              <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8fafc', zIndex: 1 }}>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={isAllSelected} 
                      onChange={toggleSelectAll} 
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }} 
                    />
                  </th>
                  <th>Nome do Paciente</th>
                  <th>Cartão SUS</th>
                </tr>
              </thead>
              <tbody>
                {pacientesFiltrados.map((paciente) => {
                  const isChecked = selectedIds.includes(paciente.id);
                  return (
                    <tr key={paciente.id} onClick={() => togglePaciente(paciente.id)} style={{ cursor: 'pointer', backgroundColor: isChecked ? '#f0fdf4' : undefined }}>
                      <td style={{ textAlign: 'center' }}>
                        <input 
                          type="checkbox" 
                          checked={isChecked} 
                          onChange={() => {}} 
                          style={{ width: '16px', height: '16px', pointerEvents: 'none' }}
                        />
                      </td>
                      <td style={{ fontWeight: 500 }}>{paciente.nome}</td>
                      <td>{paciente.cartao_sus}</td>
                    </tr>
                  );
                })}
                {pacientesFiltrados.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum paciente cadastrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {selectedIds.length} paciente(s) selecionado(s) de {pacientesFiltrados.length}.
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Configuração do Lançamento</h3>
          
          <form onSubmit={handleLancarMassa}>
            <div className="form-group">
              <label className="form-label">Mês Corrente</label>
              <input type="month" className="form-control" value={massaConfig.mes} onChange={e => setMassaConfig({...massaConfig, mes: e.target.value})} required />
            </div>

            <div className="form-group">
              <label className="form-label">Procedimento (Código)</label>
              <select className="form-control" value={massaConfig.procedimento_codigo} onChange={e => setMassaConfig({...massaConfig, procedimento_codigo: e.target.value})} required>
                <option value="">Selecione o procedimento...</option>
                {procedimentos.map(proc => (
                  <option key={proc.id} value={proc.codigo}>
                    {proc.codigo} - {proc.observacao}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Data de Realização</label>
              <input type="date" className="form-control" value={massaConfig.data} onChange={e => setMassaConfig({...massaConfig, data: e.target.value})} required />
            </div>

            <div className="form-group">
              <label className="form-label">Quantidade</label>
              <input type="number" className="form-control" min="1" value={massaConfig.quantidade} onChange={e => setMassaConfig({...massaConfig, quantidade: e.target.value})} required />
            </div>

            <div className="form-group">
              <label className="form-label">Profissional Executante</label>
              <select className="form-control" value={massaConfig.profissional_id} onChange={e => setMassaConfig({...massaConfig, profissional_id: e.target.value})} required>
                <option value="">Selecione o profissional...</option>
                {profissionais.map(prof => (
                  <option key={prof.id} value={prof.id}>
                    {prof.nome} (CBO: {prof.cbo})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Local de Atendimento</label>
              <select className="form-control" value={massaConfig.local} onChange={e => setMassaConfig({...massaConfig, local: e.target.value})} required>
                <option value="CAPS">CAPS</option>
                <option value="Território">Território</option>
              </select>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary w-full" style={{ fontSize: '1rem', padding: '0.875rem' }}>
                <CheckSquare size={20} /> Lançar para Selecionados
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
