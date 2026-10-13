<script setup>
import { Calendar, ChevronDown, Download } from 'lucide-vue-next'

defineProps({ titulo: String, descricao: String })
const emit = defineEmits(['exportar'])
const periodo = defineModel({ default: '30' })

const periodos = [
  { valor: '7', nome: 'Últimos 7 dias' },
  { valor: '30', nome: 'Últimos 30 dias' },
  { valor: '90', nome: 'Últimos 90 dias' },
]
</script>

<template>
  <header class="cabecalho">
    <div>
      <h1>{{ titulo }}</h1>
      <p class="descricao">{{ descricao }}</p>
    </div>

    <div class="acoes">
      <label class="seletor">
        <Calendar :size="18" aria-hidden="true" />
        <select v-model="periodo" aria-label="Período">
          <option v-for="p in periodos" :key="p.valor" :value="p.valor">{{ p.nome }}</option>
        </select>
        <ChevronDown :size="16" aria-hidden="true" />
      </label>
      <button class="exportar" type="button" aria-label="Exportar relatório" @click="emit('exportar')">
        <Download :size="18" />
      </button>
    </div>
  </header>
</template>

<style scoped>
h1 {
  margin: 0;
  font-size: 32px;
  line-height: 1.2;
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
@media (max-width: 600px) {
  h1 {
    font-size: 26px;
  }
}
</style>
