// src/services/conteudos.js
// Comunicação do painel adm com a API de conteúdos educativos (back-end Node/Express).
// Reaproveita a base da API e os ids de categoria do services/missoes.js.
// Cadastro e edição vão como multipart/form-data, porque levam a imagem de capa e os anexos.
import { BASE, requisitar, ID_CATEGORIA } from '@/services/missoes'

const URL_CONTEUDO = `${BASE}/conteudoEducativo`

// "1730000000000-capa_da_aula.png" (nome gravado no Azure) -> "capa_da_aula.png"
function nomeDoArquivo(url) {
  const final = String(url).split('?')[0].split('/').pop()
  try {
    return decodeURIComponent(final).replace(/^\d+-/, '')
  } catch {
    return final
  }
}

// API -> formato usado pela tela
function deApi(c) {
  return {
    id: c.id,
    titulo: c.nome,
    descricao: c.descricao || '',
    categoria: c.categoria?.[0]?.nome || '', // a tela trabalha com uma categoria só
    duracao: Number(c.duracao_leitura),
    imagem: c.img ? { url: c.img, nome: nomeDoArquivo(c.img) } : null, // sem "arquivo": já está no Azure
    anexos: (c.anexos || []).map((a) => ({ id: a.id, nome: a.nome, url: a.endereco_url })),
    revisado: false, // ainda não existe no banco
  }
}

// tela -> multipart esperado pelo controller
//  - imagem nova (tem "arquivo")  -> vai no campo img
//  - sem imagem                   -> remover_img=true (na edição apaga a capa; no cadastro é ignorado)
//  - imagem antiga (sem "arquivo") -> não manda nada: o back mantém a que já existe
//  - anexos antigos (sem "arquivo") -> só os ids que continuam, em anexos_mantidos
//  - anexos novos (com "arquivo")   -> vão no campo anexos
function paraFormData(d) {
  const idCategoria = ID_CATEGORIA[d.categoria]
  if (!idCategoria) throw new Error('Selecione uma categoria válida.')

  const dados = new FormData()
  dados.append('nome', String(d.titulo).trim())
  dados.append('descricao', String(d.descricao).trim())
  dados.append('duracao_leitura', String(d.duracao))
  dados.append('categoria', JSON.stringify([{ id: idCategoria }]))

  if (d.imagem?.arquivo) dados.append('img', d.imagem.arquivo, d.imagem.arquivo.name)
  else if (!d.imagem) dados.append('remover_img', 'true')

  const anexos = d.anexos || []
  dados.append('anexos_mantidos', JSON.stringify(anexos.filter((a) => !a.arquivo).map((a) => a.id)))
  anexos.filter((a) => a.arquivo).forEach((a) => dados.append('anexos', a.arquivo, a.arquivo.name))

  return dados
}

// headers: {} -> o navegador define o Content-Type do multipart (com o boundary); não pode ser application/json
const comArquivos = (metodo, dados) => ({ method: metodo, body: paraFormData(dados), headers: {} })

export async function listarConteudos() {
  try {
    const r = await requisitar(URL_CONTEUDO)
    return (r.response?.conteudoEducativo || []).map(deApi)
  } catch (e) {
    if (e.status === 404) return [] // 404 = nenhum conteúdo cadastrado
    throw e
  }
}

export async function criarConteudo(dados) {
  await requisitar(URL_CONTEUDO, comArquivos('POST', dados))
}

export async function atualizarConteudo(id, dados) {
  await requisitar(`${URL_CONTEUDO}/${id}`, comArquivos('PUT', dados))
}

export async function excluirConteudo(id) {
  await requisitar(`${URL_CONTEUDO}/${id}`, { method: 'DELETE' })
}

// Troca só a capa (botão no card): reenvia os dados atuais do item com a imagem nova
export async function trocarCapaConteudo(item, arquivo) {
  await atualizarConteudo(item.id, { ...item, imagem: { arquivo } })
}
