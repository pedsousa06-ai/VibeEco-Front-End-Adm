<script setup>
import { computed, reactive, ref } from 'vue'
import {
  Plus, Search, Pencil, Trash2, Timer, Zap, Coins, Target, Flag,
  Recycle, Droplets, Bike, Apple,
} from 'lucide-vue-next'
import PageHeader from '@/components/PageHeader.vue'
import ModalForm from '@/components/ModalForm.vue'

const props = defineProps({
  tipo: { type: String, required: true }, // 'missao' | 'desafio'
})

// TODO: trocar os dados mockados por chamadas à API
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
    recompensa: 'Recompensas',
    vazio: 'Nenhuma missão encontrada.',
    icone: Target,
    dados: [
      ['Descarte Consciente', 'Separe 3 tipos de resíduos e registre com foto.', 'Reciclagem', 'Fácil', 3, 150, 20, 45],
      ['Semana sem Plástico', 'Evite plásticos descartáveis por 7 dias.', 'Reciclagem', 'Médio', 7, 250, 40, 20],
      ['Luz Apagada', 'Desligue aparelhos que não estão em uso.', 'Energia', 'Fácil', 1, 50, 10, 80],
      ['Banho de 5 minutos', 'Reduza o tempo de banho e registre a economia.', 'Água', 'Fácil', 3, 100, 15, 60],
    ],
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
    recompensa: 'Recompensa',
    vazio: 'Nenhum desafio encontrado.',
    icone: Flag,
    dados: [
      ['Descarte Consciente', 'Separe 3 tipos de resíduos e registre com foto.', 'Reciclagem', 'Fácil', 3, 150, 20, 45],
      ['Mês da Bicicleta', 'Troque o carro por bicicleta em 10 trajetos.', 'Mobilidade', 'Difícil', 30, 250, 40, 15],
      ['Prato Sustentável', 'Monte 5 refeições sem desperdício de comida.', 'Alimentação', 'Médio', 7, 100, 15, 55],
      ['Desafio da Água', 'Economize água em casa durante 15 dias.', 'Água', 'Médio', 15, 150, 20, 30],
    ],
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
const recompensas = [
  { valor: '50-10', nome: '50 XP e 10 moedas' },
  { valor: '100-15', nome: '100 XP e 15 moedas' },
  { valor: '150-20', nome: '150 XP e 20 moedas' },
  { valor: '250-40', nome: '250 XP e 40 moedas' },
]
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
const itens = ref(
  cfg.dados.map(([titulo, objetivo, categoria, dificuldade, duracao, xp, moedas, progresso], i) => ({
    id: i + 1, titulo, objetivo, categoria, dificuldade, duracao, xp, moedas, progresso, tipo: 'Individual',
  })),
)

const filtrados = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  return itens.value.filter((i) => i.titulo.toLowerCase().includes(termo))
})

const vazio = () => ({
  id: null, titulo: '', objetivo: '', categoria: '', dificuldade: '', duracao: '', recompensa: '',
})
const form = reactive(vazio())

function abrirNovo() {
  Object.assign(form, vazio())
  modalAberto.value = true
}
function abrirEdicao(item) {
  Object.assign(form, {
    id: item.id,
    titulo: item.titulo,
    objetivo: item.objetivo,
    categoria: item.categoria,
    dificuldade: item.dificuldade,
    duracao: item.duracao,
    recompensa: `${item.xp}-${item.moedas}`,
  })
  modalAberto.value = true
}
function mostrarTodos() {
  busca.value = ''
  modalAberto.value = false
}
function salvar() {
  const [xp, moedas] = form.recompensa.split('-').map(Number)
  const dados = {
    titulo: form.titulo.trim(),
    objetivo: form.objetivo.trim(),
    categoria: form.categoria,
    dificuldade: form.dificuldade,
    duracao: Number(form.duracao),
    xp,
    moedas,
  }
  if (form.id) {
    Object.assign(itens.value.find((i) => i.id === form.id), dados)
  } else {
    itens.value.unshift({ id: Date.now(), tipo: 'Individual', progresso: 0, ...dados })
  }
  modalAberto.value = false
}
function excluir(item) {
  if (window.confirm(`Excluir "${item.titulo}"?`)) {
    itens.value = itens.value.filter((i) => i.id !== item.id)
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

    <p v-if="!filtrados.length" class="pn-vazio">{{ cfg.vazio }}</p>

    <div v-else class="lista">
      <article v-for="item in filtrados" :key="item.id" class="card">
        <div class="card-topo">
          <span class="card-icone">
            <component :is="iconesCategoria[item.categoria] || cfg.icone" :size="14" aria-hidden="true" />
          </span>
          <div class="tags">
            <span class="tag tag--azul">{{ item.tipo }}</span>
            <span class="tag" :class="classeDificuldade[item.dificuldade]">{{ item.dificuldade }}</span>
          </div>
        </div>

        <h3>{{ item.titulo }}</h3>
        <p class="objetivo">{{ item.objetivo }}</p>

        <div class="meta">
          <div class="chips">
            <span class="chip"><Timer :size="12" aria-hidden="true" />{{ item.duracao }}d</span>
            <span class="chip chip--xp"><Zap :size="12" aria-hidden="true" />+{{ item.xp }}</span>
            <span class="chip chip--moeda"><Coins :size="12" aria-hidden="true" />{{ item.moedas }}</span>
          </div>
          <div class="progresso">
            <div
              class="trilho"
              role="progressbar"
              aria-label="Progresso"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-valuenow="item.progresso"
            >
              <div class="preenchimento" :style="{ width: item.progresso + '%' }"></div>
            </div>
            <span>{{ item.progresso }}%</span>
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
      <label class="pn-campo">
        <span>Título</span>
        <input v-model="form.titulo" type="text" required :placeholder="cfg.placeholderTitulo" />
      </label>
      <label class="pn-campo">
        <span>Objetivo</span>
        <input v-model="form.objetivo" type="text" required placeholder="Separe 3 tipos de resíduos..." />
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
            <option v-for="d in duracoes" :key="d.valor" :value="d.valor">{{ d.nome }}</option>
          </select>
        </label>
        <label class="pn-campo">
          <span>{{ cfg.recompensa }}</span>
          <select v-model="form.recompensa" required>
            <option value="" disabled>Selecione...</option>
            <option v-for="r in recompensas" :key="r.valor" :value="r.valor">{{ r.nome }}</option>
          </select>
        </label>
      </div>
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
.progresso {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  font-weight: 700;
  color: #1b7a34;
}
.trilho {
  width: 82px;
  height: 7px;
  border-radius: 99px;
  background: #e1e8e3;
  overflow: hidden;
}
.preenchimento {
  height: 100%;
  border-radius: 99px;
  background: #2e7d32;
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
</style>
