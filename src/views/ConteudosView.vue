<script setup>
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import {
  Plus, Search, Pencil, Trash2, BookOpen, Check, Clock, Star,
  ImagePlus, Upload, Paperclip, FileText, X,
} from 'lucide-vue-next'
import PageHeader from '@/components/PageHeader.vue'
import ModalForm from '@/components/ModalForm.vue'

// TODO: trocar os dados mockados por chamadas à API.
// Os arquivos escolhidos ficam só em memória (objectURL). Cada item guarda também o
// objeto File original em "arquivo", pronto para enviar com FormData quando houver API.
const categorias = ['Reciclagem', 'Energia', 'Água', 'Mobilidade', 'Alimentação']
const duracoes = [3, 5, 8, 10, 15]

// Regras de upload
const IMAGEM_TIPOS = ['image/png', 'image/jpeg', 'image/webp']
const IMAGEM_MAX = 5 * 1024 * 1024
const ANEXO_EXTENSOES = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt', '.zip']
const ANEXO_MAX = 10 * 1024 * 1024
const ANEXOS_LIMITE = 5

const periodo = ref('30')
const busca = ref('')
const modalAberto = ref(false)
const itens = ref([
  { id: 1, titulo: 'Guia de Reciclagem Doméstica', descricao: 'Guia prático de reciclagem.', categoria: 'Reciclagem', duracao: 8, xp: 50, imagem: null, anexos: [], revisado: true },
  { id: 2, titulo: 'Como Economizar Energia', descricao: 'Hábitos simples para reduzir o consumo.', categoria: 'Energia', duracao: 5, xp: 50, imagem: null, anexos: [], revisado: true },
  { id: 3, titulo: 'Uso Consciente da Água', descricao: 'Dicas para evitar o desperdício em casa.', categoria: 'Água', duracao: 10, xp: 50, imagem: null, anexos: [], revisado: false },
  { id: 4, titulo: 'Mobilidade Sustentável', descricao: 'Alternativas ao carro no dia a dia.', categoria: 'Mobilidade', duracao: 8, xp: 50, imagem: null, anexos: [], revisado: false },
])

const filtrados = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  return itens.value.filter((i) => i.titulo.toLowerCase().includes(termo))
})

const vazio = () => ({ id: null, titulo: '', descricao: '', categoria: '', duracao: '', imagem: null, anexos: [] })
const form = reactive(vazio())
const erro = ref('')
const erroUpload = ref('')
const arrastando = ref('')

// URLs criadas durante a edição atual (precisam ser liberadas se o usuário cancelar)
const urlsNovas = new Set()

function criarUrl(arquivo) {
  const url = URL.createObjectURL(arquivo)
  urlsNovas.add(url)
  return url
}
function liberarUrl(url) {
  if (!url) return
  URL.revokeObjectURL(url)
  urlsNovas.delete(url)
}
function urlsDoItem(item) {
  return [item?.imagem?.url, ...(item?.anexos ?? []).map((a) => a.url)].filter(Boolean)
}
function formatarTamanho(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/* ---------- Imagem de capa ---------- */
function escolherImagem(arquivos) {
  const arquivo = arquivos?.[0]
  if (!arquivo) return
  if (!IMAGEM_TIPOS.includes(arquivo.type)) {
    erroUpload.value = 'A imagem precisa ser PNG, JPG ou WebP.'
    return
  }
  if (arquivo.size > IMAGEM_MAX) {
    erroUpload.value = 'A imagem deve ter no máximo 5 MB.'
    return
  }
  erroUpload.value = ''
  if (form.imagem && urlsNovas.has(form.imagem.url)) liberarUrl(form.imagem.url)
  form.imagem = { url: criarUrl(arquivo), nome: arquivo.name, tamanho: arquivo.size, arquivo }
}
function aoEscolherImagem(e) {
  escolherImagem(e.target.files)
  e.target.value = '' // permite escolher o mesmo arquivo de novo
}
function aoSoltarImagem(e) {
  arrastando.value = ''
  escolherImagem(e.dataTransfer?.files)
}
function removerImagem() {
  if (form.imagem && urlsNovas.has(form.imagem.url)) liberarUrl(form.imagem.url)
  form.imagem = null
  erroUpload.value = ''
}

/* ---------- Arquivos anexos ---------- */
function adicionarAnexos(arquivos) {
  const problemas = []
  for (const arquivo of Array.from(arquivos ?? [])) {
    if (form.anexos.length >= ANEXOS_LIMITE) {
      problemas.push(`O limite é de ${ANEXOS_LIMITE} arquivos.`)
      break
    }
    const extensao = '.' + arquivo.name.split('.').pop().toLowerCase()
    if (!ANEXO_EXTENSOES.includes(extensao)) {
      problemas.push(`"${arquivo.name}": formato não permitido.`)
      continue
    }
    if (arquivo.size > ANEXO_MAX) {
      problemas.push(`"${arquivo.name}": passa de 10 MB.`)
      continue
    }
    if (form.anexos.some((a) => a.nome === arquivo.name && a.tamanho === arquivo.size)) {
      problemas.push(`"${arquivo.name}" já foi adicionado.`)
      continue
    }
    form.anexos.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      nome: arquivo.name,
      tamanho: arquivo.size,
      url: criarUrl(arquivo),
      arquivo,
    })
  }
  erroUpload.value = problemas.join(' ')
}
function aoEscolherAnexos(e) {
  adicionarAnexos(e.target.files)
  e.target.value = ''
}
function aoSoltarAnexos(e) {
  arrastando.value = ''
  adicionarAnexos(e.dataTransfer?.files)
}
function removerAnexo(anexo) {
  if (urlsNovas.has(anexo.url)) liberarUrl(anexo.url)
  form.anexos = form.anexos.filter((a) => a.id !== anexo.id)
  erroUpload.value = ''
}

/* ---------- Modal e CRUD ---------- */
function abrirNovo() {
  Object.assign(form, vazio())
  erro.value = ''
  erroUpload.value = ''
  modalAberto.value = true
}
function abrirEdicao(item) {
  const { id, titulo, descricao, categoria, duracao } = item
  Object.assign(form, {
    id, titulo, descricao, categoria, duracao,
    imagem: item.imagem ? { ...item.imagem } : null,
    anexos: item.anexos.map((a) => ({ ...a })),
  })
  erro.value = ''
  erroUpload.value = ''
  modalAberto.value = true
}
function fechar() {
  // Cancelou: libera o que foi escolhido nesta edição e não foi salvo
  urlsNovas.forEach((url) => URL.revokeObjectURL(url))
  urlsNovas.clear()
  modalAberto.value = false
}
function mostrarTodos() {
  busca.value = ''
  if (modalAberto.value) fechar()
}
function salvar() {
  const antigo = form.id ? itens.value.find((i) => i.id === form.id) : null

  // Libera as URLs do item antigo que foram removidas ou trocadas
  const mantidas = new Set([form.imagem?.url, ...form.anexos.map((a) => a.url)])
  urlsDoItem(antigo).forEach((url) => {
    if (!mantidas.has(url)) URL.revokeObjectURL(url)
  })
  urlsNovas.clear() // o que sobrou agora pertence ao item salvo

  const dados = {
    titulo: form.titulo.trim(),
    descricao: form.descricao.trim(),
    categoria: form.categoria,
    duracao: Number(form.duracao),
    imagem: form.imagem ? { ...form.imagem } : null,
    anexos: form.anexos.map((a) => ({ ...a })),
  }
  if (antigo) {
    Object.assign(antigo, dados)
  } else {
    itens.value.unshift({ id: Date.now(), xp: 50, revisado: false, ...dados })
  }
  modalAberto.value = false
}
function excluir(item) {
  if (window.confirm(`Excluir "${item.titulo}"?`)) {
    urlsDoItem(item).forEach((url) => URL.revokeObjectURL(url))
    itens.value = itens.value.filter((i) => i.id !== item.id)
  }
}
const avisoPagina = ref('')
let timerAviso
function avisar(mensagem) {
  avisoPagina.value = mensagem
  clearTimeout(timerAviso)
  if (mensagem) timerAviso = setTimeout(() => (avisoPagina.value = ''), 6000)
}
// Troca a capa direto pelo card, sem abrir o modal
function aoTrocarCapa(item, e) {
  const arquivo = e.target.files?.[0]
  e.target.value = ''
  if (!arquivo) return
  if (!IMAGEM_TIPOS.includes(arquivo.type)) return avisar('A imagem precisa ser PNG, JPG ou WebP.')
  if (arquivo.size > IMAGEM_MAX) return avisar('A imagem deve ter no máximo 5 MB.')
  if (item.imagem?.url) URL.revokeObjectURL(item.imagem.url)
  item.imagem = { url: URL.createObjectURL(arquivo), nome: arquivo.name, tamanho: arquivo.size, arquivo }
  avisar('')
}
function revisar(item) {
  // TODO: abrir a tela de revisão do conteúdo. Por enquanto só marca como revisado.
  item.revisado = true
}
function exportar() {
  // TODO: exportar relatório do período selecionado
  console.log('exportar conteúdos', periodo.value)
}

onBeforeUnmount(() => {
  itens.value.forEach((item) => urlsDoItem(item).forEach((url) => URL.revokeObjectURL(url)))
  urlsNovas.forEach((url) => URL.revokeObjectURL(url))
})
</script>

<template>
  <div class="pn-pagina">
    <PageHeader
      v-model="periodo"
      titulo="Conteúdos Educativos"
      descricao="Gerenciamento de cadastro e acompanhamento dos conteúdos educativos."
      @exportar="exportar"
    />

    <div class="pn-abas">
      <button type="button" class="pn-aba" :class="{ 'pn-aba--ativa': modalAberto }" @click="abrirNovo">
        <Plus :size="18" aria-hidden="true" />
        Cadastrar Conteúdo
      </button>
      <button type="button" class="pn-aba" :class="{ 'pn-aba--ativa': !modalAberto }" @click="mostrarTodos">
        <BookOpen :size="18" aria-hidden="true" />
        Mostrar todos os Conteúdos
      </button>
    </div>

    <div class="pn-stat">
      <div class="pn-stat-topo">
        <span>Conteúdos Cadastrados</span>
        <span class="pn-stat-icone"><BookOpen :size="18" aria-hidden="true" /></span>
      </div>
      <strong>{{ itens.length }}</strong>
    </div>

    <h2 class="pn-secao-titulo">Buscar Conteúdo</h2>
    <label class="pn-busca">
      <Search :size="18" aria-hidden="true" />
      <input v-model="busca" type="search" placeholder="Buscar pelo Título" aria-label="Buscar Conteúdo" />
    </label>

    <p v-if="avisoPagina" class="aviso" role="alert">{{ avisoPagina }}</p>

    <p v-if="!filtrados.length" class="pn-vazio">Nenhum conteúdo encontrado.</p>

    <div v-else class="lista">
      <article v-for="item in filtrados" :key="item.id" class="card">
        <div class="capa">
          <img v-if="item.imagem" :src="item.imagem.url" :alt="`Capa de ${item.titulo}`" />
          <BookOpen v-else :size="48" class="capa-icone" aria-hidden="true" />
          <label class="capa-trocar">
            <ImagePlus :size="16" aria-hidden="true" />
            <span class="so-leitor">{{ item.imagem ? 'Trocar' : 'Adicionar' }} capa de {{ item.titulo }}</span>
            <input class="so-leitor" type="file" accept="image/png,image/jpeg,image/webp" @change="aoTrocarCapa(item, $event)" />
          </label>
          <span v-if="item.revisado" class="revisado" title="Conteúdo revisado">
            <Check :size="16" aria-hidden="true" />
            <span class="so-leitor">Conteúdo revisado</span>
          </span>
        </div>

        <div class="corpo">
          <div class="linha">
            <span class="tag">{{ item.categoria }}</span>
            <span class="xp"><Star :size="14" aria-hidden="true" />{{ item.xp }} XP</span>
          </div>

          <h3>{{ item.titulo }}</h3>
          <p class="leitura">
            <Clock :size="14" aria-hidden="true" />{{ item.duracao }} min leitura
            <span v-if="item.anexos.length" class="anexos-chip">
              <Paperclip :size="14" aria-hidden="true" />
              {{ item.anexos.length }} {{ item.anexos.length === 1 ? 'anexo' : 'anexos' }}
            </span>
          </p>

          <div class="acoes">
            <button type="button" class="btn-revisar" @click="revisar(item)">Revisar conteúdo</button>
            <button type="button" class="btn-editar" @click="abrirEdicao(item)">
              <Pencil :size="14" aria-hidden="true" />Editar
            </button>
            <button type="button" class="btn-excluir" @click="excluir(item)">
              <Trash2 :size="14" aria-hidden="true" />Excluir
            </button>
          </div>
        </div>
      </article>
    </div>

    <ModalForm
      :aberto="modalAberto"
      :titulo="form.id ? 'Editar Conteúdo' : 'Novo Conteúdo'"
      :descricao="form.id ? 'Altere os dados abaixo e salve.' : 'Preencha os dados abaixo para cadastrar um novo conteúdo.'"
      @cancelar="fechar"
      @salvar="salvar"
    >
      <label class="pn-campo">
        <span>Título</span>
        <input v-model="form.titulo" type="text" required placeholder="Título do Conteúdo" />
      </label>
      <label class="pn-campo">
        <span>Descrição</span>
        <input v-model="form.descricao" type="text" required placeholder="Guia prático de reciclagem..." />
      </label>
      <div class="pn-grid-2">
        <label class="pn-campo">
          <span>Categoria</span>
          <select v-model="form.categoria" required>
            <option value="" disabled>Selecione...</option>
            <option v-for="c in categorias" :key="c" :value="c">{{ c }}</option>
          </select>
        </label>
        <label class="pn-campo">
          <span>Duração</span>
          <select v-model="form.duracao" required>
            <option value="" disabled>Selecione...</option>
            <option v-for="d in duracoes" :key="d" :value="d">{{ d }} min de leitura</option>
          </select>
        </label>
      </div>

      <div class="pn-grid-2">
        <!-- Imagem de capa -->
        <div class="campo-arquivo">
          <span id="rotulo-imagem" class="rotulo">Imagem de capa <small>(opcional)</small></span>

          <div v-if="form.imagem" class="previa">
            <img :src="form.imagem.url" alt="Prévia da imagem de capa" />
            <div class="previa-info">
              <strong>{{ form.imagem.nome }}</strong>
              <small>{{ formatarTamanho(form.imagem.tamanho) }}</small>
            </div>
            <div class="previa-acoes">
              <label class="btn-mini">
                Trocar
                <input class="so-leitor" type="file" accept="image/png,image/jpeg,image/webp" @change="aoEscolherImagem" />
              </label>
              <button type="button" class="btn-mini btn-mini--perigo" @click="removerImagem">Remover</button>
            </div>
          </div>

          <label
            v-else
            class="zona"
            :class="{ 'zona--ativa': arrastando === 'imagem' }"
            @dragover.prevent="arrastando = 'imagem'"
            @dragleave="arrastando = ''"
            @drop.prevent="aoSoltarImagem"
          >
            <ImagePlus :size="28" aria-hidden="true" />
            <strong>Clique para escolher ou arraste a imagem</strong>
            <small>PNG, JPG ou WebP, até 5 MB</small>
            <input
              class="so-leitor"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              aria-labelledby="rotulo-imagem"
              @change="aoEscolherImagem"
            />
          </label>
        </div>

        <!-- Arquivos anexos -->
        <div class="campo-arquivo">
          <span id="rotulo-anexos" class="rotulo">Arquivos anexos <small>(até {{ ANEXOS_LIMITE }})</small></span>

          <label
            class="zona"
            :class="{ 'zona--ativa': arrastando === 'anexos' }"
            @dragover.prevent="arrastando = 'anexos'"
            @dragleave="arrastando = ''"
            @drop.prevent="aoSoltarAnexos"
          >
            <Upload :size="28" aria-hidden="true" />
            <strong>Clique para escolher ou arraste os arquivos</strong>
            <small>PDF, Word, PowerPoint, Excel, TXT ou ZIP, até 10 MB cada</small>
            <input
              class="so-leitor"
              type="file"
              multiple
              :accept="ANEXO_EXTENSOES.join(',')"
              aria-labelledby="rotulo-anexos"
              @change="aoEscolherAnexos"
            />
          </label>

          <ul v-if="form.anexos.length" class="anexos-lista">
            <li v-for="a in form.anexos" :key="a.id">
              <FileText :size="18" aria-hidden="true" />
              <a :href="a.url" target="_blank" rel="noopener" :title="a.nome">{{ a.nome }}</a>
              <small>{{ formatarTamanho(a.tamanho) }}</small>
              <button type="button" class="remover" :aria-label="`Remover ${a.nome}`" @click="removerAnexo(a)">
                <X :size="16" aria-hidden="true" />
              </button>
            </li>
          </ul>
        </div>
      </div>

      <p v-if="erroUpload" class="erro" role="alert">{{ erroUpload }}</p>
      <p v-if="erro" class="erro" role="alert">{{ erro }}</p>
    </ModalForm>
  </div>
</template>

<style scoped>
.lista {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}
.card {
  overflow: hidden;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(20, 48, 31, 0.08);
}

.capa {
  position: relative;
  display: grid;
  place-items: center;
  height: 154px;
  background: linear-gradient(135deg, #cdeed7, #8fd3a6);
}
.capa img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.capa-icone {
  color: #0e8a3a;
  opacity: 0.55;
}
.revisado {
  position: absolute;
  top: 8px;
  right: 8px;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #fff;
  color: #0e8a3a;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}
.capa-trocar {
  position: absolute;
  top: 8px;
  left: 8px;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fff;
  color: #0e8a3a;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  cursor: pointer;
}
.capa-trocar:hover {
  background: #f1faf3;
}
.capa-trocar:focus-within {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}
.aviso {
  margin: 0 0 16px;
  font-size: 14px;
  color: #c62828;
}
.so-leitor {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

.corpo {
  padding: 16px;
}
.linha {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.tag {
  padding: 5px 12px;
  border-radius: 6px;
  background: #e3f4e8;
  color: #0b7a38;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}
.xp {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #4b6254;
}
.xp svg {
  color: #f2a01e;
}
h3 {
  margin: 14px 0 6px;
  font-size: 18px;
  font-weight: 700;
  color: #14301f;
}
.leitura {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding-bottom: 14px;
  border-bottom: 1px solid #e4ece7;
  font-size: 13px;
  color: #4b6254;
}
.anexos-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  padding: 2px 8px;
  border-radius: 99px;
  background: #eef6f0;
  font-weight: 600;
  color: #1b7a34;
}

.acoes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 14px;
}
.acoes button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 36px;
  border-radius: 6px;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: filter 0.15s;
}
.acoes button:hover {
  filter: brightness(0.95);
}
.acoes button:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}
.btn-revisar {
  grid-column: 1 / -1;
  height: 40px !important;
  border: 0;
  background: #07843f;
  color: #fff;
  font-size: 14px !important;
}
.btn-editar {
  border: 1.5px solid #07843f;
  background: #fff;
  color: #07843f;
}
.btn-excluir {
  border: 1px solid #e0605a;
  background: #fff0ef;
  color: #c62828;
}

/* ---------- Upload no modal ---------- */
.campo-arquivo {
  margin-bottom: 16px;
}
.rotulo {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #14301f;
}
.rotulo small {
  font-weight: 400;
  color: #6b7f72;
}

.zona {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 22px 16px;
  border: 2px dashed #b9dcc4;
  border-radius: 12px;
  background: #f6fbf7;
  color: #1b7a34;
  text-align: center;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.zona--baixa {
  padding: 16px;
}
.zona:hover,
.zona--ativa {
  border-color: #07843f;
  background: #e9f6ed;
}
.zona:focus-within {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}
.zona strong {
  font-size: 14px;
  color: #14301f;
}
.zona small {
  font-size: 12px;
  color: #6b7f72;
}

.previa {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  border: 1px solid #d5e6da;
  border-radius: 12px;
  background: #fff;
}
.previa img {
  width: 100%;
  height: 96px;
  border-radius: 8px;
  object-fit: cover;
}
.previa-info {
  min-width: 0;
}
.previa-acoes {
  display: flex;
  gap: 8px;
}
.previa-info strong {
  display: block;
  overflow: hidden;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #14301f;
}
.previa-info small {
  font-size: 12px;
  color: #6b7f72;
}
.btn-mini {
  position: relative;
  flex: 1;
  text-align: center;
  padding: 6px 12px;
  border: 1px solid #b9dcc4;
  border-radius: 6px;
  background: #fff;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  color: #1b7a34;
  cursor: pointer;
}
.btn-mini:hover {
  background: #f1faf3;
}
.btn-mini:focus-within,
.btn-mini:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}
.btn-mini--perigo {
  border-color: #f0b4b0;
  background: #fff5f4;
  color: #c62828;
}
.btn-mini--perigo:hover {
  background: #fde8e8;
}

.anexos-lista {
  display: grid;
  gap: 8px;
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
}
.anexos-lista li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid #e4ece7;
  border-radius: 8px;
  background: #fff;
  color: #1b7a34;
}
.anexos-lista a {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #14301f;
  text-decoration: none;
}
.anexos-lista a:hover {
  text-decoration: underline;
}
.anexos-lista small {
  flex: none;
  font-size: 12px;
  color: #6b7f72;
}
.remover {
  display: grid;
  place-items: center;
  flex: none;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #c62828;
  cursor: pointer;
}
.remover:hover {
  background: #fde8e8;
}
.remover:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}

.erro {
  margin: 0 0 12px;
  font-size: 13px;
  color: #c62828;
}
</style>
