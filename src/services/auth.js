import { BASE, requisitar } from '@/services/missoes'

const CHAVE = 'vibeeco_token'
const CHAVE_USER = 'vibeeco_user'
const CHAVE_RECUPERA_EMAIL = 'vibeeco_recupera_email'
const CHAVE_RECUPERA_CODIGO = 'vibeeco_recupera_codigo'

export function estaLogado() {
  return !!localStorage.getItem(CHAVE)
}

export function obterToken() {
  return localStorage.getItem(CHAVE)
}

export function obterUsuario() {
  const dados = localStorage.getItem(CHAVE_USER)
  try {
    return dados ? JSON.parse(dados) : null
  } catch {
    return null
  }
}

export async function entrar(login, senha) {
  if (!login?.trim() || !senha) throw new Error('Informe o login e a senha.')

  const corpo = await requisitar(`${BASE}/usuarioADM/login`, {
    method: 'POST',
    body: JSON.stringify({ email: login.trim(), senha })
  })

  const adm = corpo?.response?.usuarioADM?.[0]
  const token = adm?.token

  if (!token) {
    throw new Error('Falha na autenticação: token não retornado.')
  }

  localStorage.setItem(CHAVE, token)
  localStorage.setItem(CHAVE_USER, JSON.stringify(adm))
  return adm
}

export function sair() {
  localStorage.removeItem(CHAVE)
  localStorage.removeItem(CHAVE_USER)
}

// ==========================================
// RECUPERAÇÃO DE SENHA REAL
// ==========================================

export function obterEmailRecuperacao() {
  return sessionStorage.getItem(CHAVE_RECUPERA_EMAIL) || ''
}

export function obterCodigoRecuperacao() {
  return sessionStorage.getItem(CHAVE_RECUPERA_CODIGO) || ''
}

export async function solicitarRecuperacao(email) {
  const emailLimpo = String(email || '').trim().toLowerCase()
  if (!emailLimpo) throw new Error('Informe o e-mail cadastrado.')

  const corpo = await requisitar(`${BASE}/usuarioADM/recuperarAcesso`, {
    method: 'POST',
    body: JSON.stringify({ email: emailLimpo })
  })

  sessionStorage.setItem(CHAVE_RECUPERA_EMAIL, emailLimpo)
  return corpo
}

export async function validarCodigo(email, codigo) {
  const emailLimpo = String(email || obterEmailRecuperacao()).trim().toLowerCase()
  const codigoLimpo = String(codigo || '').trim()

  if (!emailLimpo || !codigoLimpo) {
    throw new Error('Informe o e-mail e o código de verificação.')
  }

  const corpo = await requisitar(`${BASE}/usuarioADM/validarCodigo`, {
    method: 'POST',
    body: JSON.stringify({ email: emailLimpo, codigo: codigoLimpo })
  })

  sessionStorage.setItem(CHAVE_RECUPERA_CODIGO, codigoLimpo)
  return corpo
}

export async function redefinirSenhaComCodigo(email, codigo, novaSenha) {
  const emailLimpo = String(email || obterEmailRecuperacao()).trim().toLowerCase()
  const codigoLimpo = String(codigo || obterCodigoRecuperacao()).trim()

  if (!emailLimpo || !codigoLimpo) {
    throw new Error('Sessão de recuperação expirada. Solicite um novo código.')
  }
  if (!novaSenha || novaSenha.length < 8) {
    throw new Error('A nova senha deve ter no mínimo 8 caracteres.')
  }

  const corpo = await requisitar(`${BASE}/usuarioADM/redefinirSenha`, {
    method: 'POST',
    body: JSON.stringify({ email: emailLimpo, codigo: codigoLimpo, novaSenha })
  })

  sessionStorage.removeItem(CHAVE_RECUPERA_EMAIL)
  sessionStorage.removeItem(CHAVE_RECUPERA_CODIGO)
  return corpo
}
