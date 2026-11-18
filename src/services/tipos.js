import { BASE, requisitar } from './missoes'

function fabrica(endpoint) {
  return {
    listar: () => requisitar(`${BASE}/${endpoint}`, { method: 'GET' }),
    criar: (nome) =>
      requisitar(`${BASE}/${endpoint}`, {
        method: 'POST',
        body: JSON.stringify({ nome })
      }),
    atualizar: (id, nome) =>
      requisitar(`${BASE}/${endpoint}/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ nome })
      }),
    excluir: (id) =>
      requisitar(`${BASE}/${endpoint}/${id}`, { method: 'DELETE' })
  }
}

export const dificuldadeService = fabrica('dificuldade')
export const categoriaService = fabrica('categoria')

export function obterService(tipo) {
  if (tipo === 'desafio') return dificuldadeService
  if (tipo === 'missao' || tipo === 'conteudo') return categoriaService
  return categoriaService
}
