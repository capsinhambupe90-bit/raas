import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [pacientes, setPacientes] = useState([
    { 
      id: 1, 
      nome: 'BALBINO GONÇALVES DE CRISTO', 
      cartao_sus: '704.5023.2231.4911',
      cpf: '000.000.000-00',
      sexo: 'M',
      data_nascimento: '30/03/1960',
      nome_mae: 'MARIA SINDRONIA GONÇALVES DE CRISTO',
      endereco: 'VOLTA DE CIMA',
      telefone: '(88) 99999-0000',
      data_admissao: '21/03/2017',
      cid_principal: 'F20.0',
      cid_associado: ''
    },
    { 
      id: 2, 
      nome: 'MARIA DA SILVA OLIVEIRA', 
      cartao_sus: '704.1234.5678.9012',
      cpf: '111.111.111-11',
      sexo: 'F',
      data_nascimento: '15/05/1975',
      nome_mae: 'ANA DA SILVA',
      endereco: 'CENTRO',
      telefone: '(88) 98888-1111',
      data_admissao: '10/01/2020',
      cid_principal: 'F32.1',
      cid_associado: ''
    },
    { 
      id: 3, 
      nome: 'JOÃO DE SOUZA', 
      cartao_sus: '704.9876.5432.1098',
      cpf: '222.222.222-22',
      sexo: 'M',
      data_nascimento: '12/10/1982',
      nome_mae: 'FRANCISCA DE SOUZA',
      endereco: 'BAIRRO NOVO',
      telefone: '(88) 97777-2222',
      data_admissao: '05/06/2021',
      cid_principal: 'F10.2',
      cid_associado: ''
    }
  ]);

  const [profissionais, setProfissionais] = useState([
    { id: 1, nome: 'Dr. João Silva', cns: '123456789012345', cbo: '225125' },
    { id: 2, nome: 'Dra. Ana Costa (Psicóloga)', cns: '987654321054321', cbo: '251510' }
  ]);

  const [procedimentos, setProcedimentos] = useState([
    { id: 1, codigo: '0301010072', observacao: 'Consulta médica em atenção especializada' },
    { id: 2, codigo: '0301010137', observacao: 'Atendimento individual em atenção especializada' },
    { id: 3, codigo: '0301010048', observacao: 'Atendimento em grupo em atenção especializada' }
  ]);

  // Fichas mensais
  const [fichas, setFichas] = useState([
    {
      id: 101,
      paciente_id: 1,
      mes_atendimento: '2026-08',
      acoes: [
        { id: 1, codigo: '0301010072', quantidade: '1', data: '03/08/2026', cbo: '225125', cns: '123456789012345', local: 'CAPS' }
      ]
    },
    {
      id: 102,
      paciente_id: 2,
      mes_atendimento: '2026-08',
      acoes: [
        { id: 2, codigo: '0301010137', quantidade: '1', data: '04/08/2026', cbo: '251510', cns: '987654321054321', local: 'CAPS' }
      ]
    },
    {
      id: 103,
      paciente_id: 3,
      mes_atendimento: '2026-08',
      acoes: [
        { id: 3, codigo: '0301010048', quantidade: '1', data: '05/08/2026', cbo: '225125', cns: '123456789012345', local: 'Território' }
      ]
    }
  ]);

  // --- PACIENTES ---
  const addPaciente = (paciente) => {
    setPacientes(prev => [...prev, { ...paciente, id: Date.now() }]);
  };

  const updatePaciente = (id, paciente) => {
    setPacientes(prev => prev.map(p => Number(p.id) === Number(id) ? { ...paciente, id: Number(id) } : p));
  };

  const deletePaciente = (id) => {
    const pId = Number(id);
    setPacientes(prev => prev.filter(p => Number(p.id) !== pId));
    setFichas(prev => prev.filter(f => Number(f.paciente_id) !== pId));
  };

  // --- PROFISSIONAIS ---
  const addProfissional = (prof) => {
    setProfissionais(prev => [...prev, { ...prof, id: Date.now() }]);
  };

  const updateProfissional = (id, prof) => {
    setProfissionais(prev => prev.map(p => Number(p.id) === Number(id) ? { ...prof, id: Number(id) } : p));
  };

  const deleteProfissional = (id) => {
    setProfissionais(prev => prev.filter(p => Number(p.id) !== Number(id)));
  };

  // --- PROCEDIMENTOS ---
  const addProcedimento = (proc) => {
    setProcedimentos(prev => [...prev, { ...proc, id: Date.now() }]);
  };

  const updateProcedimento = (id, proc) => {
    setProcedimentos(prev => prev.map(p => Number(p.id) === Number(id) ? { ...proc, id: Number(id) } : p));
  };

  const deleteProcedimento = (id) => {
    setProcedimentos(prev => prev.filter(p => Number(p.id) !== Number(id)));
  };

  // --- FICHAS E AÇÕES ---
  const lancarAcaoIndividual = (pacienteId, mes, acao) => {
    const pId = Number(pacienteId);
    setFichas(prevFichas => {
      const fichaExistente = prevFichas.find(f => Number(f.paciente_id) === pId && f.mes_atendimento === mes);
      if (fichaExistente) {
        return prevFichas.map(f => f.id === fichaExistente.id ? { ...f, acoes: [...f.acoes, { ...acao, id: Date.now() }] } : f);
      } else {
        return [...prevFichas, { id: Date.now(), paciente_id: pId, mes_atendimento: mes, acoes: [{ ...acao, id: Date.now() }] }];
      }
    });
  };

  const lancarAcaoMassa = (pacientesIds, mes, acao) => {
    setFichas(prevFichas => {
      let novasFichas = [...prevFichas];
      pacientesIds.forEach(idRaw => {
        const pId = Number(idRaw);
        const idx = novasFichas.findIndex(f => Number(f.paciente_id) === pId && f.mes_atendimento === mes);
        if (idx >= 0) {
          novasFichas[idx] = {
            ...novasFichas[idx],
            acoes: [...novasFichas[idx].acoes, { ...acao, id: Date.now() + Math.random() }]
          };
        } else {
          novasFichas.push({
            id: Date.now() + Math.random(),
            paciente_id: pId,
            mes_atendimento: mes,
            acoes: [{ ...acao, id: Date.now() + Math.random() }]
          });
        }
      });
      return novasFichas;
    });
  };

  const deleteFicha = (fichaId) => {
    setFichas(prev => prev.filter(f => Number(f.id) !== Number(fichaId)));
  };

  const deleteAcao = (fichaId, acaoId) => {
    setFichas(prev => prev.map(f => {
      if (Number(f.id) === Number(fichaId)) {
        return {
          ...f,
          acoes: f.acoes.filter(a => Number(a.id) !== Number(acaoId))
        };
      }
      return f;
    }));
  };

  const updateAcao = (fichaId, acaoId, novaAcaoData) => {
    setFichas(prev => prev.map(f => {
      if (Number(f.id) === Number(fichaId)) {
        return {
          ...f,
          acoes: f.acoes.map(a => Number(a.id) === Number(acaoId) ? { ...novaAcaoData, id: Number(acaoId) } : a)
        };
      }
      return f;
    }));
  };

  return (
    <AppContext.Provider value={{
      pacientes,
      profissionais,
      procedimentos,
      fichas,
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
