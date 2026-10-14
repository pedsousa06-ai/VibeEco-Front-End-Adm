<script setup>
import { reactive, ref } from 'vue'

// TODO: carregar e salvar pela API
const perfil = reactive({ nome: 'Marina Duarte', email: 'marina.duarte@email.com', matricula: '2024001' })
const workspace = reactive({ nome: 'VibeEco Admin' })
const notificacoes = reactive({
  cadastros: true,
  conclusoes: true,
  relatorio: false,
})
const senha = reactive({ atual: '', nova: '', confirmar: '' })

const mensagem = ref({ secao: '', texto: '', erro: false })
let timer

function avisar(secao, texto, erro = false) {
  clearTimeout(timer)
  mensagem.value = { secao, texto, erro }
  if (!erro) timer = setTimeout(() => (mensagem.value = { secao: '', texto: '', erro: false }), 4000)
}

function salvarPerfil() {
  // TODO: PUT /perfil
  avisar('perfil', 'Perfil atualizado.')
}
function salvarWorkspace() {
  // TODO: PUT /workspace
  avisar('workspace', 'Workspace atualizado.')
}
function salvarNotificacoes() {
  // TODO: PUT /notificacoes
  avisar('notificacoes', 'Preferências salvas.')
}
function alterarSenha() {
  if (senha.nova.length < 8) {
    avisar('senha', 'A nova senha precisa ter pelo menos 8 caracteres.', true)
    return
  }
  if (senha.nova !== senha.confirmar) {
    avisar('senha', 'A confirmação não é igual à nova senha.', true)
    return
  }
  // TODO: POST /alterar-senha
  Object.assign(senha, { atual: '', nova: '', confirmar: '' })
  avisar('senha', 'Senha alterada.')
}
</script>

<template>
  <div class="pn-pagina">
    <header class="cabecalho">
      <h1>Configurações</h1>
      <p class="descricao">Dados da conta, preferências de aviso e segurança de acesso.</p>
    </header>

    <div class="secoes">
      <form class="secao" @submit.prevent="salvarPerfil">
        <h2>Perfil</h2>
        <p class="sub">Informações exibidas para os outros administradores.</p>
        <div class="pn-grid-2">
          <label class="pn-campo">
            <span>Nome completo</span>
            <input v-model="perfil.nome" type="text" required autocomplete="name" />
          </label>
          <label class="pn-campo">
            <span>E-mail</span>
            <input v-model="perfil.email" type="email" required autocomplete="email" />
          </label>
        </div>
        <label class="pn-campo campo-curto">
          <span>Matrícula</span>
          <input v-model="perfil.matricula" type="text" readonly aria-describedby="dica-matricula" />
          <small id="dica-matricula">A matrícula não pode ser alterada.</small>
        </label>
        <div class="rodape">
          <button type="submit" class="btn">Salvar perfil</button>
          <p v-if="mensagem.secao === 'perfil'" class="aviso" role="status">{{ mensagem.texto }}</p>
        </div>
      </form>

      <form class="secao" @submit.prevent="salvarWorkspace">
        <h2>Workspace</h2>
        <p class="sub">Nome mostrado no menu lateral do painel.</p>
        <label class="pn-campo campo-curto">
          <span>Nome do workspace</span>
          <input v-model="workspace.nome" type="text" required />
        </label>
        <div class="rodape">
          <button type="submit" class="btn">Salvar workspace</button>
          <p v-if="mensagem.secao === 'workspace'" class="aviso" role="status">{{ mensagem.texto }}</p>
        </div>
      </form>

      <form class="secao" @submit.prevent="salvarNotificacoes">
        <h2>Notificações</h2>
        <p class="sub">Escolha quando o painel deve avisar você.</p>
        <ul class="interruptores">
          <li>
            <label>
              <span>
                <strong>Novos cadastros</strong>
                <small>Aviso quando um usuário se cadastrar.</small>
              </span>
              <input v-model="notificacoes.cadastros" type="checkbox" role="switch" />
            </label>
          </li>
          <li>
            <label>
              <span>
                <strong>Missões concluídas</strong>
                <small>Aviso quando uma missão atingir 100% de conclusão.</small>
              </span>
              <input v-model="notificacoes.conclusoes" type="checkbox" role="switch" />
            </label>
          </li>
          <li>
            <label>
              <span>
                <strong>Relatório semanal</strong>
                <small>Resumo de engajamento enviado toda segunda-feira.</small>
              </span>
              <input v-model="notificacoes.relatorio" type="checkbox" role="switch" />
            </label>
          </li>
        </ul>
        <div class="rodape">
          <button type="submit" class="btn">Salvar preferências</button>
          <p v-if="mensagem.secao === 'notificacoes'" class="aviso" role="status">{{ mensagem.texto }}</p>
        </div>
      </form>

      <form class="secao" @submit.prevent="alterarSenha">
        <h2>Segurança</h2>
        <p class="sub">Use uma senha com pelo menos 8 caracteres.</p>
        <label class="pn-campo campo-curto">
          <span>Senha atual</span>
          <input v-model="senha.atual" type="password" required autocomplete="current-password" />
        </label>
        <div class="pn-grid-2">
          <label class="pn-campo">
            <span>Nova senha</span>
            <input v-model="senha.nova" type="password" required autocomplete="new-password" />
          </label>
          <label class="pn-campo">
            <span>Confirmar nova senha</span>
            <input v-model="senha.confirmar" type="password" required autocomplete="new-password" />
          </label>
        </div>
        <div class="rodape">
          <button type="submit" class="btn">Alterar senha</button>
          <p
            v-if="mensagem.secao === 'senha'"
            class="aviso"
            :class="{ 'aviso--erro': mensagem.erro }"
            :role="mensagem.erro ? 'alert' : 'status'"
          >
            {{ mensagem.texto }}
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
h1 {
  margin: 0;
  font-size: 32px;
  line-height: 1.2;
  font-weight: 700;
  color: #14301f;
}
.descricao {
  margin: 4px 0 0;
  font-size: 15px;
  color: #5b6f62;
}
.cabecalho {
  margin-bottom: 24px;
}
.secoes {
  display: grid;
  gap: 24px;
}
.secao {
  padding: 24px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(20, 48, 31, 0.06);
}
.secao h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #14301f;
}
.sub {
  margin: 4px 0 18px;
  font-size: 14px;
  color: #5b6f62;
}
.campo-curto {
  max-width: 320px;
}
.pn-campo input[readonly] {
  background: #f1f5f2;
  color: #5b6f62;
}
.pn-campo small {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #6b7f72;
}

.rodape {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 8px;
}
.btn {
  height: 40px;
  padding: 0 22px;
  border: 0;
  border-radius: 8px;
  background: #12a31b;
  color: #fff;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.btn:hover {
  background: #0f8f18;
}
.btn:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}
.aviso {
  margin: 0;
  font-size: 14px;
  color: #1b7a34;
}
.aviso--erro {
  color: #c62828;
}

.interruptores {
  margin: 0 0 12px;
  padding: 0;
  list-style: none;
}
.interruptores li + li {
  border-top: 1px solid #eef3ef;
}
.interruptores label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 0;
  cursor: pointer;
}
.interruptores strong {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #14301f;
}
.interruptores small {
  font-size: 13px;
  color: #6b7f72;
}
.interruptores input[type='checkbox'] {
  appearance: none;
  position: relative;
  flex: none;
  width: 44px;
  height: 24px;
  margin: 0;
  border-radius: 99px;
  background: #c9d6cd;
  cursor: pointer;
  transition: background 0.15s;
}
.interruptores input[type='checkbox']::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.15s;
}
.interruptores input[type='checkbox']:checked {
  background: #12a31b;
}
.interruptores input[type='checkbox']:checked::after {
  transform: translateX(20px);
}
.interruptores input[type='checkbox']:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}

@media (max-width: 600px) {
  h1 {
    font-size: 26px;
  }
  .secao {
    padding: 18px;
  }
}
</style>
