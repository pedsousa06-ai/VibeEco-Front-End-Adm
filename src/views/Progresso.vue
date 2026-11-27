<script setup>
import { ref, onMounted, watch } from 'vue'
import { ChartNoAxesGantt, CheckCircle2, Users, Zap, Loader2 } from 'lucide-vue-next'
import { obterProgresso } from '@/services/progresso'

const periodo = ref('30')
const periodos = [
  { valor: '7', nome: 'Últimos 7 dias' },
  { valor: '30', nome: 'Últimos 30 dias' },
  { valor: '90', nome: 'Últimos 90 dias' },
]

const carregando = ref(true)
const erro = ref('')
const dados = ref(null)

const icones = {
  'conclusao-media': ChartNoAxesGantt,
  'missoes-concluidas': CheckCircle2,
  'usuarios-engajados': Users,
  'xp-distribuido': Zap,
}

const formatarValor = (m) => {
  if (m.formato === 'percentual') return `${m.valor}%`
  if (m.formato === 'compacto') return new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(m.valor)
  return new Intl.NumberFormat('pt-BR').format(m.valor)
}

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    dados.value = await obterProgresso(periodo.value)
  } catch (e) {
    erro.value = e.message || 'Erro ao carregar progresso.'
  } finally {
    carregando.value = false
  }
}

onMounted(carregar)
watch(periodo, carregar)
</script>

<template>
  <div class="progresso">
    <header class="cabecalho">
      <div>
        <h1>Progresso geral</h1>
        <p class="descricao">Visão consolidada de avanço, conclusão e engajamento.</p>
      </div>

      <div class="acoes">
        <select v-model="periodo" class="seletor">
          <option v-for="p in periodos" :key="p.valor" :value="p.valor">{{ p.nome }}</option>
        </select>
      </div>
    </header>

    <div v-if="erro" class="estado estado--erro">{{ erro }}</div>
    <div v-else-if="carregando" class="estado"><Loader2 class="girar" /> Carregando...</div>

    <template v-else-if="dados">
      <!-- Métricas topo -->
      <div class="metricas">
        <div v-for="m in dados.metricas" :key="m.id" class="metrica-cartao">
          <div class="metrica-topo">
            <span>{{ m.titulo }}</span>
            <span class="icone"><component :is="icones[m.id]" :size="18" /></span>
          </div>
          <strong>{{ formatarValor(m) }}</strong>
          <p class="metrica-nota">{{ m.nota }}</p>
        </div>
      </div>

      <!-- Gráficos lado a lado -->
      <div class="graficos">
        <!-- Esquerda -->
        <div class="grafico-cartao">
          <h3>Conclusão por categoria</h3>
          <div class="barra-lista">
            <div v-for="c in dados.categorias" :key="c.nome" class="barra-item">
              <div class="barra-info">
                <span>{{ c.nome }}</span>
                <span class="barra-val">{{ c.porcentagem }}%</span>
              </div>
              <div class="barra-fundo">
                <div class="barra-progresso" :style="{ width: `${c.porcentagem}%` }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Direita -->
        <div class="grafico-cartao">
          <h3>Missões com maior conclusão</h3>
          <div class="barra-lista">
            <div v-for="m in dados.topMissoes" :key="m.nome" class="barra-item">
              <div class="barra-info">
                <span>{{ m.nome }}</span>
                <span class="barra-val">{{ m.porcentagem }}%</span>
              </div>
              <div class="barra-fundo">
                <div class="barra-progresso" :style="{ width: `${m.porcentagem}%` }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ranking -->
      <div class="tabela-cartao">
        <h3>Usuários com mais XP</h3>
        <table>
          <thead>
            <tr>
              <th>Posição</th>
              <th>Usuário</th>
              <th>Missões concluídas</th>
              <th style="text-align: right;">XP</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(u, i) in dados.ranking" :key="u.nome">
              <td>{{ i + 1 }}º</td>
              <td>{{ u.nome }}</td>
              <td>{{ u.missoes }}</td>
              <td style="text-align: right;">{{ u.xp.toLocaleString('pt-BR') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<style scoped>
.progresso { max-width: 1080px; margin-inline: auto; }
@media (min-width: 1500px) { .progresso { max-width: 1280px; } }
h1 { margin: 0; font-size: 32px; color: #14301f; }
.descricao { margin: 4px 0 0; font-size: 15px; color: #5b6f62; }
.cabecalho { display: flex; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; }
.seletor { height: 44px; padding: 0 12px; border: 1px solid #b9dcc4; border-radius: 10px; background: #fff; color: #14301f; cursor: pointer; }
.estado { padding: 20px; background: #fff; border-radius: 12px; display: flex; align-items: center; gap: 8px; font-size: 14px; }
.estado--erro { color: #c62828; background: #fdecea; border: 1px solid #f5c2be; }

.metricas { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 24px; }
.metrica-cartao { padding: 18px; border-radius: 12px; background: #fff; box-shadow: 0 2px 8px rgba(20, 48, 31, 0.06); }
.metrica-topo { display: flex; justify-content: space-between; font-size: 13px; color: #3d5446; margin-bottom: 8px; }
.metrica-topo .icone { background: #cdeed7; color: #0e8a3a; width: 28px; height: 28px; display: grid; place-items: center; border-radius: 8px; }
.metrica-cartao strong { font-size: 28px; color: #14301f; display: block; margin-bottom: 4px; }
.metrica-nota { font-size: 12px; color: #5b6f62; margin: 0; }

.graficos { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 24px; }
.grafico-cartao, .tabela-cartao { padding: 24px; border-radius: 12px; background: #fff; box-shadow: 0 2px 8px rgba(20, 48, 31, 0.06); }
h3 { margin: 0 0 16px; font-size: 18px; color: #14301f; }

.barra-lista { display: flex; flex-direction: column; gap: 16px; }
.barra-item { display: flex; flex-direction: column; gap: 6px; }
.barra-info { display: flex; justify-content: space-between; font-size: 14px; color: #3d5446; font-weight: 500; }
.barra-val { color: #0e8a3a; font-weight: 700; }
.barra-fundo { height: 8px; background: #e7f2ea; border-radius: 4px; overflow: hidden; }
.barra-progresso { height: 100%; background: #0e8a3a; border-radius: 4px; }

table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; color: #3d5446; }
th { padding-bottom: 12px; font-weight: 500; color: #7a8c81; border-bottom: 1px solid #e7f2ea; }
td { padding: 12px 0; border-bottom: 1px solid #e7f2ea; }
tr:last-child td { border-bottom: none; }
.girar { animation: girar 1s linear infinite; }
@keyframes girar { to { transform: rotate(360deg); } }

.tabela-cartao { overflow-x: auto; }
@media (max-width: 1100px) {
  .metricas { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .metricas, .graficos { grid-template-columns: 1fr; }
}
</style>