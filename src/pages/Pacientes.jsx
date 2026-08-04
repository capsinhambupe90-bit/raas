import React, { useState } from 'react';
import { Plus, Search, X, Trash2, Edit } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Pacientes() {
  const { pacientes, addPaciente, updatePaciente, deletePaciente } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    cartao_sus: '',
    cpf: '',
    sexo: '',
    data_nascimento: '',
    nome_mae: '',
    endereco: '',
    telefone: '',
    data_admissao: '',
    cid_principal: '',
    cid_associado: ''
  });

  const handleOpenModal = (paciente = null) => {
    if (paciente) {
      setFormData(paciente);
      setEditingId(paciente.id);
    } else {
      setFormData({
        nome: '',
        cartao_sus: '',
        cpf: '',
        sexo: '',
        data_nascimento: '',
        nome_mae: '',
        endereco: '',
        telefone: '',
        data_admissao: '',
        cid_principal: '',
        cid_associado: ''
      });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingId) {
      updatePaciente(editingId, formData);
    } else {
      addPaciente(formData);
    }
    handleCloseModal();
  };

  const handleDelete = (id, nome) => {
    if (window.confirm(`Tem certeza que deseja excluir o paciente "${nome}"? Todas as fichas atreladas a ele também serão removidas.`)) {
      deletePaciente(id);
    }
  };

  const pacientesFiltrados = pacientes.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.cartao_sus.includes(searchTerm)
  );

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">Pacientes</h1>
          <p style={{ color: 'var(--text-muted)' }}>Gerencie os usuários do SUS.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Novo Paciente
        </button>
      </div>

      <div className="card">
        <div className="flex gap-4 mb-4">
          <div className="form-control flex items-center" style={{ width: '300px', display: 'flex', gap: '0.5rem' }}>
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Buscar paciente..." 
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
                <th>Cartão do SUS</th>
                <th>CPF</th>
                <th>Data Nasc.</th>
                <th style={{ textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pacientesFiltrados.map((paciente) => (
                <tr key={paciente.id}>
                  <td style={{ fontWeight: 500 }}>{paciente.nome}</td>
                  <td>{paciente.cartao_sus}</td>
                  <td>{paciente.cpf}</td>
                  <td>{paciente.data_nascimento}</td>
                  <td>
                    <div className="flex justify-between items-center gap-2" style={{ justifyContent: 'center' }}>
                      <button 
                        className="btn btn-outline" 
                        onClick={() => handleOpenModal(paciente)} 
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        title="Editar"
                      >
                        <Edit size={14} /> Editar
                      </button>
                      <button 
                        className="btn btn-danger" 
                        onClick={() => handleDelete(paciente.id, paciente.nome)} 
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        title="Excluir"
                      >
                        <Trash2 size={14} /> Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pacientesFiltrados.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum paciente encontrado.</td>
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
          <div className="card" style={{ width: '800px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={handleCloseModal} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={24} color="var(--text-muted)" />
            </button>
            <h2 style={{ marginBottom: '1.5rem', fontWeight: 600, fontSize: '1.25rem' }}>
              {editingId ? 'Editar Paciente' : 'Novo Paciente'}
            </h2>
            
            <form onSubmit={handleSave}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Nome do Paciente</label>
                  <input type="text" className="form-control" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} required />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Cartão do SUS</label>
                  <input type="text" className="form-control" value={formData.cartao_sus} onChange={e => setFormData({...formData, cartao_sus: e.target.value})} required />
                </div>

                <div className="form-group">
                  <label className="form-label">CPF</label>
                  <input type="text" className="form-control" value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} />
                </div>

                <div className="form-group">
                  <label className="form-label">Data de Nascimento</label>
                  <input type="text" className="form-control" placeholder="DD/MM/AAAA" value={formData.data_nascimento} onChange={e => setFormData({...formData, data_nascimento: e.target.value})} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Sexo</label>
                  <select className="form-control" value={formData.sexo} onChange={e => setFormData({...formData, sexo: e.target.value})} required>
                    <option value="">Selecione...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Nome da Mãe</label>
                  <input type="text" className="form-control" value={formData.nome_mae} onChange={e => setFormData({...formData, nome_mae: e.target.value})} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Endereço</label>
                  <input type="text" className="form-control" value={formData.endereco} onChange={e => setFormData({...formData, endereco: e.target.value})} />
                </div>

                <div className="form-group">
                  <label className="form-label">Telefone</label>
                  <input type="text" className="form-control" value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} />
                </div>
              </div>

              <h3 style={{ marginBottom: '1rem', fontWeight: 600, fontSize: '1.1rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>Dados Clínicos / Admissão</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Data de Admissão</label>
                  <input type="text" className="form-control" placeholder="DD/MM/AAAA" value={formData.data_admissao} onChange={e => setFormData({...formData, data_admissao: e.target.value})} />
                </div>

                <div className="form-group">
                  <label className="form-label">CID 10 Principal</label>
                  <input type="text" className="form-control" value={formData.cid_principal} onChange={e => setFormData({...formData, cid_principal: e.target.value})} />
                </div>

                <div className="form-group">
                  <label className="form-label">CID 10 Associado</label>
                  <input type="text" className="form-control" value={formData.cid_associado} onChange={e => setFormData({...formData, cid_associado: e.target.value})} />
                </div>
              </div>

              <div className="flex justify-between" style={{ marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" onClick={handleCloseModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Paciente</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
