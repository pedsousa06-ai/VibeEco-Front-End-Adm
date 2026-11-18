// Preferências do painel que NÃO existem no banco (nome do workspace e avisos).
// Ficam salvas neste navegador, separadas por administrador. Quando houver uma tabela de configurações
// no banco, basta trocar o conteúdo de carregar()/salvar() por chamadas à API.
import { reactive } from 'vue'
import { obterUsuario } from '@/services/auth'

const PADRAO = {
  workspace: 'VibeEco Admin',
  notificacoes: { cadastros: true, conclusoes: true, relatorio: false },
}

function chave() {
  return `vibeeco_prefs_${obterUsuario()?.id ?? 'anonimo'}`
}

function carregar() {
  try {
    const salvo = JSON.parse(localStorage.getItem(chave()) || '{}')
    return {
      workspace: salvo.workspace || PADRAO.workspace,
      notificacoes: { ...PADRAO.notificacoes, ...(salvo.notificacoes || {}) },
    }
  } catch {
    return structuredClone(PADRAO)
  }
}

// objeto compartilhado: o menu lateral e a tela de Configurações enxergam a mesma coisa
export const preferencias = reactive(carregar())

// chamar depois do login (o administrador pode ser outro)
export function recarregarPreferencias() {
  Object.assign(preferencias, carregar())
}

export function salvarPreferencias() {
  localStorage.setItem(
    chave(),
    JSON.stringify({ workspace: preferencias.workspace, notificacoes: { ...preferencias.notificacoes } }),
  )
}
