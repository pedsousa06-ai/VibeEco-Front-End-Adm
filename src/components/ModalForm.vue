<script setup>
import { ref, watch, nextTick, useId } from 'vue'

const props = defineProps({
  aberto: Boolean,
  titulo: String,
  descricao: String,
})
const emit = defineEmits(['cancelar', 'salvar'])

const idTitulo = useId()
const caixa = ref(null)

// Ao abrir, leva o foco para o primeiro campo
watch(
  () => props.aberto,
  async (aberto) => {
    if (!aberto) return
    await nextTick()
    caixa.value?.querySelector('input, select')?.focus()
  },
)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="aberto"
      class="fundo"
      @mousedown.self="emit('cancelar')"
      @keydown.esc="emit('cancelar')"
    >
      <form
        ref="caixa"
        class="modal"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="idTitulo"
        @submit.prevent="emit('salvar')"
      >
        <h2 :id="idTitulo">{{ titulo }}</h2>
        <p class="desc">{{ descricao }}</p>

        <slot />

        <div class="rodape">
          <button type="button" class="btn btn--claro" @click="emit('cancelar')">Cancelar</button>
          <button type="submit" class="btn btn--verde">Salvar</button>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<style scoped>
.fundo {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(10, 30, 18, 0.35);
  font-family: 'Inter', system-ui, sans-serif;
}
.modal {
  width: 100%;
  max-width: 650px;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  padding: 24px 20px 20px;
  box-sizing: border-box;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.3);
}
h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #14301f;
}
.desc {
  margin: 4px 0 18px;
  font-size: 14px;
  color: #5b6f62;
}
.rodape {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}
.btn {
  height: 40px;
  padding: 0 22px;
  border-radius: 8px;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.btn:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}
.btn--claro {
  border: 1px solid #d5e6da;
  background: #fff;
  color: #14301f;
}
.btn--claro:hover {
  background: #f1faf3;
}
.btn--verde {
  border: 1px solid #12a31b;
  background: #12a31b;
  color: #fff;
}
.btn--verde:hover {
  background: #0f8f18;
}
</style>
