<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/components/AuthLayout.vue'

const router = useRouter()

const TAMANHO = 6
const digitos = ref(Array(TAMANHO).fill(''))
const caixas = []
const erro = ref('')
const info = ref('')
const carregando = ref(false)

function aoDigitar(i, evento) {
  const valor = evento.target.value.replace(/\D/g, '').slice(-1)
  digitos.value[i] = valor
  evento.target.value = valor
  if (valor && i < TAMANHO - 1) caixas[i + 1]?.focus()
}

function aoTeclar(i, evento) {
  if (evento.key === 'Backspace' && !digitos.value[i] && i > 0) {
    caixas[i - 1]?.focus()
  } else if (evento.key === 'ArrowLeft' && i > 0) {
    caixas[i - 1]?.focus()
  } else if (evento.key === 'ArrowRight' && i < TAMANHO - 1) {
    caixas[i + 1]?.focus()
  }
}

function colar(evento) {
  const texto = evento.clipboardData.getData('text').replace(/\D/g, '').slice(0, TAMANHO)
  if (!texto) return
  digitos.value = Array.from({ length: TAMANHO }, (_, i) => texto[i] ?? '')
  caixas[Math.min(texto.length, TAMANHO - 1)]?.focus()
}

async function verificar() {
  erro.value = ''
  info.value = ''

  const codigo = digitos.value.join('')
  if (codigo.length < TAMANHO) {
    erro.value = `Digite os ${TAMANHO} dígitos do código.`
    return
  }

  carregando.value = true
  try {
    // TODO: chamar a API para validar o código
    router.push('/nova-senha')
  } finally {
    carregando.value = false
  }
}

function reenviar() {
  erro.value = ''
  // TODO: chamar a API para reenviar o código
  info.value = 'Enviamos um novo código para o seu e-mail.'
}
</script>

<template>
  <AuthLayout>
    <form class="conteudo" @submit.prevent="verificar">
      <h1 class="auth-titulo">Verifique seu acesso</h1>
      <p class="auth-subtitulo subtitulo">
        Enviamos um código de acesso para o e-mail cadastrado
      </p>

      <div class="campo">
        <span id="rotulo-codigo" class="auth-label">Código de verificação</span>
        <div class="codigo" role="group" aria-labelledby="rotulo-codigo" @paste.prevent="colar">
          <input
            v-for="(_, i) in digitos"
            :key="i"
            :ref="(el) => (caixas[i] = el)"
            class="caixa"
            type="text"
            inputmode="numeric"
            maxlength="1"
            :autocomplete="i === 0 ? 'one-time-code' : 'off'"
            :aria-label="`Dígito ${i + 1}`"
            :value="digitos[i]"
            @input="aoDigitar(i, $event)"
            @keydown="aoTeclar(i, $event)"
            @focus="$event.target.select()"
          />
        </div>
      </div>

      <p v-if="erro" class="auth-erro" role="alert">{{ erro }}</p>
      <p v-if="info" class="auth-info" role="status">{{ info }}</p>

      <button class="auth-botao botao-verificar" type="submit" :disabled="carregando">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">
          <path d="M12 2.5 4 5.5v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10v-6l-8-3Z" />
          <circle cx="12" cy="10.5" r="1.4" />
          <path d="M12 12v3" />
        </svg>
        {{ carregando ? 'Verificando...' : 'Verificar código' }}
      </button>

      <button class="auth-botao auth-botao--contorno botao-reenviar" type="button" @click="reenviar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M20 12a8 8 0 1 1-2.4-5.7" />
          <path d="M20 4v5h-5" />
        </svg>
        <span>Não recebeu o código? <strong>Reenviar</strong></span>
      </button>

      <div class="rodape">
        <RouterLink class="auth-voltar" to="/esqueci-senha">
          <svg viewBox="0 0 28 16" fill="currentColor" aria-hidden="true">
            <path d="M10 1 1 8l9 7v-4.5h17v-5H10V1Z" />
          </svg>
          Voltar
        </RouterLink>
      </div>
    </form>
  </AuthLayout>
</template>

<style scoped>
.conteudo {
  padding: 21px 0 32px;
}
.subtitulo {
  max-width: 360px;
  margin: 18px auto 0;
}
.campo {
  margin-top: 31px;
}

.codigo {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}
.caixa {
  flex: 0 1 51px;
  min-width: 0;
  height: 51px;
  box-sizing: border-box;
  padding: 0;
  border: 1px solid #c9c9c9;
  border-radius: 8px;
  background: #fff;
  outline: 0;
  font: inherit;
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  color: #222;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.caixa:focus {
  border-color: #07843f;
  box-shadow: 0 0 0 3px rgba(7, 132, 63, 0.18);
}

.botao-verificar {
  margin-top: 31px;
}
.botao-reenviar {
  margin-top: 31px;
}
.rodape {
  margin-top: 39px;
  text-align: center;
}
</style>