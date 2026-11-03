// src/services/missoes.js
// Comunicação do painel adm com a API de missões (back-end Node/Express).
// Defina VITE_API_URL no .env do front, ex.: VITE_API_URL=http://localhost:8080/v1/vibeEco/administrador
// Helpers (BASE, requisitar, dia, diasEntre, somarDias, hojeLocal) são exportados para o services/desafios.js reutilizar.
export const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080/v1/vibeEco/administrador').replace(/\/$/, '')
const URL_MISSAO = `${BASE}/missao`

export async function requisitar(url, opcoes = {}) {
  let resp
  try {
    resp = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...opcoes,
    })
  } catch {
    // fetch só lança erro quando nem chegou ao servidor (API desligada, URL errada, CORS)
    const erro = new Error('Não foi possível conectar à API. Verifique se o servidor está ligado.')
    erro.status = 0
    throw erro
  }

  let corpo = null
  try {
    corpo = await resp.json()
  } catch {
    // resposta sem corpo
  }
  if (!resp.ok) {
    const campo = corpo?.field ? ` ${corpo.field}` : ''
    const erro = new Error((corpo?.message || 'Erro ao comunicar com o servidor.') + campo)
    erro.status = resp.status
    throw erro
  }
  return corpo
}

// IDs que precisam bater com o banco (rode o 1-sql/seeds_missoes.sql, que cria exatamente estes ids)
export const ID_DIFICULDADE = { Fácil: 1, Médio: 2, Difícil: 3 }
export const ID_CATEGORIA = { Reciclagem: 1, Energia: 2, Água: 3, Mobilidade: 4, Alimentação: 5 }

export const dia = (v) => String(v).slice(0, 10) // 'YYYY-MM-DD'

export function diasEntre(inicio, termino) {
  const ms = new Date(dia(termino) + 'T00:00:00') - new Date(dia(inicio) + 'T00:00:00')
  return Math.max(1, Math.round(ms / 86400000))
}

export function somarDias(data, dias) {
  const d = new Date(dia(data) + 'T00:00:00')
  d.setDate(d.getDate() + Number(dias))
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function hojeLocal() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

// API -> formato usado pela tela
function deApi(m) {
  const etapas = (m.etapas || []).map((e) => ({ id: e.id, titulo: e.titulo, xp: Number(e.xp) }))
  return {
    id: m.id,
    titulo: m.nome,
    objetivo: m.descricao || '',
    dica: m.dica || '',
    categoria: m.categoria || '',
    dificuldade: m.dificuldade || '',
    duracao: diasEntre(m.data_inicio, m.data_termino),
    xp: Number(m.total_xp_missao),
    moedas: Number(m.coins),
    etapas,
    tipo: 'Individual',
    data_inicio: dia(m.data_inicio),
  }
}

// tela -> formato esperado pela API (o XP total é a soma das etapas; o back-end também recalcula)
function paraApi(d) {
  const inicio = d.data_inicio || hojeLocal()
  const etapas = d.etapas.map((e) => ({
    ...(e.id ? { id: e.id } : {}),
    titulo: String(e.titulo).trim(),
    xp: Number(e.xp),
  }))
  return {
    nome: String(d.titulo).trim(),
    descricao: String(d.objetivo).trim(),
    dica: String(d.dica || '').trim() || null,
    id_dificuldade: ID_DIFICULDADE[d.dificuldade],
    id_categoria: ID_CATEGORIA[d.categoria] || null,
    coins: d.moedas,
    total_xp_missao: etapas.reduce((soma, e) => soma + e.xp, 0),
    data_inicio: inicio,
    data_termino: somarDias(inicio, d.duracao),
    etapas,
  }
}

export async function listarMissoes() {
  try {
    const r = await requisitar(URL_MISSAO)
    return (r.response?.missao || []).map(deApi)
  } catch (e) {
    if (e.status === 404) return [] // 404 = nenhuma missão cadastrada
    throw e
  }
}

export async function criarMissao(dados) {
  await requisitar(URL_MISSAO, { method: 'POST', body: JSON.stringify(paraApi(dados)) })
}

export async function atualizarMissao(id, dados) {
  await requisitar(`${URL_MISSAO}/${id}`, { method: 'PUT', body: JSON.stringify(paraApi(dados)) })
}

export async function excluirMissao(id) {
  await requisitar(`${URL_MISSAO}/${id}`, { method: 'DELETE' })
}
