<script setup>
import { computed, reactive, ref } from 'vue'
import { Plus, Search, Pencil, Trash2, Flame, Layers, Folder } from 'lucide-vue-next'
import PageHeader from '@/components/PageHeader.vue'
import ModalForm from '@/components/ModalForm.vue'

const props = defineProps({
  tipo: { type: String, required: true }, // 'desafio' | 'missao' | 'conteudo'
})

// TODO: trocar os dados mockados por chamadas à API
// dados: [nome, descrição, ativo, quantidade em uso]
const CONFIG = {
  desafio: {
    titulo: 'Tipo de desafio',
    descricao: 'Configuração de categorias e regras dos desafios.',
    novo: 'Novo tipo de desafio',
    editar: 'Editar tipo de desafio',
    descNovo: 'Preencha os dados abaixo para cadastrar um novo tipo de desafio.',
    placeholderNome: 'Ex.: Desafio em equipe',
    placeholderDesc: 'Descreva as regras deste tipo...',
    usadoEm: 'desafios',
    icone: Flame,
    dados: [
      ['Individual', 'Desafio cumprido por um participante, com registro próprio.', true, 18],
      ['Em equipe', 'Participantes se juntam para atingir uma meta coletiva.', true, 9],
      ['Semanal', 'Desafio recorrente com reinício a cada segunda-feira.', true, 12],
      ['Relâmpago', 'Prazo curto de 24 horas, com bônus de XP.', false, 0],
    ],
  },
  missao: {
    titulo: 'Tipo de missão',
    descricao: 'Organização de formatos e templates de missão.',
    novo: 'Novo tipo de missão',
    editar: 'Editar tipo de missão',
    descNovo: 'Preencha os dados abaixo para cadastrar um novo tipo de missão.',
    placeholderNome: 'Ex.: Missão com foto',
    placeholderDesc: 'Descreva o formato desta missão...',
    usadoEm: 'missões',
    icone: Layers,
    dados: [
      ['Individual', 'Missão realizada sozinho e validada pelo próprio usuário.', true, 64],
      ['Com foto', 'A conclusão exige o envio de uma foto como comprovação.', true, 31],
      ['Quiz', 'Perguntas de múltipla escolha sobre o tema da missão.', true, 14],
      ['Coletiva', 'Missão em grupo, com progresso compartilhado.', false, 0],
    ],
  },
  conteudo: {
    titulo: 'Tipo de conteúdo educativo',
    descricao: 'Categorias, formatos e taxonomia dos conteúdos.',
    novo: 'Novo tipo de conteúdo',
    editar: 'Editar tipo de conteúdo',
    descNovo: 'Preencha os dados abaixo para cadastrar um novo tipo de conteúdo.',
    placeholderNome: 'Ex.: Infográfico',
    placeholderDesc: 'Descreva o formato deste conteúdo...',
    usadoEm: 'conteúdos',
    icone: Folder,
    dados: [
      ['Artigo', 'Texto de leitura com imagens e referências.', true, 22],
      ['Guia prático', 'Passo a passo para aplicar uma prática sustentável.', true, 15],
      ['Infográfico', 'Conteúdo visual com dados resumidos.', true, 8],
      ['Vídeo', 'Conteúdo em vídeo com duração de até 10 minutos.', false, 0],
    ],
  },
}
const cfg = CONFIG[props.tipo]

const periodo = ref('30')
const busca = ref('')
const modalAberto = ref(false)
const itens = ref(
  cfg.dados.map(([nome, descricao, ativo, usos], i) => ({ id: i + 1, nome, descricao, ativo, usos })),
)

const filtrados = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  return itens.value.filter((i) => i.nome.toLowerCase().includes(termo))
})

const vazio = () => ({ id: null, nome: '', descricao: '', status: 'ativo' })
const form = reactive(vazio())
const erro = ref('')

function abrirNovo() {
  Object.assign(form, vazio())
  erro.value = ''
  modalAberto.value = true
}
function abrirEdicao(item) {
  Object.assign(form, {
    id: item.id,
    nome: item.nome,
    descricao: item.descricao,
    status: item.ativo ? 'ativo' : 'inativo',
  })
  erro.value = ''
  modalAberto.value = true
}
function mostrarTodos() {
  busca.value = ''
  modalAberto.value = false
}
function salvar() {
  const nome = form.nome.trim()
  const repetido = itens.value.some(
    (i) => i.id !== form.id && i.nome.toLowerCase() === nome.toLowerCase(),
  )
  if (repetido) {
    erro.value = 'Já existe um tipo com esse nome. Escolha outro nome.'
    return
  }
  const dados = { nome, descricao: form.descricao.trim(), ativo: form.status === 'ativo' }
  if (form.id) {
    Object.assign(itens.value.find((i) => i.id === form.id), dados)
  } else {
    itens.value.unshift({ id: Date.now(), usos: 0, ...dados })
  }
  modalAberto.value = false
}
function excluir(item) {
  if (item.usos > 0) {
    window.alert(`"${item.nome}" está em uso em ${item.usos} ${cfg.usadoEm}. Desative o tipo em vez de excluir.`)
    return
  }
  if (window.confirm(`Excluir "${item.nome}"?`)) {
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
        Cadastrar Tipo
      </button>
      <button type="button" class="pn-aba" :class="{ 'pn-aba--ativa': !modalAberto }" @click="mostrarTodos">
        <component :is="cfg.icone" :size="18" aria-hidden="true" />
        Mostrar todos os Tipos
      </button>
    </div>

    <div class="pn-stat">
      <div class="pn-stat-topo">
        <span>Tipos Cadastrados</span>
        <span class="pn-stat-icone"><component :is="cfg.icone" :size="18" aria-hidden="true" /></span>
      </div>
      <strong>{{ itens.length }}</strong>
    </div>

    <h2 class="pn-secao-titulo">Buscar Tipo</h2>
    <label class="pn-busca">
      <Search :size="18" aria-hidden="true" />
      <input v-model="busca" type="search" placeholder="Buscar pelo Nome" aria-label="Buscar Tipo" />
    </label>

    <p v-if="!filtrados.length" class="pn-vazio">Nenhum tipo encontrado.</p>

    <div v-else class="lista">
      <article v-for="item in filtrados" :key="item.id" class="card">
        <div class="card-topo">
          <span class="card-icone"><component :is="cfg.icone" :size="16" aria-hidden="true" /></span>
          <span class="tag" :class="item.ativo ? 'tag--verde' : 'tag--cinza'">
            {{ item.ativo ? 'Ativo' : 'Inativo' }}
          </span>
        </div>

        <h3>{{ item.nome }}</h3>
        <p class="texto">{{ item.descricao }}</p>
        <p class="uso">{{ item.usos }} {{ cfg.usadoEm }} em uso</p>

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
        <span>Nome</span>
        <input v-model="form.nome" type="text" required :placeholder="cfg.placeholderNome" />
      </label>
      <label class="pn-campo">
        <span>Descrição</span>
        <input v-model="form.descricao" type="text" required :placeholder="cfg.placeholderDesc" />
      </label>
      <label class="pn-campo">
        <span>Status</span>
        <select v-model="form.status">
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      </label>
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
  padding: 16px;
  border: 1px solid #dfeae3;
  border-radius: 16px;
  background: #fff;
}
.card-topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
.tag {
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}
.tag--verde {
  background: #dff3e5;
  color: #1b7a34;
}
.tag--cinza {
  background: #e9eeeb;
  color: #5b6f62;
}
h3 {
  margin: 14px 0 4px;
  font-size: 18px;
  font-weight: 700;
  color: #14301f;
}
.texto {
  margin: 0;
  min-height: 38px;
  font-size: 13px;
  line-height: 1.4;
  color: #6b7f72;
}
.uso {
  margin: 12px 0 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4ece7;
  font-size: 12px;
  font-weight: 600;
  color: #1b7a34;
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
.erro {
  margin: 0 0 12px;
  font-size: 13px;
  color: #c62828;
}
</style>
