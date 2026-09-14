import React, { useState } from 'react';
import { Plus, Search, X, Edit, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { matchesSearch } from '../utils/text';

export default function Profissionais() {
  const { profissionais, addProfissional, updateProfissional, deleteProfissional } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nome: '', cns: '', cbo: '' });

  const handleOpenModal = (prof = null) => {
    if (prof) {
      setFormData(prof);
      setEditingId(prof.id);
    } else {
      setFormData({ nome: '', cns: '', cbo: '' });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingId) {
      updateProfissional(editingId, formData);
    } else {
      addProfissional(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id, nome) => {
    if (window.confirm(`Deseja realmente excluir o profissional "${nome}"?`)) {
      deleteProfissional(id);
    }
  };

  const profissionaisFiltrados = profissionais.filter(p => 
    matchesSearch(p.nome, searchTerm) || 
    matchesSearch(p.cns, searchTerm) ||
    matchesSearch(p.cbo, searchTerm)
  );

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">Profissionais</h1>
          <p style={{ color: 'var(--text-muted)' }}>Gerencie os executantes das ações.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Novo Profissional
        </button>
      </div>

      <div className="card">
        <div className="flex gap-4 mb-4">
          <div className="form-control flex items-center" style={{ width: '300px', display: 'flex', gap: '0.5rem' }}>
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Buscar profissional..." 
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
                <th>Nome</th>
                <th>CNS</th>
                <th>CBO</th>
                <th style={{ textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {profissionaisFiltrados.map((prof) => (
                <tr key={prof.id}>
                  <td style={{ fontWeight: 500 }}>{prof.nome}</td>
                  <td>{prof.cns}</td>
                  <td>{prof.cbo}</td>
                  <td>
                    <div className="flex justify-between items-center gap-2" style={{ justifyContent: 'center' }}>
                      <button 
                        className="btn btn-outline" 
                        onClick={() => handleOpenModal(prof)} 
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      >
                        <Edit size={14} /> Editar
                      </button>
                      <button 
                        className="btn btn-danger" 
                        onClick={() => handleDelete(prof.id, prof.nome)} 
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      >
                        <Trash2 size={14} /> Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {profissionaisFiltrados.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum profissional encontrado.</td>
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
              {editingId ? 'Editar Profissional' : 'Novo Profissional'}
            </h2>
            
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Nome do Profissional</label>
                <input type="text" className="form-control" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} required />
              </div>

              <div className="form-group">
                <label className="form-label">CNS (Cartão Nacional de Saúde)</label>
                <input type="text" className="form-control" value={formData.cns} onChange={e => setFormData({...formData, cns: e.target.value})} required />
              </div>

              <div className="form-group">
                <label className="form-label">CBO do Executante</label>
                <input type="text" className="form-control" value={formData.cbo} onChange={e => setFormData({...formData, cbo: e.target.value})} required />
              </div>

              <div className="flex justify-between" style={{ marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Profissional</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
