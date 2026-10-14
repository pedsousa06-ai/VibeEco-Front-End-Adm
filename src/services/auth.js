// Sessão simulada, sem API. Quando o back-end existir, troque o corpo destas
// funções por chamadas reais e mantenha os mesmos nomes.
const CHAVE = 'vibeeco_token'

export function estaLogado() {
  return !!localStorage.getItem(CHAVE)
}

// TODO: trocar por POST /login. Por enquanto aceita qualquer login e senha preenchidos.
export async function entrar(login, senha) {
  if (!login?.trim() || !senha) throw new Error('Informe o login e a senha.')
  localStorage.setItem(CHAVE, 'token-simulado')
}

export function sair() {
  localStorage.removeItem(CHAVE)
}
