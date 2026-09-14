import React from 'react';
import { sortAcoesByData } from '../utils/dates';
import './FichaPrint.css';

export default function FichaPrintView({ paciente, acoes, mesAtendimento }) {
  const ACTIONS_PER_PAGE = 25;
  const acoesOrdenadas = sortAcoesByData(acoes);
  
  const formatDateToBR = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('/')) return dateStr;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Calcular totais por código de procedimento considerando TODAS as ações da ficha
  const totaisPorCodigo = acoesOrdenadas
    .filter(a => a.codigo)
    .reduce((acc, acao) => {
      const qtd = parseInt(acao.quantidade, 10) || 0;
      acc[acao.codigo] = (acc[acao.codigo] || 0) + qtd;
      return acc;
    }, {});
  const resumoProcedimentos = Object.entries(totaisPorCodigo);

  const pages = [];
  for (let i = 0; i < acoesOrdenadas.length; i += ACTIONS_PER_PAGE) {
    const pageActions = acoesOrdenadas.slice(i, i + ACTIONS_PER_PAGE);
    while (pageActions.length < ACTIONS_PER_PAGE) {
      pageActions.push({ id: `empty-${pageActions.length}-${i}` });
    }
    pages.push(pageActions);
  }

  if (pages.length === 0) {
    const emptyPage = [];
    for (let i = 0; i < ACTIONS_PER_PAGE; i++) {
      emptyPage.push({ id: `empty-${i}` });
    }
    pages.push(emptyPage);
  }

  return (
    <div className="print-container">
      {pages.map((pageActions, pageIndex) => {
        const isLastPage = pageIndex === pages.length - 1;

        return (
        <div className="a4-page" key={pageIndex}>
          <div className="raas-header">
            <h2 className="raas-title">RAAS REGISTRO DAS AÇÕES AMBULATORIAIS DE SAÚDE</h2>
            <h3 className="raas-subtitle">FORMULÁRIO DA ATENÇÃO PSICOSSOCIAL NO CAPS</h3>
            
            <div className="raas-section-title">IDENTIFICAÇÃO DO ESTABELECIMENTO DE SAÚDE</div>
            <div className="flex justify-between raas-row">
              <div className="raas-cell flex-1" style={{ borderRight: '2px solid #000' }}>CAPS</div>
              <div className="raas-cell" style={{ width: '250px' }}>CNES: 5057485</div>
            </div>

            <div className="raas-section-title">IDENTIFICAÇÃO DO USUÁRIO DO SUS</div>
            <div className="flex raas-row">
              <div className="raas-cell raas-label">Nome do Paciente:</div>
              <div className="raas-cell flex-1 font-bold" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{paciente.nome}</div>
              {paciente.cpf && (
                <>
                  <div className="raas-cell raas-label" style={{ borderLeft: '1px solid #000', width: '40px', flexShrink: 0 }}>CPF:</div>
                  <div className="raas-cell font-bold" style={{ width: '120px', flexShrink: 0 }}>{paciente.cpf}</div>
                </>
              )}
            </div>
            
            <div className="flex raas-row">
              <div className="raas-cell raas-label">Cartão do SUS:</div>
              <div className="raas-cell font-bold" style={{ width: '32%' }}>{paciente.cartao_sus}</div>
              <div className="raas-cell raas-label" style={{ borderLeft: '1px solid #000' }}>Sexo:</div>
              <div className="raas-cell font-bold" style={{ width: '10%' }}>{paciente.sexo}</div>
              <div className="raas-cell raas-label" style={{ borderLeft: '1px solid #000' }}>Data Nasc.:</div>
              <div className="raas-cell flex-1 font-bold">{paciente.data_nascimento}</div>
            </div>

            <div className="flex raas-row">
              <div className="raas-cell raas-label">Nome da Mãe:</div>
              <div className="raas-cell flex-1">{paciente.nome_mae}</div>
            </div>
            
            <div className="flex raas-row">
              <div className="raas-cell raas-label">Telefone:</div>
              <div className="raas-cell" style={{ width: '32%' }}>{paciente.telefone}</div>
              <div className="raas-cell raas-label" style={{ borderLeft: '1px solid #000' }}>Endereço:</div>
              <div className="raas-cell flex-1">{paciente.endereco}</div>
            </div>

            <div className="raas-section-title">DADOS DO ATENDIMENTO</div>
            <div className="flex raas-row" style={{ borderBottom: 'none' }}>
              <div className="raas-cell raas-label">Data de Admissão:</div>
              <div className="raas-cell font-bold" style={{ width: '30%' }}>{paciente.data_admissao}</div>
              <div className="raas-cell raas-label" style={{ borderLeft: '1px solid #000' }}>Mês Atendimento:</div>
              <div className="raas-cell flex-1 font-bold">{mesAtendimento}</div>
            </div>
            
            <div className="flex raas-row" style={{ borderBottom: 'none', borderTop: '1px solid #000' }}>
              <div className="raas-cell raas-label">CID-10 Principal:</div>
              <div className="raas-cell flex-1 font-bold">{paciente.cid_principal}</div>
            </div>
            <div className="flex raas-row" style={{ borderTop: '1px solid #000' }}>
              <div className="raas-cell raas-label">CID-10 Causas ASS.:</div>
              <div className="raas-cell flex-1">{paciente.cid_associado}</div>
            </div>
            
            <div className="raas-section-title">AÇÕES REALIZADAS</div>
          </div>

          <div className="raas-actions-table">
            <div className="raas-actions-header">
              <div className="action-col-codigo">Código da Ação Realizada</div>
              <div className="action-col-qtd">Qtd.</div>
              <div className="action-col-data">Data</div>
              <div className="action-col-cbo">CBO Executante</div>
              <div className="action-col-cns">CNS Profissional Executante</div>
              <div className="action-col-local">Local (CAPS/Território)</div>
            </div>
            
            {pageActions.map((acao, index) => (
              <div className="raas-actions-row" key={acao.id || index}>
                <div className="action-col-codigo font-bold">{acao.codigo || ''}</div>
                <div className="action-col-qtd">{acao.quantidade || ''}</div>
                <div className="action-col-data">{formatDateToBR(acao.data)}</div>
                <div className="action-col-cbo">{acao.cbo || ''}</div>
                <div className="action-col-cns">{acao.cns || ''}</div>
                <div className="action-col-local">{acao.local || ''}</div>
              </div>
            ))}
          </div>

          {/* Resumo de Totais — apenas na última página, 2 colunas se necessário */}
          {isLastPage && resumoProcedimentos.length > 0 && (
            <div className="resumo-totais">
              <div className="resumo-titulo">RESUMO — TOTAL DE PROCEDIMENTOS NA FICHA</div>
              <div className="resumo-grid">
                {resumoProcedimentos.map(([codigo, total]) => (
                  <div className="resumo-item" key={codigo}>
                    <span className="resumo-codigo">{codigo}</span>
                    <span className="resumo-separador">→</span>
                    <span className="resumo-total">{total}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="page-footer">Página {pageIndex + 1} de {pages.length}</div>
        </div>
        );
      })}
    </div>
  );
}
