<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import { Plus, Search, Pencil, Trash2, Flame, Layers, Folder } from 'lucide-vue-next'
import PageHeader from '@/components/PageHeader.vue'
import ModalForm from '@/components/ModalForm.vue'
import { obterService } from '@/services/tipos'

const props = defineProps({
  tipo: { type: String, required: true }, // 'desafio' | 'missao' | 'conteudo'
})

const CONFIG = {
  desafio: {
    titulo: 'Tipo de desafio',
    descricao: 'Gerenciamento de dificuldades usadas nos desafios.',
    novo: 'Nova dificuldade',
    editar: 'Editar dificuldade',
    descNovo: 'Preencha o nome da nova dificuldade (ex.: Fácil, Médio, Difícil).',
    placeholderNome: 'Ex.: Fácil',
    icone: Flame,
    plural: 'dificuldades'
  },
  missao: {
    titulo: 'Tipo de missão',
    descricao: 'Gerenciamento de categorias usadas nas missões.',
    novo: 'Nova categoria',
    editar: 'Editar categoria',
    descNovo: 'Preencha o nome da nova categoria (ex.: Reciclagem, Energia).',
    placeholderNome: 'Ex.: Reciclagem',
    icone: Layers,
    plural: 'categorias'
  },
  conteudo: {
    titulo: 'Tipo de conteúdo educativo',
    descricao: 'Gerenciamento de categorias usadas nos conteúdos educativos.',
    novo: 'Nova categoria',
    editar: 'Editar categoria',
    descNovo: 'Preencha o nome da nova categoria de conteúdo.',
    placeholderNome: 'Ex.: Artigo',
    icone: Folder,
    plural: 'categorias'
  },
}
const cfg = CONFIG[props.tipo]
const service = obterService(props.tipo)

const periodo = ref('30')
const busca = ref('')
const modalAberto = ref(false)
const itens = ref([])
const carregando = ref(false)
const salvando = ref(false)
const erro = ref('')

const filtrados = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  return itens.value.filter((i) => i.nome.toLowerCase().includes(termo))
})

const form = reactive({ id: null, nome: '' })

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    const corpo = await service.listar()
    // a API retorna { response: { dificuldade: [...] } } ou { response: { categoria: [...] } }
    const lista = corpo?.response?.dificuldade || corpo?.response?.categoria || []
    itens.value = lista
  } catch (e) {
    // 404 = lista vazia, não é erro fatal
    if (e.status === 404) itens.value = []
    else erro.value = e.message || 'Não foi possível carregar.'
  } finally {
    carregando.value = false
  }
}

onMounted(carregar)

function abrirNovo() {
  form.id = null
  form.nome = ''
  erro.value = ''
  modalAberto.value = true
}

function abrirEdicao(item) {
  form.id = item.id
  form.nome = item.nome
  erro.value = ''
  modalAberto.value = true
}

function mostrarTodos() {
  busca.value = ''
  modalAberto.value = false
}

async function salvar() {
  const nome = form.nome.trim()
  if (!nome) {
    erro.value = 'Informe um nome.'
    return
  }

  // Verifica duplicado local
  const repetido = itens.value.some(
    (i) => i.id !== form.id && i.nome.toLowerCase() === nome.toLowerCase()
  )
  if (repetido) {
    erro.value = 'Já existe um tipo com esse nome.'
    return
  }

  salvando.value = true
  erro.value = ''
  try {
    if (form.id) await service.atualizar(form.id, nome)
    else await service.criar(nome)
    await carregar()
    modalAberto.value = false
  } catch (e) {
    erro.value = e.message || 'Não foi possível salvar.'
  } finally {
    salvando.value = false
  }
}

async function excluir(item) {
  if (!window.confirm(`Excluir "${item.nome}"?`)) return
  try {
    await service.excluir(item.id)
    await carregar()
  } catch (e) {
    erro.value = e.status === 500
      ? 'Não foi possível excluir. Esse tipo está em uso.'
      : e.message || 'Não foi possível excluir.'
  }
}

function exportar() {
  console.log('exportar', props.tipo, periodo.value)
}
</script>

<template>
  <div class="pn-pagina">
    <PageHeader v-model="periodo" :titulo="cfg.titulo" :descricao="cfg.descricao" @exportar="exportar" />

    <div class="pn-abas">
      <button type="button" class="pn-aba" :class="{ 'pn-aba--ativa': modalAberto }" @click="abrirNovo">
        <Plus :size="18" aria-hidden="true" />
        {{ cfg.novo }}
      </button>
      <button type="button" class="pn-aba" :class="{ 'pn-aba--ativa': !modalAberto }" @click="mostrarTodos">
        <component :is="cfg.icone" :size="18" aria-hidden="true" />
        Mostrar todos
      </button>
    </div>

    <div class="pn-stat">
      <div class="pn-stat-topo">
        <span>Total de {{ cfg.plural }}</span>
        <span class="pn-stat-icone"><component :is="cfg.icone" :size="18" aria-hidden="true" /></span>
      </div>
      <strong>{{ itens.length }}</strong>
    </div>

    <h2 class="pn-secao-titulo">Buscar</h2>
    <label class="pn-busca">
      <Search :size="18" aria-hidden="true" />
      <input v-model="busca" type="search" placeholder="Buscar pelo nome" aria-label="Buscar" />
    </label>

    <p v-if="erro && !modalAberto" class="pn-erro">{{ erro }}</p>
    <p v-if="carregando" class="pn-vazio">Carregando...</p>
    <p v-else-if="!filtrados.length" class="pn-vazio">Nenhum tipo encontrado.</p>

    <div v-else class="lista">
      <article v-for="item in filtrados" :key="item.id" class="card">
        <div class="card-topo">
          <span class="card-icone"><component :is="cfg.icone" :size="16" aria-hidden="true" /></span>
        </div>

        <h3>{{ item.nome }}</h3>

        <div class="card-acoes">
          <button type="button" class="btn-editar" @click="abrirEdicao(item)">
            <Pencil :size="14" aria-hidden="true" />Editar
          </button>
          <button type="button" class="btn-excluir" @click="excluir(item)">
            <Trash2 :size="14" aria-hidden="true" />Excluir
          </button>
        </div>
      </article>
    </div>

    <ModalForm
      :aberto="modalAberto"
      :titulo="form.id ? cfg.editar : cfg.novo"
      :descricao="form.id ? 'Altere o nome abaixo e salve.' : cfg.descNovo"
      @cancelar="modalAberto = false"
      @salvar="salvar"
    >
      <p v-if="erro" class="msg-erro" role="alert">{{ erro }}</p>
      <label class="pn-campo">
        <span>Nome</span>
        <input v-model="form.nome" type="text" required maxlength="50" :placeholder="cfg.placeholderNome" />
      </label>
    </ModalForm>
  </div>
</template>

<style scoped>
.lista {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 18px;
}
.card {
  padding: 16px;
  border: 1px solid #dfeae3;
  border-radius: 14px;
  background: #fff;
}
.card-topo {
  display: flex;
  justify-content: flex-start;
}
.card-icone {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #dff3e5;
  color: #1b7a34;
}
h3 {
  margin: 14px 0 0;
  font-size: 18px;
  font-weight: 700;
  color: #14301f;
}
.card-acoes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #e4ece7;
}
.card-acoes button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 32px;
  border: 0;
  border-radius: 6px;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: filter 0.15s;
}
.card-acoes button:hover {
  filter: brightness(0.95);
}
.btn-editar {
  background: #2e7d32;
  color: #fff;
}
.btn-excluir {
  background: #fde8e8;
  color: #c62828;
}
.msg-erro {
  margin: 0 0 12px;
  padding: 8px 12px;
  border-radius: 8px;
  background: #fde8e8;
  color: #c62828;
  font-size: 13px;
}
</style>