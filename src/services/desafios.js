// src/services/desafios.js
// Comunicação do painel adm com a API de desafios (back-end Node/Express).
// Reaproveita a base da API e os ids de categoria/dificuldade do services/missoes.js.
import {
  BASE, requisitar, dia, diasEntre, hojeLocal, somarDias, ID_DIFICULDADE, ID_CATEGORIA,
} from '@/services/missoes'

const URL_DESAFIO = `${BASE}/desafio`

// API -> formato usado pela tela
function deApi(d) {
  return {
    id: d.id,
    titulo: d.nome,
    objetivo: d.descricao || '',
    categoria: d.categoria?.[0]?.nome || '', // a tela trabalha com uma categoria só
    dificuldade: d.dificuldade || '', // o DAO já devolve o nome pelo join
    duracao: diasEntre(d.data_inicio, d.data_termino),
    moedas: Number(d.super_coins),
    tipo: 'Individual',
    data_inicio: dia(d.data_inicio),
  }
}

// tela -> formato esperado pelo controller de desafio
function paraApi(d) {
  const inicio = d.data_inicio || hojeLocal()
  return {
    nome: String(d.titulo).trim(),
    descricao: String(d.objetivo).trim(),
    super_coins: Number(d.moedas),
    data_inicio: inicio,
    data_termino: somarDias(inicio, d.duracao),
    id_dificuldade: ID_DIFICULDADE[d.dificuldade],
    categoria: [{ id: ID_CATEGORIA[d.categoria] }], // o controller espera um array de { id }
  }
}

export async function listarDesafios() {
  try {
    const r = await requisitar(URL_DESAFIO)
    return (r.response?.desafio || []).map(deApi)
  } catch (e) {
    if (e.status === 404) return [] // 404 = nenhum desafio cadastrado
    throw e
  }
}

export async function criarDesafio(dados) {
  await requisitar(URL_DESAFIO, { method: 'POST', body: JSON.stringify(paraApi(dados)) })
}

export async function atualizarDesafio(id, dados) {
  await requisitar(`${URL_DESAFIO}/${id}`, { method: 'PUT', body: JSON.stringify(paraApi(dados)) })
}

export async function excluirDesafio(id) {
  await requisitar(`${URL_DESAFIO}/${id}`, { method: 'DELETE' })
}
