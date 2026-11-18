
import { BASE, requisitar } from '@/services/missoes'

const CHAVE = 'vibeeco_token'
const CHAVE_USER = 'vibeeco_user'
const CHAVE_EMAIL = 'vibeeco_email_recuperacao'
const CHAVE_CODIGO = 'vibeeco_codigo_recuperacao'

/* SESSÃO */

export function sair() {
  localStorage.removeItem(CHAVE)
  localStorage.removeItem(CHAVE_USER)

  sessionStorage.removeItem(CHAVE_EMAIL)
  sessionStorage.removeItem(CHAVE_CODIGO)
}

export function estaLogado() {
  return Boolean(obterToken())
}

function expiracaoDoToken(token) {
  try {
    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    )

    return payload.exp * 1000
  } catch {
    return null
  }
}

export function obterToken() {
  return localStorage.getItem(CHAVE)
}

export function obterUsuario() {
  const usuario = localStorage.getItem(CHAVE_USER)

  if (!usuario) return null

  try {
    return JSON.parse(usuario)
  } catch (error) {
    console.error('Erro ao recuperar usuário:', error)
    return null
  }
}

/* LOGIN */

export async function entrar(login, senha) {
  const email = String(login || '').trim().toLowerCase()

  if (!email || !senha) {
    throw new Error('Informe o e-mail e a senha.')
  }

  sair()

  const corpo = await requisitar(`${BASE}/usuarioADM/login`, {
    method: 'POST',
    body: JSON.stringify({ email, senha })
  })

  const adm = corpo?.response?.usuarioADM?.[0]
  const token = adm?.token

  if (!token) {
    throw new Error('A API não retornou o token de autenticação.')
  }

  const expiracao = expiracaoDoToken(token)

  if (!expiracao || expiracao <= Date.now()) {
    throw new Error('A API retornou um token inválido ou expirado.')
  }

  localStorage.setItem(CHAVE, token)
  localStorage.setItem(CHAVE_USER, JSON.stringify(adm))

  return adm
}

/* PERFIL DO ADMINISTRADOR */

export async function obterPerfil() {
  const corpo = await requisitar(`${BASE}/usuarioADM/me`, {
    method: 'GET'
  })

  const adm = corpo?.response?.usuarioADM

  if (!adm) {
    throw new Error('Não foi possível carregar o perfil do administrador.')
  }

  localStorage.setItem(CHAVE_USER, JSON.stringify(adm))

  return adm
}

export async function atualizarPerfil(email) {
  const emailNormalizado = String(email || '').trim().toLowerCase()

  if (!emailNormalizado) {
    throw new Error('Informe um e-mail válido.')
  }

  const corpo = await requisitar(`${BASE}/usuarioADM/me`, {
    method: 'PUT',
    body: JSON.stringify({
      email: emailNormalizado
    })
  })

  const adm = corpo?.response?.usuarioADM

  if (!adm) {
    throw new Error('Não foi possível atualizar o perfil.')
  }

  localStorage.setItem(CHAVE_USER, JSON.stringify(adm))

  return adm
}

/* ALTERAÇÃO DE SENHA */

export async function alterarSenha(senhaAtual, novaSenha) {
  if (!senhaAtual || !novaSenha) {
    throw new Error('Informe a senha atual e a nova senha.')
  }

  const corpo = await requisitar(`${BASE}/usuarioADM/me/senha`, {
    method: 'PUT',
    body: JSON.stringify({
      senhaAtual,
      novaSenha
    })
  })

  return corpo
}

/* RECUPERAÇÃO DE SENHA */

// Recupera o e-mail salvo
export function obterEmailRecuperacao() {
  return sessionStorage.getItem(CHAVE_EMAIL) || ''
}

// Recupera o código salvo
export function obterCodigoRecuperacao() {
  return sessionStorage.getItem(CHAVE_CODIGO) || ''
}

// Solicita o código de recuperação
export async function solicitarRecuperacao(email) {
  const emailNormalizado = String(email || '').trim().toLowerCase()

  if (!emailNormalizado) {
    throw new Error('Informe seu e-mail.')
  }

  const corpo = await requisitar(`${BASE}/usuarioADM/recuperarAcesso`, {
    method: 'POST',
    body: JSON.stringify({
      email: emailNormalizado
    })
  })

  sessionStorage.setItem(CHAVE_EMAIL, emailNormalizado)
  sessionStorage.removeItem(CHAVE_CODIGO)

  return corpo
}

// Valida o código de recuperação
export async function validarCodigo(email, codigo) {
  const emailNormalizado = String(email || '').trim().toLowerCase()
  const codigoNormalizado = String(codigo || '').trim()

  if (!emailNormalizado || !codigoNormalizado) {
    throw new Error('Informe o e-mail e o código de verificação.')
  }

  const corpo = await requisitar(`${BASE}/usuarioADM/validarCodigo`, {
    method: 'POST',
    body: JSON.stringify({
      email: emailNormalizado,
      codigo: codigoNormalizado
    })
  })

  sessionStorage.setItem(CHAVE_EMAIL, emailNormalizado)
  sessionStorage.setItem(CHAVE_CODIGO, codigoNormalizado)

  return corpo
}

// Redefine a senha utilizando o código
export async function redefinirSenhaComCodigo(email, codigo, novaSenha) {
  const emailNormalizado = String(email || '').trim().toLowerCase()
  const codigoNormalizado = String(codigo || '').trim()

  if (!emailNormalizado || !codigoNormalizado || !novaSenha) {
    throw new Error('Preencha todos os dados para redefinir sua senha.')
  }

  const corpo = await requisitar(`${BASE}/usuarioADM/redefinirSenha`, {
    method: 'POST',
    body: JSON.stringify({
      email: emailNormalizado,
      codigo: codigoNormalizado,
      novaSenha
    })
  })

  // Limpa os dados temporários após a redefinição
  sessionStorage.removeItem(CHAVE_EMAIL)
  sessionStorage.removeItem(CHAVE_CODIGO)

  return corpo
}
