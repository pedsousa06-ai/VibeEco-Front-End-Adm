<script setup>
import { onMounted, reactive, ref } from 'vue'
import { obterPerfil, atualizarPerfil, alterarSenha } from '@/services/auth'
import { preferencias, salvarPreferencias } from '@/services/preferencias'

// Perfil e senha vêm da API (tabela de administradores).
// Workspace e notificações ainda não existem no banco: ficam salvos neste navegador (ver services/preferencias.js).
const perfil = reactive({ id: null, email: '', nivel: '', matricula: '' })
const carregando = ref(true)
const salvando = ref('') // nome da seção que está salvando
const senha = reactive({ atual: '', nova: '', confirmar: '' })

const mensagem = ref({ secao: '', texto: '', erro: false })
let timer

function avisar(secao, texto, erro = false) {
  clearTimeout(timer)
  mensagem.value = { secao, texto, erro }
  if (!erro) timer = setTimeout(() => (mensagem.value = { secao: '', texto: '', erro: false }), 4000)
}

function preencherPerfil(adm) {
  Object.assign(perfil, {
    id: adm.id,
    email: adm.email,
    nivel: adm.nivel_acesso || '',
    matricula: String(adm.id).padStart(4, '0'),
  })
}

onMounted(async () => {
  try {
    preencherPerfil(await obterPerfil())
  } catch (e) {
    avisar('perfil', e.message || 'Não foi possível carregar o perfil.', true)
  } finally {
    carregando.value = false
  }
})

async function salvarPerfil() {
  salvando.value = 'perfil'
  try {
    preencherPerfil(await atualizarPerfil(perfil.email))
    avisar('perfil', 'Perfil atualizado.')
  } catch (e) {
    avisar('perfil', e.message || 'Não foi possível atualizar o perfil.', true)
  } finally {
    salvando.value = ''
  }
}

function salvarWorkspace() {
  preferencias.workspace = preferencias.workspace.trim() || 'VibeEco Admin'
  salvarPreferencias()
  avisar('workspace', 'Workspace atualizado.')
}

function salvarNotificacoes() {
  salvarPreferencias()
  avisar('notificacoes', 'Preferências salvas.')
}

async function trocarSenha() {
  if (senha.nova.length < 8) {
    avisar('senha', 'A nova senha precisa ter pelo menos 8 caracteres.', true)
    return
  }
  if (senha.nova !== senha.confirmar) {
    avisar('senha', 'A confirmação não é igual à nova senha.', true)
    return
  }
  salvando.value = 'senha'
  try {
    await alterarSenha(senha.atual, senha.nova)
    Object.assign(senha, { atual: '', nova: '', confirmar: '' })
    avisar('senha', 'Senha alterada.')
  } catch (e) {
    avisar('senha', e.message || 'Não foi possível alterar a senha.', true)
  } finally {
    salvando.value = ''
  }
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
        <p class="sub">Dados de acesso da sua conta de administrador.</p>
        <div class="pn-grid-2">
          <label class="pn-campo">
            <span>E-mail</span>
            <input v-model="perfil.email" type="email" required autocomplete="email" :disabled="carregando" />
          </label>
          <label class="pn-campo">
            <span>Nível de acesso</span>
            <input :value="perfil.nivel" type="text" readonly />
          </label>
        </div>
        <label class="pn-campo campo-curto">
          <span>Matrícula</span>
          <input :value="perfil.matricula" type="text" readonly aria-describedby="dica-matricula" />
          <small id="dica-matricula">A matrícula não pode ser alterada.</small>
        </label>
        <div class="rodape">
          <button type="submit" class="btn" :disabled="carregando || salvando === 'perfil'">
            {{ salvando === 'perfil' ? 'Salvando...' : 'Salvar perfil' }}
          </button>
          <p
            v-if="mensagem.secao === 'perfil'"
            class="aviso"
            :class="{ 'aviso--erro': mensagem.erro }"
            :role="mensagem.erro ? 'alert' : 'status'"
          >
            {{ mensagem.texto }}
          </p>
        </div>
      </form>

      <form class="secao" @submit.prevent="salvarWorkspace">
        <h2>Workspace</h2>
        <p class="sub">Nome mostrado no menu lateral do painel (salvo neste navegador).</p>
        <label class="pn-campo campo-curto">
          <span>Nome do workspace</span>
          <input v-model="preferencias.workspace" type="text" required maxlength="40" />
        </label>
        <div class="rodape">
          <button type="submit" class="btn">Salvar workspace</button>
          <p v-if="mensagem.secao === 'workspace'" class="aviso" role="status">{{ mensagem.texto }}</p>
        </div>
      </form>

      <form class="secao" @submit.prevent="salvarNotificacoes">
        <h2>Notificações</h2>
        <p class="sub">Escolha quando o painel deve avisar você (salvo neste navegador).</p>
        <ul class="interruptores">
          <li>
            <label>
              <span>
                <strong>Novos cadastros</strong>
                <small>Aviso quando um usuário se cadastrar.</small>
              </span>
              <input v-model="preferencias.notificacoes.cadastros" type="checkbox" role="switch" />
            </label>
          </li>
          <li>
            <label>
              <span>
                <strong>Missões concluídas</strong>
                <small>Aviso quando uma missão atingir 100% de conclusão.</small>
              </span>
              <input v-model="preferencias.notificacoes.conclusoes" type="checkbox" role="switch" />
            </label>
          </li>
          <li>
            <label>
              <span>
                <strong>Relatório semanal</strong>
                <small>Resumo de engajamento enviado toda segunda-feira.</small>
              </span>
              <input v-model="preferencias.notificacoes.relatorio" type="checkbox" role="switch" />
            </label>
          </li>
        </ul>
        <div class="rodape">
          <button type="submit" class="btn">Salvar preferências</button>
          <p v-if="mensagem.secao === 'notificacoes'" class="aviso" role="status">{{ mensagem.texto }}</p>
        </div>
      </form>

      <form class="secao" @submit.prevent="trocarSenha">
        <h2>Segurança</h2>
        <p class="sub">Use uma senha com pelo menos 8 caracteres.</p>
        <label class="pn-campo campo-curto">
          <span>Senha atual</span>
          <input v-model="senha.atual" type="password" required autocomplete="current-password" />
        </label>
        <div class="pn-grid-2">
          <label class="pn-campo">
            <span>Nova senha</span>
            <input v-model="senha.nova" type="password" required minlength="8" maxlength="64" autocomplete="new-password" />
          </label>
          <label class="pn-campo">
            <span>Confirmar nova senha</span>
            <input v-model="senha.confirmar" type="password" required minlength="8" maxlength="64" autocomplete="new-password" />
          </label>
        </div>
        <div class="rodape">
          <button type="submit" class="btn" :disabled="salvando === 'senha'">
            {{ salvando === 'senha' ? 'Alterando...' : 'Alterar senha' }}
          </button>
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
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
