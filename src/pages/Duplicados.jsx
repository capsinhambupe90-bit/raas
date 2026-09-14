import React, { useMemo, useState } from 'react';
import { Users, TriangleAlert, GitMerge, CircleCheckBig } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  findDuplicateGroups,
  getProducao,
  escolherPrincipal,
  valoresDiferem,
  CAMPOS_COMPARACAO
} from '../utils/duplicates';

function GrupoCard({ grupo, fichas, onUnir }) {
  const principalPadrao = useMemo(
    () => escolherPrincipal(grupo.pacientes, fichas),
    [grupo.pacientes, fichas]
  );
  const [principalId, setPrincipalId] = useState(principalPadrao?.id);
  const [unindo, setUnindo] = useState(false);

  const handleUnir = async () => {
    const principal = grupo.pacientes.find(p => Number(p.id) === Number(principalId));
    const outros = grupo.pacientes.filter(p => Number(p.id) !== Number(principalId));

    if (!principal || outros.length === 0) return;

    const nomesOutros = outros.map(p => `"${p.nome}"`).join(', ');
    const confirmar = window.confirm(
      `Unir ${nomesOutros} em "${principal.nome}"?\n\n` +
      `Todos os lançamentos (fichas e ações) dos duplicados serão movidos para o cadastro principal e os duplicados serão excluídos. ` +
      `Nenhuma produção será perdida.`
    );
    if (!confirmar) return;

    setUnindo(true);
    const ok = await onUnir(principal.id, outros.map(p => p.id));
    setUnindo(false);
    if (ok) {
      alert('Cadastros unificados com sucesso!');
    }
  };

  const haDiferenca = (campoKey) => {
    const valores = grupo.pacientes
      .map(p => p[campoKey])
      .filter(v => v !== null && v !== undefined && String(v).trim() !== '');
    const distintos = [];
    for (const v of valores) {
      if (!distintos.some(d => !valoresDiferem(d, v))) {
        distintos.push(v);
      }
    }
    return distintos.length > 1;
  };

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <div className="flex justify-between items-center mb-4" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
        <div className="flex items-center gap-2">
          <TriangleAlert size={20} color="#d97706" />
          <h3 style={{ fontWeight: 600 }}>
            {grupo.pacientes.length} cadastros possivelmente iguais
          </h3>
        </div>
        <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
          {grupo.motivos.map(motivo => (
            <span
              key={motivo}
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.25rem 0.6rem',
                borderRadius: '999px',
                backgroundColor: '#fef3c7',
                color: '#92400e'
              }}
            >
              Coincide: {motivo}
            </span>
          ))}
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '180px' }}>Campo</th>
              {grupo.pacientes.map(p => {
                const prod = getProducao(p.id, fichas);
                const isPrincipal = Number(p.id) === Number(principalId);
                return (
                  <th key={p.id} style={{ backgroundColor: isPrincipal ? '#dcfce7' : undefined, minWidth: '200px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', textTransform: 'none' }}>
                      <input
                        type="radio"
                        name={`principal-${grupo.id}`}
                        checked={isPrincipal}
                        onChange={() => setPrincipalId(p.id)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      <span style={{ fontWeight: 700 }}>{isPrincipal ? 'Manter' : 'Unir em'}</span>
                    </label>
                    <div style={{ marginTop: '0.35rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'none' }}>
                      {prod.acoes} ação(ões) · {prod.fichas} ficha(s)
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {CAMPOS_COMPARACAO.map(campo => {
              const difere = haDiferenca(campo.key);
              return (
                <tr key={campo.key}>
                  <td style={{ fontWeight: 600, color: '#334155' }}>{campo.label}</td>
                  {grupo.pacientes.map(p => {
                    const isPrincipal = Number(p.id) === Number(principalId);
                    const valor = p[campo.key];
                    return (
                      <td
                        key={p.id}
                        style={{
                          backgroundColor: isPrincipal ? '#f0fdf4' : (difere ? '#fef9c3' : undefined),
                          fontWeight: campo.key === 'nome' ? 600 : undefined
                        }}
                      >
                        {valor || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center" style={{ marginTop: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
          O cadastro marcado como <strong>Manter</strong> será preservado. Os lançamentos dos demais são transferidos para ele antes da exclusão.
        </p>
        <button className="btn btn-primary" onClick={handleUnir} disabled={unindo}>
          <GitMerge size={18} /> {unindo ? 'Unindo...' : 'Unir cadastros'}
        </button>
      </div>
    </div>
  );
}

export default function Duplicados() {
  const { pacientes, fichas, loading, unirPacientes } = useApp();

  const grupos = useMemo(
    () => findDuplicateGroups(pacientes),
    [pacientes]
  );

  if (loading) {
    return <p style={{ color: 'var(--text-muted)' }}>Carregando cadastros...</p>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Pacientes Duplicados</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          O sistema compara cartão SUS, CPF e nome + data de nascimento (ignorando acentos, maiúsculas e pontuação)
          para sugerir cadastros que podem ser o mesmo paciente.
        </p>
      </div>

      {grupos.length === 0 ? (
        <div className="card flex items-center gap-2" style={{ color: 'var(--secondary-hover)' }}>
          <CircleCheckBig size={22} />
          <span style={{ fontWeight: 600 }}>Nenhum cadastro duplicado encontrado.</span>
        </div>
      ) : (
        <>
          <div className="card flex items-center gap-2 mb-4" style={{ backgroundColor: '#fffbeb', borderColor: '#fcd34d' }}>
            <Users size={20} color="#d97706" />
            <span style={{ fontWeight: 600, color: '#92400e' }}>
              {grupos.length} grupo(s) de possíveis duplicados encontrado(s). Revise e una com segurança.
            </span>
          </div>
          {grupos.map(grupo => (
            <GrupoCard key={grupo.id} grupo={grupo} fichas={fichas} onUnir={unirPacientes} />
          ))}
        </>
      )}
    </div>
  );
}
