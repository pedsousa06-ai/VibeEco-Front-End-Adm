<script setup>
import { ref } from 'vue'
import logo from '@/assets/vibeeco-logo.png'
import fundo from '@/assets/fundo-folhas.png'

const login = ref('')
const senha = ref('')
const carregando = ref(false)

function primeiroAcesso() {
  // TODO: levar para a tela de primeiro acesso, ex.: router.push('/primeiro-acesso')
  console.log('primeiro acesso')
}

async function entrar() {
  if (!login.value || !senha.value) return
  carregando.value = true
  try {
    // TODO: chamar sua API de autenticação aqui
    console.log('login:', login.value)
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

    <form class="cartao" @submit.prevent="entrar">
      <h1>Entrar na plataforma</h1>

      <label class="campo">
        <span>E-mail ou CNPJ</span>
        <div class="entrada">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">
            <rect x="2" y="5" width="20" height="14" rx="1.5" />
            <path d="m2.5 6 9.5 7 9.5-7" />
          </svg>
          <input
            v-model="login"
            type="text"
            autocomplete="username"
            placeholder="seu@gmail.com ou matricula"
          />
        </div>
      </label>

      <label class="campo">
        <span>Senha</span>
        <div class="entrada">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">
            <rect x="5" y="10" width="14" height="11" rx="1" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
          <input
            v-model="senha"
            type="password"
            autocomplete="current-password"
            placeholder="Digite a sua senha"
          />
        </div>
      </label>

      <a href="#" class="primeiro-acesso" @click.prevent="primeiroAcesso">
        Primeiro Acesso? Clique aqui
      </a>

      <button type="submit" :disabled="carregando">
        {{ carregando ? 'Entrando...' : 'Entrar' }}
      </button>
    </form>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.tela {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 76px;
  padding: 32px 16px;
  box-sizing: border-box;
  font-family: 'Inter', system-ui, sans-serif;
  /* A imagem é semitransparente: ela se mistura com o verde escuro por baixo */
  background-color: #021a0a;
  background-image:
    linear-gradient(rgba(0, 25, 10, 0.55), rgba(0, 25, 10, 0.55)),
    var(--fundo);
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

/* Marca */
.marca {
  text-align: center;
  color: #fff;
}
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
  padding: 32px 54px 55px 37px;
  background: #fff;
  border-radius: 28px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
}
.cartao h1 {
  margin: 0 0 40px;
  font-size: 24px;
  font-weight: 600;
  color: #000;
}

.campo {
  display: block;
  margin-left: 17px;
  margin-bottom: 18px;
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

.primeiro-acesso {
  display: inline-block;
  margin: 2px 0 0 20px;
  font-size: 16px;
  font-weight: 600;
  color: #1ba52f;
  text-decoration: none;
}
.primeiro-acesso:hover {
  text-decoration: underline;
}
.primeiro-acesso:focus-visible {
  outline: 2px solid #1ba52f;
  outline-offset: 3px;
  border-radius: 2px;
}

button {
  display: block;
  width: calc(100% - 17px);
  height: 51px;
  margin: 18px 0 0 17px;
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
    padding: 24px 20px 32px;
  }
  .campo,
  button {
    margin-left: 0;
  }
  .primeiro-acesso {
    margin-left: 4px;
  }
  button {
    width: 100%;
  }
}
</style>