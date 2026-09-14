import React, { useState } from 'react';
import { Plus, Search, X, Edit, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { matchesSearch } from '../utils/text';

export default function Procedimentos() {
  const { procedimentos, addProcedimento, updateProcedimento, deleteProcedimento } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ codigo: '', observacao: '' });

  const handleOpenModal = (proc = null) => {
    if (proc) {
      setFormData(proc);
      setEditingId(proc.id);
    } else {
      setFormData({ codigo: '', observacao: '' });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingId) {
      updateProcedimento(editingId, formData);
    } else {
      addProcedimento(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id, codigo) => {
    if (window.confirm(`Deseja realmente excluir o procedimento código "${codigo}"?`)) {
      deleteProcedimento(id);
    }
  };

  const procedimentosFiltrados = procedimentos.filter(p => 
    matchesSearch(p.codigo, searchTerm) || 
    matchesSearch(p.observacao, searchTerm)
  );

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">Procedimentos</h1>
          <p style={{ color: 'var(--text-muted)' }}>Gerencie os códigos de ações realizadas.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
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
                <th style={{ textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {procedimentosFiltrados.map((proc) => (
                <tr key={proc.id}>
                  <td style={{ fontWeight: 600 }}>{proc.codigo}</td>
                  <td>{proc.observacao}</td>
                  <td>
                    <div className="flex justify-between items-center gap-2" style={{ justifyContent: 'center' }}>
                      <button 
                        className="btn btn-outline" 
                        onClick={() => handleOpenModal(proc)} 
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      >
                        <Edit size={14} /> Editar
                      </button>
                      <button 
                        className="btn btn-danger" 
                        onClick={() => handleDelete(proc.id, proc.codigo)} 
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      >
                        <Trash2 size={14} /> Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {procedimentosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum procedimento encontrado.</td>
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
            <h2 style={{ marginBottom: '1.5rem', fontWeight: 600, fontSize: '1.25rem' }}>
              {editingId ? 'Editar Procedimento' : 'Novo Procedimento'}
            </h2>
            
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
