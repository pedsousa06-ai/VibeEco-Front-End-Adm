import { BASE, requisitar } from './missoes'

export async function obterProgresso(periodo = '30') {
  const corpo = await requisitar(`${BASE}/progresso?periodo=${periodo}`, {
    method: 'GET'
  })
  return corpo.response
}