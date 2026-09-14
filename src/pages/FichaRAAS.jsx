import React, { useState } from 'react';
import { Search, Plus, Printer, List, FilePlus, Trash2, Edit, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { matchesSearch } from '../utils/text';
import FichaPrintView from '../components/FichaPrintView';

export default function FichaRAAS() {
  const { 
    pacientes, 
    procedimentos, 
    profissionais, 
    fichas, 
    lancarAcaoIndividual,
    deleteFicha,
    deleteAcao,
    updateAcao 
  } = useApp();
  
  const [mesSelecionado, setMesSelecionado] = useState('2026-08');
  const [activeTab, setActiveTab] = useState('lista'); // 'lista' | 'edicao'
  const [isPrintMode, setIsPrintMode] = useState(false);

  // Seleção para impressão em massa na lista
  const [selectedFichaIds, setSelectedFichaIds] = useState([]);
  
  // Estado da edição individual
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [buscaPacienteInput, setBuscaPacienteInput] = useState('');

  // Edição de Ação Específica
  const [editingAcao, setEditingAcao] = useState(null);

  const [novaAcao, setNovaAcao] = useState({ 
    codigo: '', 
    quantidade: '1', 
    data: '', 
    profissional_id: '', 
    local: 'CAPS' 
  });

  // Fichas filtradas pelo mês selecionado
  const fichasDoMes = fichas.filter(f => f.mes_atendimento === mesSelecionado);

  const formatMesExibicao = (mesStr) => {
    if (!mesStr) return '';
    const [ano, mes] = mesStr.split('-');
    return `${mes}/${ano}`;
  };

  // Buscar paciente para edição individual
  const handleBuscaPaciente = (e) => {
    e.preventDefault();
    const p = pacientes.find(item => 
      matchesSearch(item.nome, buscaPacienteInput) || 
      matchesSearch(item.cartao_sus, buscaPacienteInput)
    );
    if (p) {
      setPacienteSelecionado(p);
    } else {
      alert("Paciente não encontrado.");
    }
  };

  const handleSelecionarPacienteDaLista = (paciente) => {
    setPacienteSelecionado(paciente);
    setActiveTab('edicao');
  };

  const handleDeleteFicha = (fichaId, nomePaciente) => {
    if (window.confirm(`Deseja excluir a ficha inteira do paciente "${nomePaciente}" no mês ${formatMesExibicao(mesSelecionado)}?`)) {
      deleteFicha(fichaId);
      setSelectedFichaIds(prev => prev.filter(id => id !== fichaId));
    }
  };

  // Obter as ações da ficha do paciente selecionado no mês atual
  const fichaAtual = pacienteSelecionado ? fichas.find(f => Number(f.paciente_id) === Number(pacienteSelecionado.id) && f.mes_atendimento === mesSelecionado) : null;
  const acoesAtuais = fichaAtual ? fichaAtual.acoes : [];

  const formatDateToBR = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('/')) return dateStr;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const handleAdicionarAcao = (e) => {
    e.preventDefault();
    if (!pacienteSelecionado) return;

    const prof = profissionais.find(p => p.id === Number(novaAcao.profissional_id));
    if (!prof) {
      alert("Selecione o profissional.");
      return;
    }

    const acaoObj = {
      codigo: novaAcao.codigo,
      quantidade: novaAcao.quantidade,
      data: formatDateToBR(novaAcao.data),
      cbo: prof.cbo,
      cns: prof.cns,
      local: novaAcao.local
    };

    lancarAcaoIndividual(pacienteSelecionado.id, mesSelecionado, acaoObj);
    setNovaAcao({ codigo: '', quantidade: '1', data: '', profissional_id: '', local: 'CAPS' });
  };

  const handleDeleteAcao = (acaoId) => {
    if (!fichaAtual) return;
    if (window.confirm("Deseja realmente remover esta ação da ficha?")) {
      deleteAcao(fichaAtual.id, acaoId);
    }
  };

  const handleOpenEditAcao = (acao) => {
    // Encontrar profissional pelo CBO/CNS ou manter selecionado
    const prof = profissionais.find(p => p.cns === acao.cns) || profissionais[0];
    
    // Converter DD/MM/AAAA para YYYY-MM-DD se necessário para o input date
    let dataIso = acao.data;
    if (acao.data && acao.data.includes('/')) {
      const parts = acao.data.split('/');
      if (parts.length === 3) {
        dataIso = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    setEditingAcao({
      id: acao.id,
      codigo: acao.codigo,
      quantidade: acao.quantidade,
      data: dataIso,
      profissional_id: prof ? prof.id : '',
      local: acao.local
    });
  };

  const handleSaveEditAcao = (e) => {
    e.preventDefault();
    if (!fichaAtual || !editingAcao) return;

    const prof = profissionais.find(p => p.id === Number(editingAcao.profissional_id));
    if (!prof) {
      alert("Selecione um profissional.");
      return;
    }

    const acaoAtualizada = {
      codigo: editingAcao.codigo,
      quantidade: editingAcao.quantidade,
      data: formatDateToBR(editingAcao.data),
      cbo: prof.cbo,
      cns: prof.cns,
      local: editingAcao.local
    };

    updateAcao(fichaAtual.id, editingAcao.id, acaoAtualizada);
    setEditingAcao(null);
  };

  // Lógica de Seleção em Massa para Impressão
  const isAllSelected = fichasDoMes.length > 0 && fichasDoMes.every(f => selectedFichaIds.includes(f.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedFichaIds([]);
    } else {
      setSelectedFichaIds(fichasDoMes.map(f => f.id));
    }
  };

  const toggleFichaSelection = (id) => {
    if (selectedFichaIds.includes(id)) {
      setSelectedFichaIds(selectedFichaIds.filter(i => i !== id));
    } else {
      setSelectedFichaIds([...selectedFichaIds, id]);
    }
  };

  // Fichas que serão impressas no modo de impressão
  const fichasParaImprimir = isPrintMode ? (
    activeTab === 'edicao' && pacienteSelecionado ? [
      { paciente: pacienteSelecionado, acoes: acoesAtuais }
    ] : selectedFichaIds.map(fId => {
      const f = fichas.find(item => item.id === fId);
      const p = pacientes.find(item => item.id === f?.paciente_id);
      return { paciente: p, acoes: f ? f.acoes : [] };
    }).filter(item => item.paciente)
  ) : [];

  if (isPrintMode) {
    return (
      <div className="print-only">
        <div className="no-print flex justify-between items-center mb-4 card">
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Visualização de Impressão ({fichasParaImprimir.length} ficha(s))</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Confira como ficarão as páginas A4 antes de enviar para a impressora.</p>
          </div>
          <div className="flex gap-4">
            <button className="btn btn-outline" onClick={() => setIsPrintMode(false)}>
              Voltar
            </button>
            <button className="btn btn-primary" onClick={() => window.print()}>
              <Printer size={18} /> Confirmar e Imprimir
            </button>
          </div>
        </div>

        {fichasParaImprimir.map((item, index) => (
          <FichaPrintView 
            key={index}
            paciente={item.paciente} 
            acoes={item.acoes} 
            mesAtendimento={formatMesExibicao(mesSelecionado)} 
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">Fichas Mensais RAAS</h1>
          <p style={{ color: 'var(--text-muted)' }}>Gerencie a produção por mês, lance novos procedimentos ou imprima as fichas em lote.</p>
        </div>
        
        {/* Seletor do Mês no Cabeçalho */}
        <div className="flex items-center gap-4 bg-white p-3 card" style={{ padding: '0.5rem 1rem' }}>
          <span className="form-label" style={{ margin: 0, fontWeight: 600 }}>Mês de Produção:</span>
          <input 
            type="month" 
            className="form-control" 
            value={mesSelecionado} 
            onChange={e => {
              setMesSelecionado(e.target.value);
              setSelectedFichaIds([]);
            }} 
            style={{ width: 'auto', fontWeight: 600, color: 'var(--primary-color)' }}
          />
        </div>
      </div>

      {/* Tabs / Opções de Visualização */}
      <div className="flex gap-4 mb-4">
        <button 
          className={`btn ${activeTab === 'lista' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('lista')}
        >
          <List size={18} /> Lista de Fichas do Mês ({fichasDoMes.length})
        </button>
        <button 
          className={`btn ${activeTab === 'edicao' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('edicao')}
        >
          <FilePlus size={18} /> Lançar / Editar Ficha Individual
        </button>
      </div>

      {/* TAB 1: LISTA DE FICHAS DO MÊS */}
      {activeTab === 'lista' && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 style={{ fontWeight: 600 }}>Fichas Preenchidas em {formatMesExibicao(mesSelecionado)}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Total de {fichasDoMes.length} paciente(s) com produção cadastrada neste mês.
              </p>
            </div>

            {selectedFichaIds.length > 0 && (
              <button className="btn btn-secondary" onClick={() => setIsPrintMode(true)}>
                <Printer size={18} /> Imprimir {selectedFichaIds.length} Ficha(s) Selecionada(s)
              </button>
            )}
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={isAllSelected} 
                      onChange={toggleSelectAll} 
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                  </th>
                  <th>Paciente</th>
                  <th>Cartão SUS</th>
                  <th>Data Admissão</th>
                  <th>Ações no Mês</th>
                  <th style={{ textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {fichasDoMes.map((ficha) => {
                  const paciente = pacientes.find(p => Number(p.id) === Number(ficha.paciente_id));
                  const isChecked = selectedFichaIds.includes(ficha.id);
                  if (!paciente) return null;

                  return (
                    <tr key={ficha.id} style={{ backgroundColor: isChecked ? '#f0fdf4' : undefined }}>
                      <td style={{ textAlign: 'center' }}>
                        <input 
                          type="checkbox" 
                          checked={isChecked} 
                          onChange={() => toggleFichaSelection(ficha.id)} 
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ fontWeight: 500 }}>{paciente.nome}</td>
                      <td>{paciente.cartao_sus}</td>
                      <td>{paciente.data_admissao}</td>
                      <td>
                        <span style={{ 
                          backgroundColor: '#e0f2fe', color: '#0369a1', 
                          padding: '0.2rem 0.6rem', borderRadius: '12px', 
                          fontWeight: 600, fontSize: '0.875rem' 
                        }}>
                          {ficha.acoes.length} ação(ões)
                        </span>
                      </td>
                      <td>
                        <div className="flex justify-between items-center gap-2" style={{ justifyContent: 'center' }}>
                          <button 
                            className="btn btn-outline" 
                            onClick={() => handleSelecionarPacienteDaLista(paciente)}
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                          >
                            <Edit size={14} /> Editar Ações
                          </button>
                          <button 
                            className="btn btn-danger" 
                            onClick={() => handleDeleteFicha(ficha.id, paciente.nome)}
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                          >
                            <Trash2 size={14} /> Excluir Ficha
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {fichasDoMes.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      Nenhuma ficha cadastrada para o mês de {formatMesExibicao(mesSelecionado)}. 
                      <br /> Use a aba <strong>Lançamento em Massa</strong> ou clique em <strong>Lançar / Editar Ficha Individual</strong> para começar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: LANÇAMENTO INDIVIDUAL */}
      {activeTab === 'edicao' && (
        <>
          <div className="card mb-4">
            <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>1. Selecionar Paciente</h3>
            <form onSubmit={handleBuscaPaciente} className="flex gap-4">
              <input 
                type="text" 
                className="form-control" 
                placeholder="Digite o Nome ou Cartão SUS do paciente..." 
                value={buscaPacienteInput}
                onChange={e => setBuscaPacienteInput(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary">
                <Search size={18} /> Buscar
              </button>
            </form>
          </div>

          {pacienteSelecionado && (
            <>
              <div className="card mb-4" style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1' }}>
                <div className="flex justify-between items-center mb-4">
                  <h3 style={{ fontWeight: 600, color: 'var(--primary-color)' }}>Dados do Paciente</h3>
                  <button className="btn btn-secondary" onClick={() => setIsPrintMode(true)}>
                    <Printer size={18} /> Visualizar Impressão Desta Ficha
                  </button>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <span className="form-label">Nome do Paciente</span>
                    <strong>{pacienteSelecionado.nome}</strong>
                  </div>
                  <div>
                    <span className="form-label">CPF</span>
                    <strong>{pacienteSelecionado.cpf || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span className="form-label">Cartão do SUS</span>
                    <strong>{pacienteSelecionado.cartao_sus}</strong>
                  </div>
                  <div>
                    <span className="form-label">Data Nasc. / Sexo</span>
                    <strong>{pacienteSelecionado.data_nascimento} / {pacienteSelecionado.sexo}</strong>
                  </div>
                  <div>
                    <span className="form-label">Data de Admissão</span>
                    <strong>{pacienteSelecionado.data_admissao}</strong>
                  </div>
                  <div>
                    <span className="form-label">CID-10 Principal</span>
                    <strong>{pacienteSelecionado.cid_principal}</strong>
                  </div>
                  <div>
                    <span className="form-label">Mês Selecionado</span>
                    <strong>{formatMesExibicao(mesSelecionado)}</strong>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>2. Adicionar Ação Realizada em {formatMesExibicao(mesSelecionado)}</h3>
                
                <form onSubmit={handleAdicionarAcao} className="grid grid-cols-3 gap-4 mb-4" style={{ alignItems: 'end', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <label className="form-label">Procedimento (Código)</label>
                    <select className="form-control" value={novaAcao.codigo} onChange={e => setNovaAcao({...novaAcao, codigo: e.target.value})} required>
                      <option value="">Selecione...</option>
                      {procedimentos.map(proc => (
                        <option key={proc.id} value={proc.codigo}>
                          {proc.codigo} - {proc.observacao}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Data</label>
                    <input type="date" className="form-control" value={novaAcao.data} onChange={e => setNovaAcao({...novaAcao, data: e.target.value})} required />
                  </div>
                  <div>
                    <label className="form-label">Quantidade</label>
                    <input type="number" className="form-control" min="1" value={novaAcao.quantidade} onChange={e => setNovaAcao({...novaAcao, quantidade: e.target.value})} required />
                  </div>
                  <div>
                    <label className="form-label">Profissional</label>
                    <select className="form-control" value={novaAcao.profissional_id} onChange={e => setNovaAcao({...novaAcao, profissional_id: e.target.value})} required>
                      <option value="">Selecione o profissional...</option>
                      {profissionais.map(prof => (
                        <option key={prof.id} value={prof.id}>
                          {prof.nome} (CBO: {prof.cbo})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Local</label>
                    <select className="form-control" value={novaAcao.local} onChange={e => setNovaAcao({...novaAcao, local: e.target.value})} required>
                      <option value="CAPS">CAPS</option>
                      <option value="Território">Território</option>
                    </select>
                  </div>
                  <div>
                    <button type="submit" className="btn btn-primary w-full">
                      <Plus size={18} /> Adicionar Ação
                    </button>
                  </div>
                </form>

                <h4 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Ações Cadastradas nesta Ficha ({acoesAtuais.length})</h4>
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Data</th>
                        <th>Qtd</th>
                        <th>CBO</th>
                        <th>CNS</th>
                        <th>Local</th>
                        <th style={{ textAlign: 'center' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {acoesAtuais.map((acao) => (
                        <tr key={acao.id}>
                          <td style={{ fontWeight: 600 }}>{acao.codigo}</td>
                          <td>{acao.data}</td>
                          <td>{acao.quantidade}</td>
                          <td>{acao.cbo}</td>
                          <td>{acao.cns}</td>
                          <td>{acao.local}</td>
                          <td>
                            <div className="flex justify-between items-center gap-2" style={{ justifyContent: 'center' }}>
                              <button 
                                className="btn btn-outline" 
                                onClick={() => handleOpenEditAcao(acao)}
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                              >
                                <Edit size={12} /> Editar
                              </button>
                              <button 
                                className="btn btn-danger" 
                                onClick={() => handleDeleteAcao(acao.id)}
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                              >
                                <Trash2 size={12} /> Excluir
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {acoesAtuais.length === 0 && (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                            Nenhuma ação lançada nesta ficha para o mês de {formatMesExibicao(mesSelecionado)}.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Modal de Edição de Ação Realizada */}
      {editingAcao && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="card" style={{ width: '550px', position: 'relative' }}>
            <button onClick={() => setEditingAcao(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={24} color="var(--text-muted)" />
            </button>
            <h2 style={{ marginBottom: '1.5rem', fontWeight: 600, fontSize: '1.25rem' }}>Editar Ação Realizada</h2>
            
            <form onSubmit={handleSaveEditAcao}>
              <div className="form-group">
                <label className="form-label">Procedimento (Código)</label>
                <select className="form-control" value={editingAcao.codigo} onChange={e => setEditingAcao({...editingAcao, codigo: e.target.value})} required>
                  {procedimentos.map(proc => (
                    <option key={proc.id} value={proc.codigo}>
                      {proc.codigo} - {proc.observacao}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Data de Realização</label>
                  <input type="date" className="form-control" value={editingAcao.data} onChange={e => setEditingAcao({...editingAcao, data: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Quantidade</label>
                  <input type="number" className="form-control" min="1" value={editingAcao.quantidade} onChange={e => setEditingAcao({...editingAcao, quantidade: e.target.value})} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Profissional Executante</label>
                <select className="form-control" value={editingAcao.profissional_id} onChange={e => setEditingAcao({...editingAcao, profissional_id: e.target.value})} required>
                  {profissionais.map(prof => (
                    <option key={prof.id} value={prof.id}>
                      {prof.nome} (CBO: {prof.cbo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Local de Atendimento</label>
                <select className="form-control" value={editingAcao.local} onChange={e => setEditingAcao({...editingAcao, local: e.target.value})} required>
                  <option value="CAPS">CAPS</option>
                  <option value="Território">Território</option>
                </select>
              </div>

              <div className="flex justify-between" style={{ marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setEditingAcao(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
