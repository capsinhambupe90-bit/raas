import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [pacientes, setPacientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [procedimentos, setProcedimentos] = useState([]);
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carrega todos os dados do Supabase
  const carregarDados = async () => {
    try {
      setLoading(true);

      const [pacsRes, profsRes, procsRes, fichasRes, acoesRes] = await Promise.all([
        supabase.from('pacientes').select('*').order('nome'),
        supabase.from('profissionais').select('*').order('nome'),
        supabase.from('procedimentos').select('*').order('codigo'),
        supabase.from('fichas_mensais').select('*'),
        supabase.from('acoes_realizadas').select('*')
      ]);

      if (pacsRes.error) console.error('Erro ao buscar pacientes:', pacsRes.error);
      if (profsRes.error) console.error('Erro ao buscar profissionais:', profsRes.error);
      if (procsRes.error) console.error('Erro ao buscar procedimentos:', procsRes.error);
      if (fichasRes.error) console.error('Erro ao buscar fichas:', fichasRes.error);
      if (acoesRes.error) console.error('Erro ao buscar ações:', acoesRes.error);

      setPacientes(pacsRes.data || []);
      setProfissionais(profsRes.data || []);
      setProcedimentos(procsRes.data || []);

      // Agrupa as ações realizadas por ficha_id
      const acoesPorFicha = (acoesRes.data || []).reduce((acc, acao) => {
        const fId = Number(acao.ficha_id);
        if (!acc[fId]) acc[fId] = [];
        acc[fId].push({
          id: acao.id,
          codigo: acao.codigo || acao.procedimento_codigo,
          quantidade: acao.quantidade,
          data: acao.data || acao.data_realizacao,
          cbo: acao.cbo,
          cns: acao.cns,
          local: acao.local || acao.local_acao || 'CAPS',
          profissional_id: acao.profissional_id
        });
        return acc;
      }, {});

      const listaFichas = (fichasRes.data || []).map(f => ({
        id: f.id,
        paciente_id: Number(f.paciente_id),
        mes_atendimento: f.mes_atendimento,
        acoes: acoesPorFicha[Number(f.id)] || []
      }));

      setFichas(listaFichas);
    } catch (err) {
      console.error('Erro inesperado ao sincronizar com o Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // --- PACIENTES ---
  const addPaciente = async (pacienteData) => {
    try {
      const { id, ...dadosLimpos } = pacienteData;
      const { data, error } = await supabase.from('pacientes').insert([dadosLimpos]).select();
      if (error) {
        alert('Erro ao salvar paciente no Supabase: ' + error.message);
        return null;
      }
      if (data && data[0]) {
        setPacientes(prev => [...prev, data[0]]);
        return data[0];
      }
    } catch (err) {
      console.error('Erro ao adicionar paciente:', err);
    }
  };

  const updatePaciente = async (id, pacienteData) => {
    try {
      const { id: _id, created_at: _created, ...dadosLimpos } = pacienteData;
      const { data, error } = await supabase
        .from('pacientes')
        .update(dadosLimpos)
        .eq('id', id)
        .select();

      if (error) {
        alert('Erro ao atualizar paciente no Supabase: ' + error.message);
        return;
      }
      if (data && data[0]) {
        setPacientes(prev => prev.map(p => Number(p.id) === Number(id) ? data[0] : p));
      }
    } catch (err) {
      console.error('Erro ao atualizar paciente:', err);
    }
  };

  const deletePaciente = async (id) => {
    try {
      const pId = Number(id);
      const { error } = await supabase.from('pacientes').delete().eq('id', pId);
      if (error) {
        alert('Erro ao excluir paciente no Supabase: ' + error.message);
        return;
      }
      setPacientes(prev => prev.filter(p => Number(p.id) !== pId));
      setFichas(prev => prev.filter(f => Number(f.paciente_id) !== pId));
    } catch (err) {
      console.error('Erro ao excluir paciente:', err);
    }
  };

  // --- PROFISSIONAIS ---
  const addProfissional = async (profData) => {
    try {
      const { id, ...dadosLimpos } = profData;
      const { data, error } = await supabase.from('profissionais').insert([dadosLimpos]).select();
      if (error) {
        alert('Erro ao cadastrar profissional no Supabase: ' + error.message);
        return null;
      }
      if (data && data[0]) {
        setProfissionais(prev => [...prev, data[0]]);
        return data[0];
      }
    } catch (err) {
      console.error('Erro ao cadastrar profissional:', err);
    }
  };

  const updateProfissional = async (id, profData) => {
    try {
      const { id: _id, created_at: _created, ...dadosLimpos } = profData;
      const { data, error } = await supabase
        .from('profissionais')
        .update(dadosLimpos)
        .eq('id', id)
        .select();

      if (error) {
        alert('Erro ao atualizar profissional no Supabase: ' + error.message);
        return;
      }
      if (data && data[0]) {
        setProfissionais(prev => prev.map(p => Number(p.id) === Number(id) ? data[0] : p));
      }
    } catch (err) {
      console.error('Erro ao atualizar profissional:', err);
    }
  };

  const deleteProfissional = async (id) => {
    try {
      const { error } = await supabase.from('profissionais').delete().eq('id', id);
      if (error) {
        alert('Erro ao excluir profissional no Supabase: ' + error.message);
        return;
      }
      setProfissionais(prev => prev.filter(p => Number(p.id) !== Number(id)));
    } catch (err) {
      console.error('Erro ao excluir profissional:', err);
    }
  };

  // --- PROCEDIMENTOS ---
  const addProcedimento = async (procData) => {
    try {
      const { id, ...dadosLimpos } = procData;
      const { data, error } = await supabase.from('procedimentos').insert([dadosLimpos]).select();
      if (error) {
        alert('Erro ao cadastrar procedimento no Supabase: ' + error.message);
        return null;
      }
      if (data && data[0]) {
        setProcedimentos(prev => [...prev, data[0]]);
        return data[0];
      }
    } catch (err) {
      console.error('Erro ao cadastrar procedimento:', err);
    }
  };

  const updateProcedimento = async (id, procData) => {
    try {
      const { id: _id, created_at: _created, ...dadosLimpos } = procData;
      const { data, error } = await supabase
        .from('procedimentos')
        .update(dadosLimpos)
        .eq('id', id)
        .select();

      if (error) {
        alert('Erro ao atualizar procedimento no Supabase: ' + error.message);
        return;
      }
      if (data && data[0]) {
        setProcedimentos(prev => prev.map(p => Number(p.id) === Number(id) ? data[0] : p));
      }
    } catch (err) {
      console.error('Erro ao atualizar procedimento:', err);
    }
  };

  const deleteProcedimento = async (id) => {
    try {
      const { error } = await supabase.from('procedimentos').delete().eq('id', id);
      if (error) {
        alert('Erro ao excluir procedimento no Supabase: ' + error.message);
        return;
      }
      setProcedimentos(prev => prev.filter(p => Number(p.id) !== Number(id)));
    } catch (err) {
      console.error('Erro ao excluir procedimento:', err);
    }
  };

  // --- FICHAS E AÇÕES ---
  const lancarAcaoIndividual = async (pacienteId, mes, acao) => {
    try {
      const pId = Number(pacienteId);
      
      // 1. Localiza ou cria a ficha mensal para o paciente no mês
      let fichaId = null;
      const fichaExistente = fichas.find(f => Number(f.paciente_id) === pId && f.mes_atendimento === mes);

      if (fichaExistente) {
        fichaId = fichaExistente.id;
      } else {
        const { data: novaFichaData, error: errFicha } = await supabase
          .from('fichas_mensais')
          .insert([{ paciente_id: pId, mes_atendimento: mes }])
          .select();

        if (errFicha) {
          alert('Erro ao criar ficha mensal no Supabase: ' + errFicha.message);
          return;
        }
        fichaId = novaFichaData[0].id;
      }

      // 2. Insere a ação realizada vinculada à ficha
      const { data: acaoSalva, error: errAcao } = await supabase
        .from('acoes_realizadas')
        .insert([{
          ficha_id: fichaId,
          codigo: acao.codigo,
          quantidade: parseInt(acao.quantidade, 10) || 1,
          data: acao.data,
          cbo: acao.cbo,
          cns: acao.cns,
          local: acao.local || 'CAPS',
          profissional_id: acao.profissional_id ? Number(acao.profissional_id) : null
        }])
        .select();

      if (errAcao) {
        alert('Erro ao gravar ação realizada no Supabase: ' + errAcao.message);
        return;
      }

      const novaAcaoObj = {
        id: acaoSalva[0].id,
        codigo: acaoSalva[0].codigo,
        quantidade: acaoSalva[0].quantidade,
        data: acaoSalva[0].data,
        cbo: acaoSalva[0].cbo,
        cns: acaoSalva[0].cns,
        local: acaoSalva[0].local,
        profissional_id: acaoSalva[0].profissional_id
      };

      setFichas(prevFichas => {
        const exists = prevFichas.find(f => Number(f.id) === Number(fichaId));
        if (exists) {
          return prevFichas.map(f => Number(f.id) === Number(fichaId)
            ? { ...f, acoes: [...f.acoes, novaAcaoObj] }
            : f
          );
        } else {
          return [...prevFichas, {
            id: fichaId,
            paciente_id: pId,
            mes_atendimento: mes,
            acoes: [novaAcaoObj]
          }];
        }
      });
    } catch (err) {
      console.error('Erro ao lançar ação individual:', err);
    }
  };

  const lancarAcaoMassa = async (pacientesIds, mes, acao) => {
    try {
      for (const idRaw of pacientesIds) {
        await lancarAcaoIndividual(idRaw, mes, acao);
      }
    } catch (err) {
      console.error('Erro no lançamento em massa:', err);
    }
  };

  const deleteFicha = async (fichaId) => {
    try {
      const fId = Number(fichaId);
      const { error } = await supabase.from('fichas_mensais').delete().eq('id', fId);
      if (error) {
        alert('Erro ao excluir ficha no Supabase: ' + error.message);
        return;
      }
      setFichas(prev => prev.filter(f => Number(f.id) !== fId));
    } catch (err) {
      console.error('Erro ao excluir ficha:', err);
    }
  };

  const deleteAcao = async (fichaId, acaoId) => {
    try {
      const aId = Number(acaoId);
      const { error } = await supabase.from('acoes_realizadas').delete().eq('id', aId);
      if (error) {
        alert('Erro ao excluir ação no Supabase: ' + error.message);
        return;
      }
      setFichas(prev => prev.map(f => {
        if (Number(f.id) === Number(fichaId)) {
          return {
            ...f,
            acoes: f.acoes.filter(a => Number(a.id) !== aId)
          };
        }
        return f;
      }));
    } catch (err) {
      console.error('Erro ao excluir ação:', err);
    }
  };

  const updateAcao = async (fichaId, acaoId, novaAcaoData) => {
    try {
      const aId = Number(acaoId);
      const payload = {
        codigo: novaAcaoData.codigo,
        quantidade: parseInt(novaAcaoData.quantidade, 10) || 1,
        data: novaAcaoData.data,
        cbo: novaAcaoData.cbo,
        cns: novaAcaoData.cns,
        local: novaAcaoData.local || 'CAPS',
        profissional_id: novaAcaoData.profissional_id ? Number(novaAcaoData.profissional_id) : null
      };

      const { data, error } = await supabase
        .from('acoes_realizadas')
        .update(payload)
        .eq('id', aId)
        .select();

      if (error) {
        alert('Erro ao atualizar ação no Supabase: ' + error.message);
        return;
      }

      if (data && data[0]) {
        setFichas(prev => prev.map(f => {
          if (Number(f.id) === Number(fichaId)) {
            return {
              ...f,
              acoes: f.acoes.map(a => Number(a.id) === aId ? { ...a, ...data[0] } : a)
            };
          }
          return f;
        }));
      }
    } catch (err) {
      console.error('Erro ao atualizar ação:', err);
    }
  };

  return (
    <AppContext.Provider value={{
      pacientes,
      profissionais,
      procedimentos,
      fichas,
      loading,
      carregarDados,
      addPaciente,
      updatePaciente,
      deletePaciente,
      addProfissional,
      updateProfissional,
      deleteProfissional,
      addProcedimento,
      updateProcedimento,
      deleteProcedimento,
      lancarAcaoIndividual,
      lancarAcaoMassa,
      deleteFicha,
      deleteAcao,
      updateAcao
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
