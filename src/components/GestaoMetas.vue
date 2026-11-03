<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import {
  Plus, Search, Pencil, Trash2, Timer, Zap, Coins, Target, Flag, ListChecks,
  Recycle, Droplets, Bike, Apple,
} from 'lucide-vue-next'
import PageHeader from '@/components/PageHeader.vue'
import ModalForm from '@/components/ModalForm.vue'
import { listarMissoes, criarMissao, atualizarMissao, excluirMissao } from '@/services/missoes'
import { listarDesafios, criarDesafio, atualizarDesafio, excluirDesafio } from '@/services/desafios'

const props = defineProps({
  tipo: { type: String, required: true }, // 'missao' | 'desafio'
})

// Missões e desafios usam a API; a única diferença é qual service é chamado
const ehMissao = props.tipo === 'missao'
const api = ehMissao
  ? { listar: listarMissoes, criar: criarMissao, atualizar: atualizarMissao, excluir: excluirMissao }
  : { listar: listarDesafios, criar: criarDesafio, atualizar: atualizarDesafio, excluir: excluirDesafio }

const CONFIG = {
  missao: {
    titulo: 'Missões',
    descricao: 'Gerenciamento de cadastro e acompanhamento de missões.',
    cadastrar: 'Cadastrar Missão',
    todos: 'Mostrar todas as Missões',
    total: 'Missões Cadastradas',
    buscar: 'Buscar Missão',
    novo: 'Nova Missão',
    editar: 'Editar Missão',
    descNovo: 'Preencha os dados abaixo para cadastrar uma nova missão.',
    placeholderTitulo: 'Título da Missão',
    moedas: 'Moedas ao concluir',
    vazio: 'Nenhuma missão encontrada.',
    icone: Target,
  },
  desafio: {
    titulo: 'Desafios',
    descricao: 'Gerenciamento de cadastro e acompanhamento de desafios.',
    cadastrar: 'Cadastrar Desafio',
    todos: 'Mostrar todos os Desafios',
    total: 'Desafios Cadastrados',
    buscar: 'Buscar Desafio',
    novo: 'Novo Desafio',
    editar: 'Editar Desafio',
    descNovo: 'Preencha os dados abaixo para cadastrar um novo desafio.',
    placeholderTitulo: 'Título do Desafio',
    moedas: 'Super Coins ao concluir',
    vazio: 'Nenhum desafio encontrado.',
    icone: Flag,
  },
}
const cfg = CONFIG[props.tipo]

const categorias = ['Reciclagem', 'Energia', 'Água', 'Mobilidade', 'Alimentação']
const dificuldades = ['Fácil', 'Médio', 'Difícil']
const duracoes = [
  { valor: 1, nome: '1 dia' },
  { valor: 3, nome: '3 dias' },
  { valor: 7, nome: '7 dias' },
  { valor: 15, nome: '15 dias' },
  { valor: 30, nome: '30 dias' },
]
// Missões e desafios: só as moedas são escolhidas; na missão o XP é a soma das etapas
const opcoesMoedasBase = [10, 15, 20, 40]
const iconesCategoria = {
  Reciclagem: Recycle,
  Energia: Zap,
  Água: Droplets,
  Mobilidade: Bike,
  Alimentação: Apple,
}
const classeDificuldade = { Fácil: 'tag--verde', Médio: 'tag--amarelo', Difícil: 'tag--vermelho' }

const periodo = ref('30')
const busca = ref('')
const modalAberto = ref(false)
const carregando = ref(false)
const salvando = ref(false)
const erro = ref('')
const itens = ref([])

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    itens.value = await api.listar()
  } catch (e) {
    erro.value = e.message || `Não foi possível carregar ${ehMissao ? 'as missões' : 'os desafios'}.`
  } finally {
    carregando.value = false
  }
}
onMounted(carregar)

const filtrados = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  return itens.value.filter((i) => i.titulo.toLowerCase().includes(termo))
})

const novaEtapa = () => ({ titulo: '', xp: 50 })
const vazio = () => ({
  id: null, titulo: '', objetivo: '', dica: '', categoria: '', dificuldade: '', duracao: '',
  moedas: '', data_inicio: '', etapas: [novaEtapa()],
})
const form = reactive(vazio())

// Se o item tiver um valor que não está na lista (ex.: 10 dias, 25 moedas), ele continua aparecendo no select
const opcoesDuracao = computed(() => {
  const atual = Number(form.duracao)
  if (!atual || duracoes.some((d) => d.valor === atual)) return duracoes
  return [...duracoes, { valor: atual, nome: `${atual} dias` }].sort((a, b) => a.valor - b.valor)
})
const opcoesMoedas = computed(() => {
  const atual = Number(form.moedas)
  if (!atual || opcoesMoedasBase.includes(atual)) return opcoesMoedasBase
  return [...opcoesMoedasBase, atual].sort((a, b) => a - b)
})

const totalXp = computed(() => form.etapas.reduce((soma, e) => soma + (Number(e.xp) || 0), 0))

function adicionarEtapa() {
  if (form.etapas.length < 20) form.etapas.push(novaEtapa())
}
function removerEtapa(i) {
  if (form.etapas.length > 1) form.etapas.splice(i, 1)
}

function abrirNovo() {
  Object.assign(form, vazio())
  erro.value = ''
  modalAberto.value = true
}
function abrirEdicao(item) {
  Object.assign(form, {
    id: item.id,
    titulo: item.titulo,
    objetivo: item.objetivo,
    dica: item.dica || '',
    categoria: item.categoria,
    dificuldade: item.dificuldade,
    duracao: item.duracao,
    moedas: item.moedas,
    data_inicio: item.data_inicio || '',
    etapas: item.etapas?.length ? item.etapas.map((e) => ({ ...e })) : [novaEtapa()],
  })
  erro.value = ''
  modalAberto.value = true
}
function mostrarTodos() {
  busca.value = ''
  modalAberto.value = false
}

async function salvar() {
  if (ehMissao) {
    const etapasValidas = form.etapas.every((e) => e.titulo.trim() && Number(e.xp) > 0)
    if (!etapasValidas) {
      erro.value = 'Preencha o título e o XP (maior que 0) de todas as etapas.'
      return
    }
  }

  salvando.value = true
  erro.value = ''
  try {
    const dados = {
      titulo: form.titulo.trim(),
      objetivo: form.objetivo.trim(),
      categoria: form.categoria,
      dificuldade: form.dificuldade,
      duracao: Number(form.duracao),
      moedas: Number(form.moedas),
      data_inicio: form.data_inicio,
    }
    if (ehMissao) {
      dados.dica = form.dica.trim()
      dados.etapas = form.etapas
    }
    if (form.id) await api.atualizar(form.id, dados)
    else await api.criar(dados)
    await carregar()
    modalAberto.value = false
  } catch (e) {
    erro.value = e.message || `Não foi possível salvar ${ehMissao ? 'a missão' : 'o desafio'}.`
  } finally {
    salvando.value = false
  }
}

async function excluir(item) {
  if (!window.confirm(`Excluir "${item.titulo}"?`)) return
  try {
    await api.excluir(item.id)
    await carregar()
  } catch (e) {
    erro.value =
      e.status === 500
        ? ehMissao
          ? 'Não foi possível excluir. Se algum usuário já participa desta missão, ela não pode ser removida.'
          : 'Não foi possível excluir. Se algum usuário já participa deste desafio, ele não pode ser removido.'
        : e.message || 'Não foi possível excluir.'
  }
}
function exportar() {
  // TODO: exportar relatório do período selecionado
  console.log('exportar', props.tipo, periodo.value)
}
</script>

<template>
  <div class="pn-pagina">
    <PageHeader v-model="periodo" :titulo="cfg.titulo" :descricao="cfg.descricao" @exportar="exportar" />

    <div class="pn-abas">
      <button type="button" class="pn-aba" :class="{ 'pn-aba--ativa': modalAberto }" @click="abrirNovo">
        <Plus :size="18" aria-hidden="true" />
        {{ cfg.cadastrar }}
      </button>
      <button type="button" class="pn-aba" :class="{ 'pn-aba--ativa': !modalAberto }" @click="mostrarTodos">
        <component :is="cfg.icone" :size="18" aria-hidden="true" />
        {{ cfg.todos }}
      </button>
    </div>

    <div class="pn-stat">
      <div class="pn-stat-topo">
        <span>{{ cfg.total }}</span>
        <span class="pn-stat-icone"><component :is="cfg.icone" :size="18" aria-hidden="true" /></span>
      </div>
      <strong>{{ itens.length }}</strong>
    </div>

    <h2 class="pn-secao-titulo">{{ cfg.buscar }}</h2>
    <label class="pn-busca">
      <Search :size="18" aria-hidden="true" />
      <input v-model="busca" type="search" placeholder="Buscar pelo Título" :aria-label="cfg.buscar" />
    </label>

    <p v-if="erro && !modalAberto" class="msg-erro" role="alert">{{ erro }}</p>
    <p v-if="carregando" class="pn-vazio">Carregando...</p>
    <p v-else-if="!filtrados.length" class="pn-vazio">{{ cfg.vazio }}</p>

    <div v-else class="lista">
      <article v-for="item in filtrados" :key="item.id" class="card">
        <div class="card-topo">
          <span class="card-icone">
            <component :is="iconesCategoria[item.categoria] || cfg.icone" :size="14" aria-hidden="true" />
          </span>
          <div class="tags">
            <span v-if="item.categoria" class="tag tag--azul">{{ item.categoria }}</span>
            <span v-else class="tag tag--azul">{{ item.tipo }}</span>
            <span v-if="item.dificuldade" class="tag" :class="classeDificuldade[item.dificuldade]">{{ item.dificuldade }}</span>
          </div>
        </div>

        <h3>{{ item.titulo }}</h3>
        <p v-if="item.objetivo" class="objetivo">{{ item.objetivo }}</p>

        <div class="meta">
          <div class="chips">
            <span class="chip"><Timer :size="12" aria-hidden="true" />{{ item.duracao }}d</span>
            <span v-if="ehMissao" class="chip chip--xp"><Zap :size="12" aria-hidden="true" />+{{ item.xp }}</span>
            <span class="chip chip--moeda"><Coins :size="12" aria-hidden="true" />{{ item.moedas }}</span>
            <span v-if="ehMissao" class="chip">
              <ListChecks :size="12" aria-hidden="true" />{{ item.etapas.length }}
              {{ item.etapas.length === 1 ? 'etapa' : 'etapas' }}
            </span>
          </div>
        </div>

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
      :descricao="form.id ? 'Altere os dados abaixo e salve.' : cfg.descNovo"
      @cancelar="modalAberto = false"
      @salvar="salvar"
    >
      <p v-if="erro" class="msg-erro" role="alert">{{ erro }}</p>
      <label class="pn-campo">
        <span>Título</span>
        <input v-model="form.titulo" type="text" required maxlength="100" :placeholder="cfg.placeholderTitulo" />
      </label>
      <label class="pn-campo">
        <span>Objetivo</span>
        <input v-model="form.objetivo" type="text" required placeholder="Separe 3 tipos de resíduos..." />
      </label>
      <label v-if="ehMissao" class="pn-campo">
        <span>Dica da missão (opcional)</span>
        <input v-model="form.dica" type="text" placeholder="Uma dica que aparece para o usuário" />
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
          <span>Dificuldade</span>
          <select v-model="form.dificuldade" required>
            <option value="" disabled>Selecione...</option>
            <option v-for="d in dificuldades" :key="d" :value="d">{{ d }}</option>
          </select>
        </label>
        <label class="pn-campo">
          <span>Duração</span>
          <select v-model="form.duracao" required>
            <option value="" disabled>Selecione...</option>
            <option v-for="d in opcoesDuracao" :key="d.valor" :value="d.valor">{{ d.nome }}</option>
          </select>
        </label>

        <!-- Missões e desafios: só moedas (na missão o XP vem das etapas) -->
        <label class="pn-campo">
          <span>{{ cfg.moedas }}</span>
          <select v-model="form.moedas" required>
            <option value="" disabled>Selecione...</option>
            <option v-for="m in opcoesMoedas" :key="m" :value="m">{{ m }} moedas</option>
          </select>
        </label>

        <!-- Desafios: data de início (vazia = hoje); o término é início + duração -->
        <label v-if="!ehMissao" class="pn-campo">
          <span>Data de início (opcional)</span>
          <input v-model="form.data_inicio" type="date" />
        </label>
      </div>

      <fieldset v-if="ehMissao" class="etapas">
        <legend>Etapas · {{ totalXp }} XP no total</legend>
        <div v-for="(etapa, i) in form.etapas" :key="i" class="etapa-linha">
          <input
            v-model="etapa.titulo"
            type="text"
            required
            maxlength="150"
            :placeholder="`Etapa ${i + 1}`"
            :aria-label="`Título da etapa ${i + 1}`"
          />
          <input
            v-model.number="etapa.xp"
            type="number"
            required
            min="1"
            step="1"
            :aria-label="`XP da etapa ${i + 1}`"
          />
          <button
            type="button"
            class="btn-remover"
            :disabled="form.etapas.length === 1"
            :aria-label="`Remover etapa ${i + 1}`"
            @click="removerEtapa(i)"
          >
            <Trash2 :size="14" aria-hidden="true" />
          </button>
        </div>
        <button type="button" class="btn-add-etapa" :disabled="form.etapas.length >= 20" @click="adicionarEtapa">
          <Plus :size="14" aria-hidden="true" />Adicionar etapa
        </button>
      </fieldset>
    </ModalForm>
  </div>
</template>

<style scoped>
.msg-erro {
  margin: 8px 0;
  padding: 8px 12px;
  border-radius: 8px;
  background: #fde8e8;
  color: #c62828;
  font-size: 13px;
}
.lista {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}
.card {
  padding: 14px 14px 16px;
  border: 1px solid #dfeae3;
  border-radius: 16px;
  background: #fff;
}
.card-topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.card-icone {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: #dff3e5;
  color: #1b7a34;
}
.tags {
  display: flex;
  gap: 6px;
}
.tag {
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}
.tag--azul {
  background: #dcebfb;
  color: #1b5fb8;
}
.tag--verde {
  background: #dff3e5;
  color: #1b7a34;
}
.tag--amarelo {
  background: #fdf0cf;
  color: #8a5a00;
}
.tag--vermelho {
  background: #fde2e2;
  color: #b3261e;
}

h3 {
  margin: 12px 0 2px;
  font-size: 17px;
  font-weight: 700;
  color: #14301f;
}
.objetivo {
  margin: 0;
  font-size: 13px;
  color: #6b7f72;
}

.meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4ece7;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  border: 1px solid #dfe5e1;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #14301f;
}
.chip--xp {
  color: #1b7a34;
}
.chip--xp svg {
  color: #f2b01e;
}
.chip--moeda {
  color: #a8650a;
}

.card-acoes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 12px;
}
.card-acoes button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 30px;
  border: 0;
  border-radius: 6px;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: filter 0.15s;
}
.card-acoes button:hover {
  filter: brightness(0.95);
}
.card-acoes button:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}
.btn-editar {
  background: #2e7d32;
  color: #fff;
}
.btn-excluir {
  background: #fde8e8;
  color: #c62828;
}

/* ---------- Etapas (dentro do modal) ---------- */
.etapas {
  display: grid;
  gap: 8px;
  margin: 12px 0 0;
  padding: 12px;
  border: 1px solid #dfeae3;
  border-radius: 10px;
}
.etapas legend {
  padding: 0 6px;
  font-size: 13px;
  font-weight: 700;
  color: #14301f;
}
.etapa-linha {
  display: grid;
  grid-template-columns: 1fr 90px 34px;
  gap: 8px;
  align-items: center;
}
.etapa-linha input {
  width: 100%;
  height: 36px;
  padding: 0 10px;
  box-sizing: border-box;
  border: 1px solid #dfe5e1;
  border-radius: 8px;
  background: #fff;
  font: inherit;
  font-size: 13px;
}
.etapa-linha input:focus-visible {
  outline: 2px solid #2e7d32;
  outline-offset: 1px;
}
.btn-remover,
.btn-add-etapa {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 0;
  border-radius: 8px;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
.btn-remover {
  width: 34px;
  height: 36px;
  background: #fde8e8;
  color: #c62828;
}
.btn-add-etapa {
  justify-self: start;
  height: 32px;
  padding: 0 12px;
  background: #dff3e5;
  color: #1b7a34;
}
.btn-remover:disabled,
.btn-add-etapa:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-remover:focus-visible,
.btn-add-etapa:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}
</style>
