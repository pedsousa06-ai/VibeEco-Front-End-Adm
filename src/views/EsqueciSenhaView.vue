<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/components/AuthLayout.vue'

const router = useRouter()

const email = ref('')
const erro = ref('')
const carregando = ref(false)

async function enviar() {
  erro.value = ''

  if (!/^\S+@\S+\.\S+$/.test(email.value)) {
    erro.value = 'Informe um e-mail válido.'
    return
  }

  carregando.value = true
  try {
    // TODO: chamar a API que envia o código para o e-mail informado
    router.push('/verificar-codigo')
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <form class="conteudo" novalidate @submit.prevent="enviar">
      <h1 class="auth-titulo">Redefina a sua Senha</h1>
      <p class="auth-subtitulo subtitulo">
        Informe o seu e-mail e enviaremos as instruções para você criar uma nova senha.
      </p>

      <label class="campo">
        <span class="auth-label">E-mail</span>
        <div class="auth-entrada">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">
            <rect x="2" y="5" width="20" height="14" rx="1.5" />
            <path d="m2.5 6 9.5 7 9.5-7" />
          </svg>
          <input v-model="email" type="email" autocomplete="email" placeholder="seu@gmail.com" />
        </div>
      </label>

      <p v-if="erro" class="auth-erro" role="alert">{{ erro }}</p>

      <button class="auth-botao botao" type="submit" :disabled="carregando">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 3 3 10.5l6.5 2.5L12 20l3-5.5L21 3Z" />
          <path d="M9.5 13 21 3" />
        </svg>
        {{ carregando ? 'Enviando...' : 'Enviar instruções' }}
      </button>

      <div class="ou"><span>ou</span></div>

      <div class="rodape">
        <RouterLink class="auth-voltar" to="/login">
          <svg viewBox="0 0 28 16" fill="currentColor" aria-hidden="true">
            <path d="M10 1 1 8l9 7v-4.5h17v-5H10V1Z" />
          </svg>
          Voltar para o login
        </RouterLink>
      </div>
    </form>
  </AuthLayout>
</template>

<style scoped>
.conteudo {
  padding: 25px 0 60px;
}
.subtitulo {
  max-width: 410px;
  margin: 17px auto 0;
}
.campo {
  display: block;
  margin-top: 26px;
}
.botao {
  margin-top: 32px;
}
.ou {
  display: flex;
  align-items: center;
  gap: 53px;
  margin-top: 30px;
  font-size: 14px;
  line-height: 17px;
  color: #111;
}
.ou::before,
.ou::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #000;
}
.rodape {
  margin-top: 39px;
  text-align: center;
}
</style>