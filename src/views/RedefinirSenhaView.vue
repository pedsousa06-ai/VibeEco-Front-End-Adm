<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import logo from '@/assets/vibeeco-logo.png'
import fundo from '@/assets/fundo-folhas.png'

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
    // TODO: chamar sua API para salvar a nova senha
    router.push('/login')
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <main class="tela" :style="{ '--fundo': `url(${fundo})` }">
    <header class="marca">
      <img class="logo" :src="logo" alt="VibeEco" />
      <p class="subtitulo">Painel Administrativo</p>
    </header>

    <form class="cartao" @submit.prevent="salvar">
      <svg class="alerta" viewBox="0 0 64 58" aria-hidden="true">
        <path
          d="M29.2 4.5a3.5 3.5 0 0 1 5.6 0l27 46.5a3.5 3.5 0 0 1-2.8 5.2H5a3.5 3.5 0 0 1-2.8-5.2l27-46.5Z"
          fill="#FFB400"
        />
        <rect x="29.5" y="20" width="5" height="19" rx="2.5" fill="#333" />
        <circle cx="32" cy="46" r="3" fill="#333" />
      </svg>

      <h1>Atenção!</h1>
      <p class="aviso">Para continuar, é necessário trocar a senha padrão.</p>

      <label class="campo">
        <span>Nova senha</span>
        <div class="entrada">
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

      <label class="campo">
        <span>Confirmar nova senha</span>
        <div class="entrada">
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

      <p v-if="erro" class="erro" role="alert">{{ erro }}</p>

      <button type="submit" :disabled="carregando">
        {{ carregando ? 'Salvando...' : 'Salvar' }}
      </button>
    </form>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.tela {
  position: fixed;
  inset: 0;
  width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 60px;
  padding: 32px 16px;
  box-sizing: border-box;
  font-family: 'Inter', system-ui, sans-serif;
  background-color: #021a0a;
  background-image:
    linear-gradient(rgba(0, 25, 10, 0.55), rgba(0, 25, 10, 0.55)),
    var(--fundo);
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

/* margin auto centraliza o conjunto sem cortar o topo em telas baixas */
.marca {
  margin: auto auto 0;
  text-align: center;
  color: #fff;
}
.cartao {
  margin: 0 auto auto;
}

/* Marca */
.logo {
  display: block;
  width: 380px;
  max-width: 85vw;
  height: auto;
  margin: 0 auto;
}
.subtitulo {
  margin: 14px 0 0;
  font-size: 20px;
  font-weight: 600;
}

/* Cartão */
.cartao {
  width: 100%;
  max-width: 549px;
  box-sizing: border-box;
  padding: 36px 54px 55px;
  background: #fff;
  border-radius: 28px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
  text-align: center;
}
.alerta {
  width: 60px;
  height: 54px;
}
.cartao h1 {
  margin: 8px 0 10px;
  font-size: 24px;
  font-weight: 600;
  color: #000;
}
.aviso {
  max-width: 270px;
  margin: 0 auto 30px;
  font-size: 16px;
  line-height: 1.3;
  color: #111;
}

.campo {
  display: block;
  margin-bottom: 26px;
  text-align: left;
}
.campo > span {
  display: block;
  margin-bottom: 7px;
  font-size: 16px;
  color: #111;
}

.entrada {
  display: flex;
  align-items: center;
  gap: 14px;
  height: 51px;
  padding: 0 20px;
  border: 1px solid #c9c9c9;
  border-radius: 8px;
  background: #fff;
  color: #b5b5b5;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.entrada:focus-within {
  border-color: #07843f;
  box-shadow: 0 0 0 3px rgba(7, 132, 63, 0.18);
}
.entrada svg {
  flex: none;
  width: 26px;
  height: 26px;
}
.entrada input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  font: inherit;
  font-size: 16px;
  color: #222;
}
.entrada input::placeholder {
  color: #8f8f8f;
}

.erro {
  margin: -10px 0 14px;
  font-size: 14px;
  text-align: left;
  color: #c62828;
}

button {
  display: block;
  width: 100%;
  height: 51px;
  margin-top: 9px;
  border: 0;
  border-radius: 8px;
  background: #07843f;
  color: #fff;
  font: inherit;
  font-size: 24px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
button:hover:not(:disabled) {
  background: #066f35;
}
button:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}
button:disabled {
  opacity: 0.7;
  cursor: wait;
}

@media (max-width: 600px) {
  .tela {
    gap: 40px;
  }
  .logo {
    width: 270px;
  }
  .cartao {
    padding: 28px 20px 32px;
  }
}
</style>