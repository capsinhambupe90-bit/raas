import React, { useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Procedimentos() {
  const { procedimentos, addProcedimento } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ codigo: '', observacao: '' });

  const handleOpenModal = () => {
    setFormData({ codigo: '', observacao: '' });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    addProcedimento(formData);
    setIsModalOpen(false);
  };

  const procedimentosFiltrados = procedimentos.filter(p => 
    p.codigo.includes(searchTerm) || 
    p.observacao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">Procedimentos</h1>
          <p style={{ color: 'var(--text-muted)' }}>Gerencie os códigos de ações realizadas.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenModal}>
          <Plus size={18} /> Novo Procedimento
        </button>
      </div>

      <div className="card">
        <div className="flex gap-4 mb-4">
          <div className="form-control flex items-center" style={{ width: '300px', display: 'flex', gap: '0.5rem' }}>
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Buscar procedimento..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%' }}
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Observação (Uso Interno / Descrição)</th>
              </tr>
            </thead>
            <tbody>
              {procedimentosFiltrados.map((proc) => (
                <tr key={proc.id}>
                  <td style={{ fontWeight: 600 }}>{proc.codigo}</td>
                  <td>{proc.observacao}</td>
                </tr>
              ))}
              {procedimentosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="2" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum procedimento encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="card" style={{ width: '500px', position: 'relative' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={24} color="var(--text-muted)" />
            </button>
            <h2 style={{ marginBottom: '1.5rem', fontWeight: 600, fontSize: '1.25rem' }}>Novo Procedimento</h2>
            
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Código da Ação</label>
                <input type="text" className="form-control" placeholder="Ex: 0301010072" value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value})} required />
              </div>

              <div className="form-group">
                <label className="form-label">Observação / Descrição da Ação</label>
                <input type="text" className="form-control" placeholder="Ex: Consulta Médica" value={formData.observacao} onChange={e => setFormData({...formData, observacao: e.target.value})} required />
              </div>

              <div className="flex justify-between" style={{ marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Procedimento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
