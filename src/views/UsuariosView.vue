
<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Users,
  UserCheck,
  UserX,
  UserPlus,
} from 'lucide-vue-next'

import PageHeader from '@/components/PageHeader.vue'
import ModalForm from '@/components/ModalForm.vue'

import {
  listarUsuarios,
  listarPerfis,
  criarUsuario,
  atualizarUsuario,
  alterarStatusUsuario,
  excluirUsuario,
} from '@/services/usuarios'

const perfis = ref([])
const periodo = ref('30')
const busca = ref('')
const filtroPerfil = ref('')
const modalAberto = ref(false)
const carregando = ref(false)
const salvando = ref(false)
const erroLista = ref('')
const itens = ref([])

const erro = ref('')

function validarId(id) {
  return (
    id !== null &&
    id !== undefined &&
    id !== '' &&
    Number.isInteger(Number(id)) &&
    Number(id) > 0
  )
}

async function carregar() {
  carregando.value = true
  erroLista.value = ''

  try {
    const [usuarios, listaPerfis] = await Promise.all([
      listarUsuarios(),
      listarPerfis(),
    ])

    itens.value = usuarios.filter((usuario) => {
      if (!validarId(usuario.id)) {
        console.warn('Usuário recebido sem ID válido:', usuario)
        return false
      }

      return true
    })

    perfis.value = listaPerfis
  } catch (err) {
    console.error('Erro ao carregar usuários:', err)
    erroLista.value = err.message || 'Não foi possível carregar os usuários.'
  } finally {
    carregando.value = false
  }
}

onMounted(carregar)

const totalAtivos = computed(() =>
  itens.value.filter((i) => i.ativo).length
)

const novos = computed(() =>
  itens.value.filter((i) => i.dias <= 7).length
)

const filtrados = computed(() => {
  const termo = busca.value.trim().toLowerCase()

  return itens.value.filter((i) => {
    const bateBusca =
      !termo ||
      String(i.nome || '').toLowerCase().includes(termo) ||
      String(i.email || '').toLowerCase().includes(termo) ||
      String(i.matricula || '').includes(termo)

    return bateBusca && (
      !filtroPerfil.value || i.perfil === filtroPerfil.value
    )
  })
})

const vazio = () => ({
  id: null,
  nome: '',
  email: '',
  senha: '',
  id_nivel_acesso: '',
})

const form = reactive(vazio())

function iniciais(nome) {
  return String(nome || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')
}

function abrirNovo() {
  Object.assign(form, vazio())
  erro.value = ''
  modalAberto.value = true
}

function abrirEdicao(item) {
  if (!validarId(item.id)) {
    erroLista.value = 'Não foi possível editar: ID do usuário inválido.'
    return
  }

  const perfil = perfis.value.find(
    (p) => Number(p.id) === Number(item.id_nivel_acesso)
  ) || perfis.value.find(
    (p) => p.nivel === item.perfil
  )

  Object.assign(form, {
    id: Number(item.id),
    nome: item.nome,
    email: item.email,
    senha: '',
    id_nivel_acesso: perfil ? perfil.id : '',
  })

  erro.value = ''
  modalAberto.value = true
}

function mostrarTodos() {
  busca.value = ''
  filtroPerfil.value = ''
  modalAberto.value = false
}

async function salvar() {
  erro.value = ''

  const dados = {
    nome: form.nome.trim(),
    email: form.email.trim().toLowerCase(),
    id_nivel_acesso: Number(form.id_nivel_acesso),
  }

  if (!dados.nome || !dados.email || !dados.id_nivel_acesso) {
    erro.value = 'Preencha todos os campos obrigatórios.'
    return
  }

  if (
    form.id !== null &&
    form.id !== undefined &&
    !validarId(form.id)
  ) {
    erro.value = 'O ID do usuário é inválido.'
    return
  }

  if (
    itens.value.some(
      (i) =>
        Number(i.id) !== Number(form.id) &&
        i.email.toLowerCase() === dados.email
    )
  ) {
    erro.value = 'Já existe um usuário com esse e-mail.'
    return
  }

  if (form.id === null && (
    form.senha.length < 8 ||
    form.senha.length > 25
  )) {
    erro.value = 'A senha inicial deve ter de 8 a 25 caracteres.'
    return
  }

  salvando.value = true

  try {
    if (form.id !== null) {
      await atualizarUsuario(Number(form.id), dados)
    } else {
      await criarUsuario({
        ...dados,
        senha: form.senha,
      })
    }

    modalAberto.value = false
    Object.assign(form, vazio())

    await carregar()
  } catch (e) {
    console.error('Erro ao salvar usuário:', e)
    erro.value = e.message || 'Não foi possível salvar o usuário.'
  } finally {
    salvando.value = false
  }
}

async function alternarStatus(item) {
  if (!validarId(item.id)) {
    erroLista.value = 'Não foi possível alterar: ID do usuário inválido.'
    return
  }

  const acao = item.ativo ? 'Desativar' : 'Ativar'

  if (!window.confirm(`${acao} o acesso de ${item.nome}?`)) {
    return
  }

  erroLista.value = ''

  try {
    await alterarStatusUsuario(Number(item.id), !item.ativo)

    item.ativo = !item.ativo
  } catch (e) {
    console.error('Erro ao alterar status:', e)
    erroLista.value = e.message || 'Não foi possível alterar o status.'
  }
}

async function remover(item) {
  if (!validarId(item.id)) {
    erroLista.value = 'Não foi possível excluir: ID do usuário inválido.'
    console.error('Usuário com ID inválido:', item)
    return
  }

  if (!window.confirm(
    `Excluir ${item.nome}? Essa ação não pode ser desfeita.`
  )) {
    return
  }

  erroLista.value = ''

  try {
    await excluirUsuario(Number(item.id))

    itens.value = itens.value.filter(
      (i) => Number(i.id) !== Number(item.id)
    )
  } catch (e) {
    console.error('Erro ao excluir usuário:', e)
    erroLista.value = e.message || 'Não foi possível excluir o usuário.'
  }
}

function exportar() {
  console.log('Exportar usuários:', periodo.value)
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
      <button
        type="button"
        class="pn-aba"
        :class="{ 'pn-aba--ativa': modalAberto }"
        @click="abrirNovo"
      >
        <Plus :size="18" aria-hidden="true" />
        Cadastrar Usuário
      </button>

      <button
        type="button"
        class="pn-aba"
        :class="{ 'pn-aba--ativa': !modalAberto }"
        @click="mostrarTodos"
      >
        <Users :size="18" aria-hidden="true" />
        Mostrar todos os Usuários
      </button>
    </div>

    <div class="stats">
      <div class="pn-stat">
        <div class="pn-stat-topo">
          <span>Usuários Cadastrados</span>
          <span class="pn-stat-icone">
            <Users :size="18" aria-hidden="true" />
          </span>
        </div>
        <strong>{{ itens.length }}</strong>
      </div>

      <div class="pn-stat">
        <div class="pn-stat-topo">
          <span>Usuários Ativos</span>
          <span class="pn-stat-icone">
            <UserCheck :size="18" aria-hidden="true" />
          </span>
        </div>
        <strong>{{ totalAtivos }}</strong>
      </div>

      <div class="pn-stat">
        <div class="pn-stat-topo">
          <span>Novos em 7 dias</span>
          <span class="pn-stat-icone">
            <UserPlus :size="18" aria-hidden="true" />
          </span>
        </div>
        <strong>{{ novos }}</strong>
      </div>
    </div>

    <h2 class="pn-secao-titulo">Buscar Usuário</h2>

    <div class="filtros">
      <label class="pn-busca">
        <Search :size="18" aria-hidden="true" />

        <input
          v-model="busca"
          type="search"
          placeholder="Buscar por nome, e-mail ou matrícula"
          aria-label="Buscar Usuário"
        />
      </label>

      <label class="filtro">
        <select v-model="filtroPerfil" aria-label="Filtrar por perfil">
          <option value="">Todos os perfis</option>

          <option
            v-for="p in perfis"
            :key="p.id"
            :value="p.nivel"
          >
            {{ p.nivel }}
          </option>
        </select>
      </label>
    </div>

    <p v-if="erroLista" class="erro" role="alert">
      {{ erroLista }}
    </p>

    <p v-if="carregando" class="pn-vazio" role="status">
      Carregando usuários...
    </p>

    <p
      v-else-if="!filtrados.length"
      class="pn-vazio"
    >
      Nenhum usuário encontrado.
    </p>

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
          <tr
            v-for="u in filtrados"
            :key="u.id"
          >
            <td>
              <div class="usuario">
                <span class="avatar" aria-hidden="true">
                  {{ iniciais(u.nome) }}
                </span>

                <div>
                  <strong>{{ u.nome }}</strong>
                  <small>{{ u.email }}</small>
                </div>
              </div>
            </td>

            <td>{{ u.matricula }}</td>
            <td>{{ u.perfil }}</td>

            <td>
              <span
                class="tag"
                :class="u.ativo ? 'tag--verde' : 'tag--cinza'"
              >
                {{ u.ativo ? 'Ativo' : 'Inativo' }}
              </span>
            </td>

            <td class="col-acoes">
              <button
                type="button"
                class="acao"
                :aria-label="`Editar ${u.nome}`"
                @click="abrirEdicao(u)"
              >
                <Pencil :size="14" aria-hidden="true" />
                Editar
              </button>

              <button
                type="button"
                class="acao"
                :class="u.ativo ? 'acao--perigo' : 'acao--ok'"
                @click="alternarStatus(u)"
              >
                <component
                  :is="u.ativo ? UserX : UserCheck"
                  :size="14"
                  aria-hidden="true"
                />

                {{ u.ativo ? 'Desativar' : 'Ativar' }}
              </button>

              <button
                type="button"
                class="acao acao--perigo"
                :aria-label="`Excluir ${u.nome}`"
                @click="remover(u)"
              >
                <Trash2 :size="14" aria-hidden="true" />
                Excluir
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ModalForm
      :aberto="modalAberto"
      :titulo="form.id ? 'Editar Usuário' : 'Novo Usuário'"
      :descricao="
        form.id
          ? 'Altere os dados abaixo e salve.'
          : 'Preencha os dados abaixo para cadastrar um novo usuário.'
      "
      :salvando="salvando"
      @cancelar="modalAberto = false"
      @salvar="salvar"
    >
      <label class="pn-campo">
        <span>Nome completo</span>
        <input
          v-model="form.nome"
          type="text"
          required
          autocomplete="off"
          placeholder="Nome do usuário"
        />
      </label>

      <label class="pn-campo">
        <span>E-mail</span>
        <input
          v-model="form.email"
          type="email"
          required
          autocomplete="off"
          placeholder="usuario@email.com"
        />
      </label>

      <label
        v-if="form.id === null"
        class="pn-campo"
      >
        <span>Senha inicial</span>
        <input
          v-model="form.senha"
          type="password"
          required
          minlength="8"
          maxlength="25"
          autocomplete="new-password"
          placeholder="De 8 a 25 caracteres"
        />
      </label>

      <label class="pn-campo">
        <span>Perfil</span>

        <select
          v-model="form.id_nivel_acesso"
          required
        >
          <option value="" disabled>Selecione...</option>

          <option
            v-for="p in perfis"
            :key="p.id"
            :value="p.id"
          >
            {{ p.nivel }}
          </option>
        </select>
      </label>

      <p v-if="erro" class="erro" role="alert">
        {{ erro }}
      </p>
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
