<script setup>
import logo from '@/assets/vibeeco-logo.svg'
import { House, Users, Target, Flag, BookOpen, Settings, Leaf, Search, Bell } from 'lucide-vue-next'

const menu = [
  { nome: 'Início', to: '/painel', icone: House, exato: true },
  { nome: 'Usuários', to: '/usuarios', icone: Users },
  { nome: 'Missões', to: '/missoes', icone: Target },
  { nome: 'Desafios', to: '/desafios', icone: Flag },
  { nome: 'Conteúdo', to: '/conteudo', icone: BookOpen },
  { nome: 'Configurações', to: '/configuracoes', icone: Settings },
]
</script>

<template>
  <div class="admin">
    <header class="topo">
      <router-link to="/painel" class="topo-logo" aria-label="VibeEco - Início">
        <img :src="logo" alt="VibeEco" />
      </router-link>

      <div class="topo-busca">
        <label class="busca">
          <Search :size="18" aria-hidden="true" />
          <input type="search" placeholder="Buscar no painel" />
        </label>
        <button class="sino" type="button" aria-label="Notificações">
          <Bell :size="18" />
        </button>
      </div>
    </header>

    <div class="corpo">
      <aside class="lateral">
        <div class="workspace">
          <span class="workspace-icone"><Leaf :size="20" /></span>
          <div>
            <small>Workspace</small>
            <strong>VibeEco Admin</strong>
          </div>
        </div>

        <nav class="menu" aria-label="Navegação principal">
          <router-link
            v-for="item in menu"
            :key="item.to"
            :to="item.to"
            class="menu-item"
            :exact-active-class="item.exato ? 'ativo' : ''"
            :active-class="item.exato ? '' : 'ativo'"
          >
            <component :is="item.icone" :size="20" aria-hidden="true" />
            <span>{{ item.nome }}</span>
          </router-link>
        </nav>
      </aside>

      <main class="conteudo">
        <router-view />
      </main>
    </div>

    <footer class="rodape">Developers vibeEco</footer>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.admin {
  --verde-escuro: #1a3d2b;
  --verde-menu: #214a35;
  --verde-ativo: #1fa84a;
  --verde-texto: #1ba52f;
  --fundo: #eaf5ec;

  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', system-ui, sans-serif;
  background: var(--fundo);
  color: #14301f;
}

/* Header */
.topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 88px;
  padding: 0 32px 0 56px;
  background: var(--verde-escuro);
}
.topo-logo img {
  display: block;
  height: 52px;
  width: auto;
}
.topo-busca {
  display: flex;
  align-items: stretch;
  width: 314px;
  max-width: 50vw;
  height: 44px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  overflow: hidden;
}
.busca {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  color: #cfe5d6;
}
.busca input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  font: inherit;
  font-size: 14px;
  color: #fff;
}
.busca input::placeholder {
  color: #cfe5d6;
}
.busca:focus-within {
  box-shadow: inset 0 0 0 2px #1fe05a;
}
.sino {
  display: grid;
  place-items: center;
  width: 44px;
  border: 0;
  border-left: 1px solid rgba(255, 255, 255, 0.12);
  background: transparent;
  color: #1fe05a;
  cursor: pointer;
}
.sino:hover {
  background: rgba(255, 255, 255, 0.08);
}
.sino:focus-visible {
  outline: 2px solid #1fe05a;
  outline-offset: -2px;
}

/* Corpo */
.corpo {
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 48px;
  padding: 24px 32px 24px 24px;
}

/* Menu lateral */
.lateral {
  position: sticky;
  top: 24px;
  flex: none;
  width: 248px;
  padding: 20px;
  box-sizing: border-box;
  border-radius: 24px;
  background: var(--verde-escuro);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
}
.workspace {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  color: #fff;
}
.workspace-icone {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--verde-menu);
  color: #1fe05a;
}
.workspace small {
  display: block;
  font-size: 12px;
  color: #b9d3c2;
}
.workspace strong {
  font-size: 16px;
  font-weight: 600;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 48px;
  padding: 0 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.15s;
}
.menu-item:hover {
  background: rgba(255, 255, 255, 0.09);
}
.menu-item:focus-visible {
  outline: 2px solid #1fe05a;
  outline-offset: 2px;
}
.menu-item.ativo {
  border-color: var(--verde-ativo);
  background: var(--verde-ativo);
  font-weight: 700;
}

.conteudo {
  flex: 1;
  min-width: 0;
}

/* Rodapé */
.rodape {
  display: grid;
  place-items: center;
  height: 72px;
  background: var(--verde-escuro);
  color: #b9d3c2;
  font-size: 14px;
  font-weight: 600;
}

@media (max-width: 900px) {
  .topo {
    padding: 0 16px;
  }
  .topo-logo img {
    height: 40px;
  }
  .corpo {
    flex-direction: column;
    gap: 24px;
    padding: 16px;
  }
  .lateral {
    position: static;
    width: 100%;
  }
  .menu {
    flex-direction: row;
    flex-wrap: wrap;
  }
  .menu-item {
    flex: 1 1 140px;
  }
  .conteudo {
    width: 100%;
  }
}
</style>
