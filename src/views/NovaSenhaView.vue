<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/components/AuthLayout.vue'

const router = useRouter()

const novaSenha = ref('')
const confirmarSenha = ref('')
const erro = ref('')
const carregando = ref(false)

async function salvar() {
  erro.value = ''

  if (novaSenha.value.length < 8) {
    erro.value = 'A senha precisa ter pelo menos 8 caracteres.'
    return
  }
  if (novaSenha.value !== confirmarSenha.value) {
    erro.value = 'As senhas não conferem.'
    return
  }

  carregando.value = true
  try {
    // TODO: chamar a API para salvar a nova senha
    router.push('/login')
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <form class="conteudo" @submit.prevent="salvar">
      <h1 class="auth-titulo">Crie uma nova senha</h1>
      <p class="auth-subtitulo subtitulo">Escolha uma senha segura para proteger a sua conta</p>

      <label class="campo campo-primeiro">
        <span class="auth-label auth-label--grande">Nova senha</span>
        <div class="auth-entrada">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">
            <rect x="5" y="10" width="14" height="11" rx="1" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
          <input
            v-model="novaSenha"
            type="password"
            autocomplete="new-password"
            placeholder="Digite a sua senha"
          />
        </div>
      </label>

      <label class="campo campo-segundo">
        <span class="auth-label auth-label--grande">Confirmar nova senha</span>
        <div class="auth-entrada">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">
            <rect x="5" y="10" width="14" height="11" rx="1" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
          <input
            v-model="confirmarSenha"
            type="password"
            autocomplete="new-password"
            placeholder="Digite a sua senha"
          />
        </div>
      </label>

      <p v-if="erro" class="auth-erro" role="alert">{{ erro }}</p>

      <button class="auth-botao botao" type="submit" :disabled="carregando">
        {{ carregando ? 'Salvando...' : 'Salvar' }}
      </button>
    </form>
  </AuthLayout>
</template>

<style scoped>
.conteudo {
  padding: 31px 0 41px;
}
.subtitulo {
  max-width: 260px;
  margin: 15px auto 0;
  font-size: 16px;
  line-height: 19px;
}
.campo {
  display: block;
}
.campo-primeiro {
  margin-top: 26px;
}
.campo-segundo {
  margin-top: 25px;
}
.botao {
  margin-top: 51px;
}
</style>