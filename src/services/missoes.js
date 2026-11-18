// src/services/missoes.js
// Comunicação do painel administrativo com a API VibeEco.

// ==========================================
// CONFIGURAÇÃO DA API
// ==========================================

export const BASE = (
  import.meta.env.VITE_API_URL ||
  'http://localhost:8080/v1/vibeEco/administrador'
).replace(/\/+$/, '')

const URL_MISSAO = `${BASE}/missao`

console.log('[VIBEECO] URL BASE DA API:', BASE)

// ==========================================
// COMUNICAÇÃO COM A API
// ==========================================

export async function requisitar(url, opcoes = {}) {
  const token = localStorage.getItem('vibeeco_token')

  const headers = {
    Accept: 'application/json',
    ...opcoes.headers
  }

  const ehFormData =
    typeof FormData !== 'undefined' &&
    opcoes.body instanceof FormData

  if (opcoes.body && !ehFormData) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers['x-access-token'] = token
    headers['Authorization'] = `Bearer ${token}`
  }

  console.log('[VIBEECO] Requisição:', {
    url,
    metodo: opcoes.method || 'GET'
  })

  let resp

  try {
    resp = await fetch(url, {
      ...opcoes,
      headers
    })
  } catch (erro) {
    console.error('[VIBEECO] Erro de conexão:', erro)

    const erroAPI = new Error(
      'Não foi possível conectar à API. Verifique se o servidor está ligado.'
    )

    erroAPI.status = 0
    throw erroAPI
  }

  let corpo = null

  const texto = await resp.text()

  if (texto) {
    try {
      corpo = JSON.parse(texto)
    } catch {
      corpo = { message: texto }
    }
  }

  console.log('[VIBEECO] Resposta da API:', {
    url,
    status: resp.status,
    corpo
  })

  if (!resp.ok) {
    if (resp.status === 401 && token) {
      localStorage.removeItem('vibeeco_token')
      localStorage.removeItem('vibeeco_user')

      window.dispatchEvent(
        new CustomEvent('vibeeco:sessao-expirada')
      )
    }

    const mensagem =
      corpo?.message ||
      corpo?.mensagem ||
      'Erro ao comunicar com o servidor.'

    const campo = corpo?.field ? ` ${corpo.field}` : ''

    const erroAPI = new Error(mensagem + campo)

    erroAPI.status = resp.status
    erroAPI.response = corpo

    throw erroAPI
  }

  return corpo
}

// ==========================================
// CONFIGURAÇÕES DE MISSÕES
// ==========================================

export const ID_DIFICULDADE = {
  Fácil: 1,
  Médio: 2,
  Difícil: 3
}

export const ID_CATEGORIA = {
  Reciclagem: 1,
  Energia: 2,
  Água: 3,
  Mobilidade: 4,
  Alimentação: 5
}

// ==========================================
// MANIPULAÇÃO DE DATAS
// ==========================================

export const dia = (valor) => String(valor).slice(0, 10)

export function diasEntre(inicio, termino) {
  const dataInicio = new Date(
    dia(inicio) + 'T00:00:00'
  )

  const dataTermino = new Date(
    dia(termino) + 'T00:00:00'
  )

  const ms = dataTermino - dataInicio

  if (Number.isNaN(ms)) return 1

  return Math.max(1, Math.round(ms / 86400000))
}

export function somarDias(data, quantidade) {
  const d = new Date(dia(data) + 'T00:00:00')

  d.setDate(d.getDate() + Number(quantidade))

  const p = (n) => String(n).padStart(2, '0')

  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function hojeLocal() {
  const d = new Date()

  const p = (n) => String(n).padStart(2, '0')

  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

// ==========================================
// CONVERSÃO DA API PARA A TELA
// ==========================================

// A API devolve "categoria" como array [{ id, nome }] no listar/buscar.
// A tela espera uma string simples, então extraímos o nome do primeiro item.
function extrairNomeCategoria(valor) {
  if (!valor) return ''

  if (Array.isArray(valor)) {
    const primeiro = valor[0]
    if (!primeiro) return ''
    return typeof primeiro === 'string'
      ? primeiro
      : (primeiro.nome || '')
  }

  if (typeof valor === 'object') return valor.nome || ''

  return String(valor)
}

function deApi(m) {
  // O controller devolve as etapas em "missao.etapa" (singular).
  // Aceitamos "etapa" e "etapas" para manter compatibilidade.
  const listaEtapas = m.etapa || m.etapas || []

  const etapas = listaEtapas.map((e) => ({
    id: e.id,
    titulo: e.titulo,
    xp: Number(e.xp)
  }))

  return {
    id: m.id,
    titulo: m.nome,
    objetivo: m.descricao || '',
    dica: m.dica || '',
    categoria: extrairNomeCategoria(m.categoria),
    dificuldade: m.dificuldade || '',
    duracao: diasEntre(m.data_inicio, m.data_termino),
    xp: Number(m.total_xp_missao),
    moedas: Number(m.coins),
    etapas,
    tipo: 'Individual',
    data_inicio: dia(m.data_inicio)
  }
}

// ==========================================
// CONVERSÃO DA TELA PARA A API
// ==========================================

function paraApi(d) {
  const inicio = d.data_inicio || hojeLocal()

  const etapas = (d.etapas || []).map((e) => ({
    ...(e.id ? { id: e.id } : {}),
    titulo: String(e.titulo || '').trim(),
    xp: Number(e.xp)
  }))

  return {
    nome: String(d.titulo || '').trim(),
    descricao: String(d.objetivo || '').trim(),
    dica: String(d.dica || '').trim() || null,
    id_dificuldade: ID_DIFICULDADE[d.dificuldade],
    id_categoria: ID_CATEGORIA[d.categoria] || null,
    coins: Number(d.moedas) || 0,
    total_xp_missao: etapas.reduce(
      (soma, etapa) => soma + etapa.xp,
      0
    ),
    data_inicio: inicio,
    data_termino: somarDias(inicio, d.duracao),
    etapas
  }
}

// ==========================================
// SERVIÇOS DE MISSÕES
// ==========================================

export async function listarMissoes() {
  const resposta = await requisitar(URL_MISSAO)

  return (resposta?.response?.missao || []).map(deApi)
}

export async function criarMissao(dados) {
  return await requisitar(URL_MISSAO, {
    method: 'POST',
    body: JSON.stringify(paraApi(dados))
  })
}

export async function atualizarMissao(id, dados) {
  return await requisitar(`${URL_MISSAO}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(paraApi(dados))
  })
}

export async function excluirMissao(id) {
  return await requisitar(`${URL_MISSAO}/${id}`, {
    method: 'DELETE'
  })
}