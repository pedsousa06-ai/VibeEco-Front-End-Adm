<script setup>
import logo from '@/assets/vibeeco-logo.svg'
import fundo from '@/assets/fundo-folhas.png'
</script>

<template>
  <main class="tela" :style="{ '--fundo': `url(${fundo})` }">
    <header class="marca">
      <img class="logo" :src="logo" alt="VibeEco" />
      <p class="subtitulo-marca">Painel Administrativo</p>
    </header>

    <div class="cartao">
      <slot />
    </div>
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
  gap: 76px;
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
.logo {
  display: block;
  width: 380px;
  max-width: 85vw;
  height: auto;
  margin: 0 auto;
}
.subtitulo-marca {
  margin: 14px 0 0;
  font-size: 20px;
  font-weight: 600;
}

.cartao {
  width: 100%;
  max-width: 549px;
  margin: 0 auto auto;
  box-sizing: border-box;
  padding: 0 54px;
  background: #fff;
  border-radius: 28px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
}

@media (max-width: 600px) {
  .tela {
    gap: 40px;
  }
  .logo {
    width: 270px;
  }
  .cartao {
    padding: 0 20px;
  }
}
</style>

<!-- Estilos compartilhados das telas de autenticação (prefixo auth- evita conflito) -->
<style>
.auth-titulo {
  margin: 0;
  font-size: 24px;
  line-height: 29px;
  font-weight: 600;
  color: #000;
  text-align: center;
}
.auth-subtitulo {
  margin: 0;
  font-size: 18px;
  line-height: 24px;
  color: #111;
  text-align: center;
}
.auth-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 17px;
  color: #111;
}
.auth-label--grande {
  font-size: 16px;
  line-height: 19px;
  margin-bottom: 6px;
}

.auth-entrada {
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
.auth-entrada:focus-within {
  border-color: #07843f;
  box-shadow: 0 0 0 3px rgba(7, 132, 63, 0.18);
}
.auth-entrada svg {
  flex: none;
  width: 26px;
  height: 26px;
}
.auth-entrada input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  font: inherit;
  font-size: 16px;
  color: #222;
}
.auth-entrada input::placeholder {
  color: #8f8f8f;
}

.auth-botao {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 51px;
  border: 2px solid #07843f;
  border-radius: 8px;
  background: #07843f;
  color: #fff;
  font: inherit;
  font-size: 24px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.auth-botao svg {
  width: 30px;
  height: 30px;
  flex: none;
}
.auth-botao:hover:not(:disabled) {
  background: #066f35;
}
.auth-botao:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}
.auth-botao:disabled {
  opacity: 0.7;
  cursor: wait;
}
.auth-botao--contorno {
  border-color: #1ba52f;
  background: #fff;
  color: #1ba52f;
  font-size: 20px;
  font-weight: 400;
}
.auth-botao--contorno strong {
  font-weight: 600;
  color: #0b4d24;
}
.auth-botao--contorno:hover:not(:disabled) {
  background: #f1faf3;
}

.auth-voltar {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  font-size: 18px;
  line-height: 24px;
  color: #1ba52f;
  text-decoration: none;
  cursor: pointer;
}
.auth-voltar svg {
  width: 26px;
  height: 15px;
}
.auth-voltar:hover {
  text-decoration: underline;
}
.auth-voltar:focus-visible {
  outline: 2px solid #1ba52f;
  outline-offset: 3px;
  border-radius: 2px;
}

.auth-erro,
.auth-info {
  margin: 10px 0 0;
  font-size: 14px;
  text-align: left;
}
.auth-erro {
  color: #c62828;
}
.auth-info {
  color: #1ba52f;
}
</style>