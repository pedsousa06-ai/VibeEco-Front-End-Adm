import { BASE, requisitar } from '@/services/missoes'

const URL_USUARIO = `${BASE}/usuario`

// O MySQL pode devolver colunas BIT/TINYINT de formas diferentes (0/1, true/false, Buffer): normaliza tudo para boolean
function paraBool(v) {
  if (v && typeof v === 'object' && Array.isArray(v.data)) return v.data[0] === 1
  if (typeof v === 'string') return v === '1' || v.toLowerCase() === 'true'
  return Boolean(v)
}

function deApi(u) {
  return {
    id: u.id,
    nome: u.nome,
    email: u.email,
    matricula: String(u.id).padStart(4, '0'),
    perfil: u.nivel_acesso || 'Participante',
    ativo: paraBool(u.status_usuario ?? true),
    dias: u.data_ultimo_acesso ? Math.max(0, Math.round((new Date() - new Date(u.data_ultimo_acesso)) / 86400000)) : 1,
  }
}

export async function listarUsuarios() {
  try {
    const r = await requisitar(URL_USUARIO)
    return (r.response?.usuario || []).map(deApi)
  } catch (e) {
    if (e.status === 404) return [] // a API responde 404 quando não há nenhum usuário
    throw e
  }
}

// Perfis (níveis de acesso) vindos do banco: [{ id, nivel }]
export async function listarPerfis() {
  try {
    const r = await requisitar(`${URL_USUARIO}/perfis`)
    return r.response?.perfis || []
  } catch (e) {
    if (e.status === 404) return []
    throw e
  }
}

export async function criarUsuario({ nome, email, senha, id_nivel_acesso }) {
  await requisitar(`${URL_USUARIO}/painel`, {
    method: 'POST',
    body: JSON.stringify({ nome, email, senha, id_nivel_acesso }),
  })
}

export async function atualizarUsuario(id, { nome, email, id_nivel_acesso }) {
  await requisitar(`${URL_USUARIO}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ nome, email, id_nivel_acesso }),
  })
}

export async function alterarStatusUsuario(id, ativo) {
  await requisitar(`${URL_USUARIO}/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ ativo }),
  })
}

export async function excluirUsuario(id) {
  await requisitar(`${URL_USUARIO}/${id}`, { method: 'DELETE' })
}
