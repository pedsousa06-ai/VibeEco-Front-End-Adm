<script setup>
import { computed, reactive, ref } from 'vue'
import { Plus, Search, Pencil, Trash2, BookOpen, Check, Clock, Star } from 'lucide-vue-next'
import PageHeader from '@/components/PageHeader.vue'
import ModalForm from '@/components/ModalForm.vue'

// TODO: trocar os dados mockados por chamadas à API.
// Para mostrar a foto de capa, preencha "imagem" com a URL ou com um arquivo
// importado de '@/assets/...'. Sem imagem, o card usa um fundo verde.
const categorias = ['Reciclagem', 'Energia', 'Água', 'Mobilidade', 'Alimentação']
const duracoes = [3, 5, 8, 10, 15]

const periodo = ref('30')
const busca = ref('')
const modalAberto = ref(false)
const itens = ref([
  { id: 1, titulo: 'Guia de Reciclagem Doméstica', descricao: 'Guia prático de reciclagem.', categoria: 'Reciclagem', duracao: 8, xp: 50, imagem: null, revisado: true },
  { id: 2, titulo: 'Como Economizar Energia', descricao: 'Hábitos simples para reduzir o consumo.', categoria: 'Energia', duracao: 5, xp: 50, imagem: null, revisado: true },
  { id: 3, titulo: 'Uso Consciente da Água', descricao: 'Dicas para evitar o desperdício em casa.', categoria: 'Água', duracao: 10, xp: 50, imagem: null, revisado: false },
  { id: 4, titulo: 'Mobilidade Sustentável', descricao: 'Alternativas ao carro no dia a dia.', categoria: 'Mobilidade', duracao: 8, xp: 50, imagem: null, revisado: false },
])

const filtrados = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  return itens.value.filter((i) => i.titulo.toLowerCase().includes(termo))
})

const vazio = () => ({ id: null, titulo: '', descricao: '', categoria: '', duracao: '' })
const form = reactive(vazio())

function abrirNovo() {
  Object.assign(form, vazio())
  modalAberto.value = true
}
function abrirEdicao(item) {
  const { id, titulo, descricao, categoria, duracao } = item
  Object.assign(form, { id, titulo, descricao, categoria, duracao })
  modalAberto.value = true
}
function mostrarTodos() {
  busca.value = ''
  modalAberto.value = false
}
function salvar() {
  const dados = {
    titulo: form.titulo.trim(),
    descricao: form.descricao.trim(),
    categoria: form.categoria,
    duracao: Number(form.duracao),
  }
  if (form.id) {
    Object.assign(itens.value.find((i) => i.id === form.id), dados)
  } else {
    itens.value.unshift({ id: Date.now(), xp: 50, imagem: null, revisado: false, ...dados })
  }
  modalAberto.value = false
}
function excluir(item) {
  if (window.confirm(`Excluir "${item.titulo}"?`)) {
    itens.value = itens.value.filter((i) => i.id !== item.id)
  }
}
function revisar(item) {
  // TODO: abrir a tela de revisão do conteúdo. Por enquanto só marca como revisado.
  item.revisado = true
}
function exportar() {
  // TODO: exportar relatório do período selecionado
  console.log('exportar conteúdos', periodo.value)
}
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

    <p v-if="!filtrados.length" class="pn-vazio">Nenhum conteúdo encontrado.</p>

    <div v-else class="lista">
      <article v-for="item in filtrados" :key="item.id" class="card">
        <div class="capa">
          <img v-if="item.imagem" :src="item.imagem" :alt="item.titulo" />
          <BookOpen v-else :size="48" class="capa-icone" aria-hidden="true" />
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
          <p class="leitura"><Clock :size="14" aria-hidden="true" />{{ item.duracao }} min leitura</p>

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
      @cancelar="modalAberto = false"
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
  gap: 6px;
  margin: 0;
  padding-bottom: 14px;
  border-bottom: 1px solid #e4ece7;
  font-size: 13px;
  color: #4b6254;
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
</style>
