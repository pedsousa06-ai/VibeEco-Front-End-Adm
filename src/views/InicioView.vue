<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import {
  Target, Flame, Users, ChartNoAxesGantt, Layers, Folder, Flag, BookOpen, CircleX,
  Calendar, ChevronDown, ChevronRight, Download, Loader2, AlertCircle, RefreshCw,
} from 'lucide-vue-next'
import { BASE, requisitar } from '@/services/missoes'

const icones = {
  'missoes-ativas': Target,
  'desafios': Flame,
  'usuarios': Users,
  'progresso-geral': ChartNoAxesGantt,
}

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

const periodo = ref('30')
const periodos = [
  { valor: '7', nome: 'Últimos 7 dias' },
  { valor: '30', nome: 'Últimos 30 dias' },
  { valor: '90', nome: 'Últimos 90 dias' },
]

const metricas = ref([])
const carregando = ref(false)
const erro = ref('')
const exportando = ref(false)
const atualizadoEm = ref(null)

function formatarValor(m) {
  if (m.formato === 'percentual') return `${m.valor}%`
  if (m.formato === 'compacto') {
    return new Intl.NumberFormat('pt-BR', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(m.valor)
  }
  return new Intl.NumberFormat('pt-BR').format(m.valor)
}

function dataHora(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return ''
  }
}

async function carregarMetricas() {
  carregando.value = true
  erro.value = ''
  try {
    const corpo = await requisitar(
      `${BASE}/dashboard/resumo?periodo=${periodo.value}`,
      { method: 'GET' }
    )

    if (!corpo?.status) {
      throw new Error(corpo?.message || 'Erro ao carregar métricas')
    }

    atualizadoEm.value = corpo.response?.atualizadoEm || null
    metricas.value = (corpo.response?.metricas || []).map((m) => ({
      ...m,
      icone: icones[m.id] || Target,
      valor: formatarValor(m),
    }))
  } catch (e) {
    console.error(e)
    erro.value = e.message || 'Não foi possível carregar as métricas.'
  } finally {
    carregando.value = false
  }
}

async function exportar() {
  if (exportando.value) return
  exportando.value = true
  try {
    const token = localStorage.getItem('vibeeco_token')
    const resp = await fetch(`${BASE}/dashboard/exportar?periodo=${periodo.value}`, {
      method: 'GET',
      headers: token ? { 'x-access-token': token } : {},
    })

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`)
    }

    const blob = await resp.blob()
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `vibeeco-dashboard-${periodo.value}d.xlsx`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(link.href)
  } catch (e) {
    console.error(e)
    erro.value = e.message || 'Não foi possível exportar o relatório.'
  } finally {
    exportando.value = false
  }
}

onMounted(carregarMetricas)
watch(periodo, carregarMetricas)

const subtituloAtualizado = computed(() =>
  atualizadoEm.value ? `Atualizado em ${dataHora(atualizadoEm.value)}` : ''
)
</script>

<template>
  <div class="inicio">
    <header class="cabecalho">
      <div>
        <h1>Início</h1>
        <p class="descricao">
          Visão geral do painel administrativo com atalhos, métricas e navegação refinada.
          <span v-if="subtituloAtualizado" class="atualizado">· {{ subtituloAtualizado }}</span>
        </p>
      </div>

      <div class="acoes">
        <label class="seletor">
          <Calendar :size="18" aria-hidden="true" />
          <select v-model="periodo" aria-label="Período" :disabled="carregando">
            <option v-for="p in periodos" :key="p.valor" :value="p.valor">{{ p.nome }}</option>
          </select>
          <ChevronDown :size="16" aria-hidden="true" />
        </label>
        <button
          class="exportar"
          type="button"
          :aria-label="exportando ? 'Exportando…' : 'Exportar relatório em XLSX'"
          :disabled="exportando || carregando"
          @click="exportar"
        >
          <component :is="exportando ? Loader2 : Download" :size="18" :class="{ girar: exportando }" />
        </button>
      </div>
    </header>

    <div v-if="erro" class="estado estado--erro" role="alert">
      <AlertCircle :size="20" aria-hidden="true" />
      <span>{{ erro }}</span>
      <button class="tentar" type="button" @click="carregarMetricas">
        <RefreshCw :size="14" /> Tentar novamente
      </button>
    </div>

    <section v-else-if="carregando && metricas.length === 0" class="metricas" aria-label="Carregando métricas">
      <div v-for="n in 4" :key="n" class="metrica">
        <div class="metrica-cartao esqueleto">
          <div class="metrica-topo">
            <span class="sk sk-titulo"></span>
            <span class="sk sk-icone"></span>
          </div>
          <span class="sk sk-valor"></span>
        </div>
        <span class="sk sk-nota"></span>
      </div>
    </section>

    <section v-else class="metricas" aria-label="Métricas">
      <div v-for="m in metricas" :key="m.id" class="metrica">
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
.inicio { max-width: 1080px; }

h1 { margin: 0; font-size: 32px; line-height: 1.2; font-weight: 700; color: #14301f; }
h2 { margin: 0; font-size: 24px; font-weight: 700; color: #14301f; }
.descricao { margin: 4px 0 0; font-size: 15px; color: #5b6f62; }
.atualizado { color: #7a8c81; }

.cabecalho {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 16px; flex-wrap: wrap; margin-bottom: 24px;
}
.acoes { display: flex; gap: 12px; }

.seletor {
  position: relative; display: flex; align-items: center; gap: 10px;
  height: 44px; padding: 0 14px;
  border: 1px solid #b9dcc4; border-radius: 10px; background: #fff; color: #14301f;
}
.seletor:focus-within { border-color: #07843f; box-shadow: 0 0 0 3px rgba(7, 132, 63, 0.18); }
.seletor select {
  appearance: none; min-width: 150px; border: 0; outline: 0; background: transparent;
  font: inherit; font-size: 15px; color: inherit; cursor: pointer;
}
.seletor select:disabled { cursor: progress; opacity: 0.6; }

.exportar {
  display: grid; place-items: center; width: 44px; height: 44px;
  border: 1px solid #1ba52f; border-radius: 10px; background: #fff; color: #1ba52f;
  cursor: pointer; transition: background 0.15s;
}
.exportar:hover:not(:disabled) { background: #f1faf3; }
.exportar:disabled { cursor: not-allowed; opacity: 0.6; }
.exportar:focus-visible { outline: 3px solid #1fe05a; outline-offset: 2px; }
.girar { animation: girar 1s linear infinite; }
@keyframes girar { to { transform: rotate(360deg); } }

.metricas {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 18px; margin-bottom: 40px;
}
.metrica-cartao {
  padding: 16px 18px 18px; border-radius: 12px; background: #fff;
  box-shadow: 0 2px 8px rgba(20, 48, 31, 0.06);
}
.metrica-topo {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 13px; color: #3d5446;
}
.metrica-cartao strong {
  display: block; margin-top: 16px; font-size: 32px; line-height: 1.1;
  font-weight: 700; color: #14301f;
}
.metrica-nota { margin: 8px 4px 0; font-size: 13px; line-height: 1.35; color: #5b6f62; }

.icone {
  display: grid; place-items: center; flex: none;
  width: 36px; height: 36px; border-radius: 10px;
  background: #cdeed7; color: #0e8a3a;
}
.icone--grande { width: 48px; height: 48px; border-radius: 12px; }

.estado {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 16px; border-radius: 10px; margin-bottom: 24px; font-size: 14px;
}
.estado--erro { background: #fdecea; color: #8a1c14; border: 1px solid #f5c2be; }
.tentar {
  margin-left: auto; display: inline-flex; align-items: center; gap: 6px;
  background: transparent; border: 1px solid currentColor; color: inherit;
  padding: 6px 10px; border-radius: 8px; cursor: pointer; font: inherit; font-size: 13px;
}

.esqueleto { position: relative; overflow: hidden; }
.sk {
  display: inline-block; background: #e7f2ea; border-radius: 6px;
  position: relative; overflow: hidden;
}
.sk::after {
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.6), transparent);
  transform: translateX(-100%); animation: shimmer 1.2s infinite;
}
@keyframes shimmer { to { transform: translateX(100%); } }
.sk-titulo { width: 100px; height: 12px; }
.sk-icone { width: 36px; height: 36px; border-radius: 10px; }
.sk-valor { display: block; margin-top: 16px; width: 60%; height: 30px; }
.sk-nota { display: block; margin: 10px 4px 0; width: 80%; height: 12px; }

.atalhos {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 18px; margin-top: 20px;
}
.atalho {
  display: flex; align-items: center; gap: 16px; min-height: 130px;
  padding: 20px; box-sizing: border-box; border-radius: 14px; background: #fff;
  color: inherit; text-decoration: none; box-shadow: 0 2px 8px rgba(20, 48, 31, 0.06);
  transition: box-shadow 0.15s;
}
.atalho:hover { box-shadow: 0 6px 18px rgba(20, 48, 31, 0.14); }
.atalho:focus-visible { outline: 3px solid #1fe05a; outline-offset: 2px; }
.atalho-texto { flex: 1; min-width: 0; }
.atalho-texto strong { display: block; font-size: 17px; font-weight: 700; color: #14301f; }
.atalho-texto small { display: block; margin-top: 4px; font-size: 13px; line-height: 1.35; color: #5b6f62; }
.seta { flex: none; color: #7a8c81; }

@media (max-width: 600px) {
  h1 { font-size: 26px; }
}
</style>