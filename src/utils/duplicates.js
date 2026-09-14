import { normalizeText } from './text';

export function onlyDigits(value) {
  return String(value ?? '').replace(/\D/g, '');
}

const CAMPOS_COMPARACAO = [
  { key: 'nome', label: 'Nome' },
  { key: 'cartao_sus', label: 'Cartão SUS' },
  { key: 'cpf', label: 'CPF' },
  { key: 'data_nascimento', label: 'Data de Nascimento' },
  { key: 'nome_mae', label: 'Nome da Mãe' },
  { key: 'sexo', label: 'Sexo' },
  { key: 'data_admissao', label: 'Data de Admissão' },
  { key: 'endereco', label: 'Endereço' },
  { key: 'telefone', label: 'Telefone' },
  { key: 'cid_principal', label: 'CID Principal' },
  { key: 'cid_associado', label: 'CID Associado' }
];

export { CAMPOS_COMPARACAO };

function buildKeys(paciente) {
  const keys = [];
  const sus = onlyDigits(paciente.cartao_sus);
  if (sus) keys.push({ key: `sus:${sus}`, label: 'Cartão SUS' });

  const cpf = onlyDigits(paciente.cpf);
  if (cpf.length === 11) keys.push({ key: `cpf:${cpf}`, label: 'CPF' });

  const nome = normalizeText(paciente.nome).replace(/\s+/g, ' ');
  const nasc = onlyDigits(paciente.data_nascimento);
  if (nome && nasc) keys.push({ key: `nn:${nome}|${nasc}`, label: 'Nome + Nascimento' });

  return keys;
}

export function findDuplicateGroups(pacientes) {
  const list = pacientes || [];
  const parent = new Map(list.map(p => [p.id, p.id]));

  const find = (id) => {
    let root = id;
    while (parent.get(root) !== root) root = parent.get(root);
    while (parent.get(id) !== root) {
      const next = parent.get(id);
      parent.set(id, root);
      id = next;
    }
    return root;
  };

  const union = (a, b) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  };

  const keyOwner = new Map();
  for (const paciente of list) {
    for (const { key } of buildKeys(paciente)) {
      if (keyOwner.has(key)) {
        union(paciente.id, keyOwner.get(key));
      } else {
        keyOwner.set(key, paciente.id);
      }
    }
  }

  const groupsMap = new Map();
  for (const paciente of list) {
    const root = find(paciente.id);
    if (!groupsMap.has(root)) groupsMap.set(root, []);
    groupsMap.get(root).push(paciente);
  }

  const groups = [];
  for (const [root, members] of groupsMap) {
    if (members.length < 2) continue;

    const seenKeys = new Map();
    const motivos = new Set();
    for (const paciente of members) {
      for (const { key, label } of buildKeys(paciente)) {
        if (seenKeys.has(key) && seenKeys.get(key) !== paciente.id) {
          motivos.add(label);
        } else {
          seenKeys.set(key, paciente.id);
        }
      }
    }

    groups.push({ id: root, pacientes: members, motivos: [...motivos] });
  }

  return groups;
}

export function getProducao(pacienteId, fichas) {
  const pId = Number(pacienteId);
  const doPaciente = (fichas || []).filter(f => Number(f.paciente_id) === pId);
  const totalAcoes = doPaciente.reduce((acc, f) => acc + (f.acoes?.length || 0), 0);
  return { fichas: doPaciente.length, acoes: totalAcoes };
}

export function escolherPrincipal(pacientes, fichas) {
  return [...pacientes].sort((a, b) => {
    const pa = getProducao(a.id, fichas);
    const pb = getProducao(b.id, fichas);
    const prodA = pa.fichas + pa.acoes;
    const prodB = pb.fichas + pb.acoes;
    if (prodA !== prodB) return prodB - prodA;
    return Number(a.id) - Number(b.id);
  })[0];
}

export function valoresDiferem(valorA, valorB) {
  return onlyDigits(valorA) !== onlyDigits(valorB) && normalizeText(valorA) !== normalizeText(valorB);
}
