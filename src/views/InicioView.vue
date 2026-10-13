<script setup>
import { ref } from 'vue'
import {
  Target, Flame, Users, ChartNoAxesGantt, Layers, Folder, Flag, BookOpen, CircleX,
  Calendar, ChevronDown, ChevronRight, Download,
} from 'lucide-vue-next'

// TODO: trocar pelos dados da API quando existir
const periodo = ref('30')
const periodos = [
  { valor: '7', nome: 'Últimos 7 dias' },
  { valor: '30', nome: 'Últimos 30 dias' },
  { valor: '90', nome: 'Últimos 90 dias' },
]

const metricas = [
  { titulo: 'Missões ativas', valor: '128', nota: '+12% em relação ao mês anterior', icone: Target },
  { titulo: 'Desafios', valor: '46', nota: '18 novos lançados esta semana', icone: Flame },
  { titulo: 'Usuários', valor: '3.2k', nota: '241 novos cadastros nos últimos 7 dias', icone: Users },
  { titulo: 'Progresso geral', valor: '84%', nota: 'Conclusão média das missões em andamento', icone: ChartNoAxesGantt },
]

const atalhos = [
  { titulo: 'Missões', texto: 'Gerenciar missões, status e participação.', to: '/missoes', icone: Target },
  { titulo: 'Tipo de desafio', texto: 'Configurar categorias e regras de desafio.', to: '/tipos-de-desafio', icone: Flame },
  { titulo: 'Tipo de missão', texto: 'Organizar formatos e templates de missão.', to: '/tipos-de-missao', icone: Layers },
  { titulo: 'Desafios', texto: 'Monitorar desafios, prazos e conclusão.', to: '/desafios', icone: Flag },
  { titulo: 'Tipo de conteúdo educativo', texto: 'Categorias, formatos e taxonomia de conteúdo.', to: '/tipos-de-conteudo', icone: Folder },
  { titulo: 'Usuários', texto: 'Perfis, permissões e acompanhamento de usuários.', to: '/usuarios', icone: Users },
  { titulo: 'Conteúdo educativo', texto: 'Biblioteca de materiais, guias e conteúdos.', to: '/conteudo', icone: BookOpen },
  { titulo: 'Progresso geral', texto: 'Visão consolidada de avanço, conclusão e engajamento.', to: '/progresso', icone: CircleX },
]

function exportar() {
  // TODO: exportar relatório do período selecionado
  console.log('exportar período:', periodo.value)
}
</script>

<template>
  <div class="inicio">
    <header class="cabecalho">
      <div>
        <h1>Início</h1>
        <p class="descricao">Visão geral do painel administrativo com atalhos, métricas e navegação refinada.</p>
      </div>

      <div class="acoes">
        <label class="seletor">
          <Calendar :size="18" aria-hidden="true" />
          <select v-model="periodo" aria-label="Período">
            <option v-for="p in periodos" :key="p.valor" :value="p.valor">{{ p.nome }}</option>
          </select>
          <ChevronDown :size="16" aria-hidden="true" />
        </label>
        <button class="exportar" type="button" aria-label="Exportar relatório" @click="exportar">
          <Download :size="18" />
        </button>
      </div>
    </header>

    <section class="metricas" aria-label="Métricas">
      <div v-for="m in metricas" :key="m.titulo" class="metrica">
        <div class="metrica-cartao">
          <div class="metrica-topo">
            <span>{{ m.titulo }}</span>
            <span class="icone"><component :is="m.icone" :size="18" aria-hidden="true" /></span>
          </div>
          <strong>{{ m.valor }}</strong>
        </div>
        <p class="metrica-nota">{{ m.nota }}</p>
      </div>
    </section>

    <section aria-labelledby="titulo-atalhos">
      <h2 id="titulo-atalhos">Atalhos</h2>
      <p class="descricao">Acesso rápido aos principais módulos do painel.</p>

      <div class="atalhos">
        <router-link v-for="a in atalhos" :key="a.titulo" :to="a.to" class="atalho">
          <span class="icone icone--grande"><component :is="a.icone" :size="24" aria-hidden="true" /></span>
          <span class="atalho-texto">
            <strong>{{ a.titulo }}</strong>
            <small>{{ a.texto }}</small>
          </span>
          <ChevronRight :size="18" class="seta" aria-hidden="true" />
        </router-link>
      </div>
    </section>
  </div>
</template>

<style scoped>
.inicio {
  max-width: 1080px;
}

h1 {
  margin: 0;
  font-size: 32px;
  line-height: 1.2;
  font-weight: 700;
  color: #14301f;
}
h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #14301f;
}
.descricao {
  margin: 4px 0 0;
  font-size: 15px;
  color: #5b6f62;
}

.cabecalho {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}
.acoes {
  display: flex;
  gap: 12px;
}
.seletor {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 44px;
  padding: 0 14px;
  border: 1px solid #b9dcc4;
  border-radius: 10px;
  background: #fff;
  color: #14301f;
}
.seletor:focus-within {
  border-color: #07843f;
  box-shadow: 0 0 0 3px rgba(7, 132, 63, 0.18);
}
.seletor select {
  appearance: none;
  min-width: 150px;
  border: 0;
  outline: 0;
  background: transparent;
  font: inherit;
  font-size: 15px;
  color: inherit;
  cursor: pointer;
}
.exportar {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 1px solid #1ba52f;
  border-radius: 10px;
  background: #fff;
  color: #1ba52f;
  cursor: pointer;
  transition: background 0.15s;
}
.exportar:hover {
  background: #f1faf3;
}
.exportar:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}

/* Métricas */
.metricas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 18px;
  margin-bottom: 40px;
}
.metrica-cartao {
  padding: 16px 18px 18px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(20, 48, 31, 0.06);
}
.metrica-topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: #3d5446;
}
.metrica-cartao strong {
  display: block;
  margin-top: 16px;
  font-size: 32px;
  line-height: 1.1;
  font-weight: 700;
  color: #14301f;
}
.metrica-nota {
  margin: 8px 4px 0;
  font-size: 13px;
  line-height: 1.35;
  color: #5b6f62;
}

.icone {
  display: grid;
  place-items: center;
  flex: none;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #cdeed7;
  color: #0e8a3a;
}
.icone--grande {
  width: 48px;
  height: 48px;
  border-radius: 12px;
}

/* Atalhos */
.atalhos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 18px;
  margin-top: 20px;
}
.atalho {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 130px;
  padding: 20px;
  box-sizing: border-box;
  border-radius: 14px;
  background: #fff;
  color: inherit;
  text-decoration: none;
  box-shadow: 0 2px 8px rgba(20, 48, 31, 0.06);
  transition: box-shadow 0.15s;
}
.atalho:hover {
  box-shadow: 0 6px 18px rgba(20, 48, 31, 0.14);
}
.atalho:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}
.atalho-texto {
  flex: 1;
  min-width: 0;
}
.atalho-texto strong {
  display: block;
  font-size: 17px;
  font-weight: 700;
  color: #14301f;
}
.atalho-texto small {
  display: block;
  margin-top: 4px;
  font-size: 13px;
  line-height: 1.35;
  color: #5b6f62;
}
.seta {
  flex: none;
  color: #7a8c81;
}

@media (max-width: 600px) {
  h1 {
    font-size: 26px;
  }
}
</style>
