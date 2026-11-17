import { BASE, requisitar } from '@/services/missoes'

const URL_USUARIO = `${BASE}/usuario`

function deApi(u) {
  return {
    id: u.id,
    nome: u.nome,
    email: u.email,
    matricula: String(u.id).padStart(4, '0'),
    perfil: u.nivel_acesso || 'Participante',
    ativo: Boolean(u.status_usuario ?? true),
    dias: u.data_ultimo_acesso ? Math.max(0, Math.round((new Date() - new Date(u.data_ultimo_acesso)) / 86400000)) : 1,
  }
}

export async function listarUsuarios() {
  try {
    const r = await requisitar(URL_USUARIO)
    return (r.response?.usuario || []).map(deApi)
  } catch (e) {
    if (e.status === 404) return []
    throw e
  }
}

export async function excluirUsuario(id) {
  await requisitar(`${URL_USUARIO}/${id}`, { method: 'DELETE' })
}
