<script setup>
import { computed, reactive, ref } from 'vue'
import { Plus, Search, Pencil, Users, UserCheck, UserX, UserPlus } from 'lucide-vue-next'
import PageHeader from '@/components/PageHeader.vue'
import ModalForm from '@/components/ModalForm.vue'

// TODO: trocar os dados mockados por chamadas à API
const perfis = ['Administrador', 'Moderador', 'Participante']

const periodo = ref('30')
const busca = ref('')
const filtroPerfil = ref('')
const modalAberto = ref(false)
const itens = ref([
  { id: 1, nome: 'Marina Duarte', email: 'marina.duarte@email.com', matricula: '2024001', perfil: 'Administrador', ativo: true, dias: 120 },
  { id: 2, nome: 'Rafael Nogueira', email: 'rafael.nogueira@email.com', matricula: '2024014', perfil: 'Moderador', ativo: true, dias: 64 },
  { id: 3, nome: 'Camila Prado', email: 'camila.prado@email.com', matricula: '2025032', perfil: 'Participante', ativo: true, dias: 5 },
  { id: 4, nome: 'Bruno Tavares', email: 'bruno.tavares@email.com', matricula: '2025047', perfil: 'Participante', ativo: false, dias: 3 },
  { id: 5, nome: 'Letícia Moraes', email: 'leticia.moraes@email.com', matricula: '2025051', perfil: 'Participante', ativo: true, dias: 2 },
])

const totalAtivos = computed(() => itens.value.filter((i) => i.ativo).length)
const novos = computed(() => itens.value.filter((i) => i.dias <= 7).length)

const filtrados = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  return itens.value.filter((i) => {
    const bateBusca =
      !termo ||
      i.nome.toLowerCase().includes(termo) ||
      i.email.toLowerCase().includes(termo) ||
      i.matricula.includes(termo)
    return bateBusca && (!filtroPerfil.value || i.perfil === filtroPerfil.value)
  })
})

const vazio = () => ({ id: null, nome: '', email: '', matricula: '', perfil: '' })
const form = reactive(vazio())
const erro = ref('')

function iniciais(nome) {
  return nome.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('')
}
function abrirNovo() {
  Object.assign(form, vazio())
  erro.value = ''
  modalAberto.value = true
}
function abrirEdicao(item) {
  const { id, nome, email, matricula, perfil } = item
  Object.assign(form, { id, nome, email, matricula, perfil })
  erro.value = ''
  modalAberto.value = true
}
function mostrarTodos() {
  busca.value = ''
  filtroPerfil.value = ''
  modalAberto.value = false
}
function salvar() {
  const email = form.email.trim().toLowerCase()
  const matricula = form.matricula.trim()
  const outros = itens.value.filter((i) => i.id !== form.id)
  if (outros.some((i) => i.email.toLowerCase() === email)) {
    erro.value = 'Já existe um usuário com esse e-mail.'
    return
  }
  if (outros.some((i) => i.matricula === matricula)) {
    erro.value = 'Já existe um usuário com essa matrícula.'
    return
  }
  const dados = { nome: form.nome.trim(), email, matricula, perfil: form.perfil }
  if (form.id) {
    Object.assign(itens.value.find((i) => i.id === form.id), dados)
  } else {
    itens.value.unshift({ id: Date.now(), ativo: true, dias: 0, ...dados })
  }
  modalAberto.value = false
}
function alternarStatus(item) {
  const acao = item.ativo ? 'Desativar' : 'Ativar'
  if (window.confirm(`${acao} o acesso de ${item.nome}?`)) item.ativo = !item.ativo
}
function exportar() {
  // TODO: exportar relatório do período selecionado
  console.log('exportar usuários', periodo.value)
}
</script>

<template>
  <div class="pn-pagina">
    <PageHeader
      v-model="periodo"
      titulo="Usuários"
      descricao="Perfis, permissões e acompanhamento de usuários."
      @exportar="exportar"
    />

    <div class="pn-abas">
      <button type="button" class="pn-aba" :class="{ 'pn-aba--ativa': modalAberto }" @click="abrirNovo">
        <Plus :size="18" aria-hidden="true" />
        Cadastrar Usuário
      </button>
      <button type="button" class="pn-aba" :class="{ 'pn-aba--ativa': !modalAberto }" @click="mostrarTodos">
        <Users :size="18" aria-hidden="true" />
        Mostrar todos os Usuários
      </button>
    </div>

    <div class="stats">
      <div class="pn-stat">
        <div class="pn-stat-topo">
          <span>Usuários Cadastrados</span>
          <span class="pn-stat-icone"><Users :size="18" aria-hidden="true" /></span>
        </div>
        <strong>{{ itens.length }}</strong>
      </div>
      <div class="pn-stat">
        <div class="pn-stat-topo">
          <span>Usuários Ativos</span>
          <span class="pn-stat-icone"><UserCheck :size="18" aria-hidden="true" /></span>
        </div>
        <strong>{{ totalAtivos }}</strong>
      </div>
      <div class="pn-stat">
        <div class="pn-stat-topo">
          <span>Novos em 7 dias</span>
          <span class="pn-stat-icone"><UserPlus :size="18" aria-hidden="true" /></span>
        </div>
        <strong>{{ novos }}</strong>
      </div>
    </div>

    <h2 class="pn-secao-titulo">Buscar Usuário</h2>
    <div class="filtros">
      <label class="pn-busca">
        <Search :size="18" aria-hidden="true" />
        <input v-model="busca" type="search" placeholder="Buscar por nome, e-mail ou matrícula" aria-label="Buscar Usuário" />
      </label>
      <label class="filtro">
        <select v-model="filtroPerfil" aria-label="Filtrar por perfil">
          <option value="">Todos os perfis</option>
          <option v-for="p in perfis" :key="p" :value="p">{{ p }}</option>
        </select>
      </label>
    </div>

    <p v-if="!filtrados.length" class="pn-vazio">Nenhum usuário encontrado.</p>

    <div v-else class="tabela-caixa">
      <table>
        <thead>
          <tr>
            <th>Usuário</th>
            <th>Matrícula</th>
            <th>Perfil</th>
            <th>Status</th>
            <th class="col-acoes">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in filtrados" :key="u.id">
            <td>
              <div class="usuario">
                <span class="avatar" aria-hidden="true">{{ iniciais(u.nome) }}</span>
                <div>
                  <strong>{{ u.nome }}</strong>
                  <small>{{ u.email }}</small>
                </div>
              </div>
            </td>
            <td>{{ u.matricula }}</td>
            <td>{{ u.perfil }}</td>
            <td>
              <span class="tag" :class="u.ativo ? 'tag--verde' : 'tag--cinza'">
                {{ u.ativo ? 'Ativo' : 'Inativo' }}
              </span>
            </td>
            <td class="col-acoes">
              <button type="button" class="acao" :aria-label="`Editar ${u.nome}`" @click="abrirEdicao(u)">
                <Pencil :size="14" aria-hidden="true" />Editar
              </button>
              <button
                type="button"
                class="acao"
                :class="u.ativo ? 'acao--perigo' : 'acao--ok'"
                @click="alternarStatus(u)"
              >
                <component :is="u.ativo ? UserX : UserCheck" :size="14" aria-hidden="true" />
                {{ u.ativo ? 'Desativar' : 'Ativar' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ModalForm
      :aberto="modalAberto"
      :titulo="form.id ? 'Editar Usuário' : 'Novo Usuário'"
      :descricao="form.id ? 'Altere os dados abaixo e salve.' : 'Preencha os dados abaixo para cadastrar um novo usuário.'"
      @cancelar="modalAberto = false"
      @salvar="salvar"
    >
      <label class="pn-campo">
        <span>Nome completo</span>
        <input v-model="form.nome" type="text" required autocomplete="off" placeholder="Nome do usuário" />
      </label>
      <label class="pn-campo">
        <span>E-mail</span>
        <input v-model="form.email" type="email" required autocomplete="off" placeholder="usuario@email.com" />
      </label>
      <div class="pn-grid-2">
        <label class="pn-campo">
          <span>Matrícula</span>
          <input v-model="form.matricula" type="text" inputmode="numeric" required placeholder="2025000" />
        </label>
        <label class="pn-campo">
          <span>Perfil</span>
          <select v-model="form.perfil" required>
            <option value="" disabled>Selecione...</option>
            <option v-for="p in perfis" :key="p" :value="p">{{ p }}</option>
          </select>
        </label>
      </div>
      <p v-if="erro" class="erro" role="alert">{{ erro }}</p>
    </ModalForm>
  </div>
</template>

<style scoped>
.stats {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
}
.filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}
.filtros .pn-busca {
  flex: 1 1 320px;
  margin-bottom: 0;
}
.filtro select {
  height: 40px;
  min-width: 190px;
  padding: 0 12px;
  border: 1px solid #d5e6da;
  border-radius: 8px;
  background: #fff;
  font: inherit;
  font-size: 14px;
  color: #14301f;
  cursor: pointer;
}
.filtro select:focus {
  outline: 0;
  border-color: #07843f;
  box-shadow: 0 0 0 3px rgba(7, 132, 63, 0.18);
}

.tabela-caixa {
  overflow-x: auto;
  border: 1px solid #dfeae3;
  border-radius: 16px;
  background: #fff;
}
table {
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
  font-size: 14px;
  color: #14301f;
}
th {
  padding: 14px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #4b6254;
  background: #f4faf5;
  border-bottom: 1px solid #e4ece7;
}
td {
  padding: 12px 16px;
  border-bottom: 1px solid #eef3ef;
}
tbody tr:last-child td {
  border-bottom: 0;
}
.usuario {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  display: grid;
  place-items: center;
  flex: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #cdeed7;
  color: #0e6b30;
  font-size: 13px;
  font-weight: 700;
}
.usuario strong {
  display: block;
  font-weight: 600;
}
.usuario small {
  color: #6b7f72;
}
.col-acoes {
  text-align: right;
  white-space: nowrap;
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
.acao {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  margin-left: 8px;
  padding: 0 12px;
  border: 1px solid #b9dcc4;
  border-radius: 6px;
  background: #fff;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  color: #1b7a34;
  cursor: pointer;
}
.acao:hover {
  background: #f1faf3;
}
.acao:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}
.acao--perigo {
  border-color: #f0b4b0;
  background: #fff5f4;
  color: #c62828;
}
.acao--perigo:hover {
  background: #fde8e8;
}
.erro {
  margin: 0 0 12px;
  font-size: 13px;
  color: #c62828;
}
</style>
