<script setup>
import { computed, ref } from 'vue'
import { ChartNoAxesGantt, CircleCheck, Users, Zap } from 'lucide-vue-next'
import PageHeader from '@/components/PageHeader.vue'

// TODO: trocar os dados mockados por chamadas à API
const periodo = ref('30')

const porPeriodo = {
  7: { conclusao: 78, concluidas: 214, ativos: 640, xp: '38k' },
  30: { conclusao: 84, concluidas: 962, ativos: 2100, xp: '174k' },
  90: { conclusao: 81, concluidas: 2740, ativos: 3050, xp: '502k' },
}
const dados = computed(() => porPeriodo[periodo.value])

const metricas = computed(() => [
  { titulo: 'Conclusão média', valor: `${dados.value.conclusao}%`, nota: 'Das missões em andamento', icone: ChartNoAxesGantt },
  { titulo: 'Missões concluídas', valor: dados.value.concluidas.toLocaleString('pt-BR'), nota: 'No período selecionado', icone: CircleCheck },
  { titulo: 'Usuários engajados', valor: dados.value.ativos.toLocaleString('pt-BR'), nota: 'Com ao menos uma atividade', icone: Users },
  { titulo: 'XP distribuído', valor: dados.value.xp, nota: 'Total entregue em recompensas', icone: Zap },
])

const categorias = [
  { nome: 'Reciclagem', valor: 91 },
  { nome: 'Energia', valor: 84 },
  { nome: 'Água', valor: 77 },
  { nome: 'Mobilidade', valor: 62 },
  { nome: 'Alimentação', valor: 58 },
]
const missoes = [
  { nome: 'Descarte Consciente', valor: 94 },
  { nome: 'Luz Apagada', valor: 88 },
  { nome: 'Banho de 5 minutos', valor: 71 },
  { nome: 'Semana sem Plástico', valor: 46 },
]
const ranking = [
  { nome: 'Camila Prado', xp: 2450, missoes: 31 },
  { nome: 'Rafael Nogueira', xp: 2210, missoes: 28 },
  { nome: 'Letícia Moraes', xp: 1980, missoes: 25 },
  { nome: 'Marina Duarte', xp: 1740, missoes: 22 },
  { nome: 'Bruno Tavares', xp: 1520, missoes: 19 },
]

function exportar() {
  // TODO: exportar relatório do período selecionado
  console.log('exportar progresso', periodo.value)
}
</script>

<template>
  <div class="pn-pagina">
    <PageHeader
      v-model="periodo"
      titulo="Progresso geral"
      descricao="Visão consolidada de avanço, conclusão e engajamento."
      @exportar="exportar"
    />

    <section class="metricas" aria-label="Métricas do período">
      <div v-for="m in metricas" :key="m.titulo" class="metrica">
        <div class="pn-stat">
          <div class="pn-stat-topo">
            <span>{{ m.titulo }}</span>
            <span class="pn-stat-icone"><component :is="m.icone" :size="18" aria-hidden="true" /></span>
          </div>
          <strong>{{ m.valor }}</strong>
        </div>
        <p class="nota">{{ m.nota }}</p>
      </div>
    </section>

    <div class="painel">
      <section class="bloco" aria-labelledby="t-cat">
        <h2 id="t-cat">Conclusão por categoria</h2>
        <ul class="barras">
          <li v-for="c in categorias" :key="c.nome">
            <div class="barra-topo">
              <span>{{ c.nome }}</span>
              <strong>{{ c.valor }}%</strong>
            </div>
            <div class="trilho" role="progressbar" :aria-label="c.nome" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="c.valor">
              <div class="preenchimento" :style="{ width: c.valor + '%' }"></div>
            </div>
          </li>
        </ul>
      </section>

      <section class="bloco" aria-labelledby="t-mis">
        <h2 id="t-mis">Missões com maior conclusão</h2>
        <ul class="barras">
          <li v-for="m in missoes" :key="m.nome">
            <div class="barra-topo">
              <span>{{ m.nome }}</span>
              <strong>{{ m.valor }}%</strong>
            </div>
            <div class="trilho" role="progressbar" :aria-label="m.nome" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="m.valor">
              <div class="preenchimento" :style="{ width: m.valor + '%' }"></div>
            </div>
          </li>
        </ul>
      </section>
    </div>

    <section class="bloco bloco--cheio" aria-labelledby="t-rank">
      <h2 id="t-rank">Usuários com mais XP</h2>
      <div class="tabela-caixa">
        <table>
          <thead>
            <tr>
              <th>Posição</th>
              <th>Usuário</th>
              <th>Missões concluídas</th>
              <th class="num">XP</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(u, i) in ranking" :key="u.nome">
              <td>{{ i + 1 }}º</td>
              <td>{{ u.nome }}</td>
              <td>{{ u.missoes }}</td>
              <td class="num">{{ u.xp.toLocaleString('pt-BR') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.metricas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 18px;
  margin-bottom: 32px;
}
.metrica .pn-stat {
  width: auto;
}
.nota {
  margin: 8px 4px 0;
  font-size: 13px;
  line-height: 1.35;
  color: #5b6f62;
}

.painel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}
.bloco {
  padding: 20px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(20, 48, 31, 0.06);
}
.bloco h2 {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 700;
  color: #14301f;
}
.barras {
  display: grid;
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.barra-topo {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 14px;
  color: #14301f;
}
.barra-topo strong {
  color: #1b7a34;
}
.trilho {
  height: 8px;
  border-radius: 99px;
  background: #e1e8e3;
  overflow: hidden;
}
.preenchimento {
  height: 100%;
  border-radius: 99px;
  background: #2e7d32;
}

.tabela-caixa {
  overflow-x: auto;
}
table {
  width: 100%;
  min-width: 480px;
  border-collapse: collapse;
  font-size: 14px;
  color: #14301f;
}
th {
  padding: 10px 12px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #4b6254;
  border-bottom: 1px solid #e4ece7;
}
td {
  padding: 12px;
  border-bottom: 1px solid #eef3ef;
}
tbody tr:last-child td {
  border-bottom: 0;
}
.num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
</style>
