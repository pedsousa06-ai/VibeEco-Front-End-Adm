import { createRouter, createWebHistory } from 'vue-router'
import PrimeiroLoginView from '@/views/PrimeiroLoginView.vue'
import RedefinirSenhaView from '@/views/RedefinirSenhaView.vue'
import LoginView from '@/views/LoginView.vue'
import EsqueciSenhaView from '@/views/EsqueciSenhaView.vue'
import VerificarCodigoView from '@/views/VerificarCodigoView.vue'
import NovaSenhaView from '@/views/NovaSenhaView.vue'
import AdminLayout from '@/components/AdminLayout.vue'
import InicioView from '@/views/InicioView.vue'
import MissoesView from '@/views/MissoesView.vue'
import DesafiosView from '@/views/DesafiosView.vue'
import ConteudosView from '@/views/ConteudosView.vue'
import GestaoTipos from '@/components/GestaoTipos.vue'
import UsuariosView from '@/views/UsuariosView.vue'
import ProgressoView from '@/views/ProgressoView.vue'
import ConfiguracoesView from '@/views/ConfiguracoesView.vue'

// Deixe false enquanto não houver API, para poder navegar pelo painel.
// Quando o login estiver pronto, mude para true e salve o token em
// localStorage com a chave 'vibeeco_token' após autenticar.
const PROTEGER_ROTAS = false

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/primeiro-login' },
    { path: '/primeiro-login', name: 'primeiro-login', component: PrimeiroLoginView },
    { path: '/redefinir-senha', name: 'redefinir-senha', component: RedefinirSenhaView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/esqueci-senha', name: 'esqueci-senha', component: EsqueciSenhaView },
    { path: '/verificar-codigo', name: 'verificar-codigo', component: VerificarCodigoView },
    { path: '/nova-senha', name: 'nova-senha', component: NovaSenhaView },

    // Área interna: todas as rotas compartilham o AdminLayout
    {
      path: '/',
      component: AdminLayout,
      meta: { requerLogin: true },
      children: [
        { path: 'painel', name: 'painel', component: InicioView },
        { path: 'missoes', name: 'missoes', component: MissoesView },
        { path: 'desafios', name: 'desafios', component: DesafiosView },
        { path: 'conteudo', name: 'conteudo', component: ConteudosView },
        { path: 'tipos-de-desafio', name: 'tipos-de-desafio', component: GestaoTipos, props: { tipo: 'desafio' } },
        { path: 'tipos-de-missao', name: 'tipos-de-missao', component: GestaoTipos, props: { tipo: 'missao' } },
        { path: 'tipos-de-conteudo', name: 'tipos-de-conteudo', component: GestaoTipos, props: { tipo: 'conteudo' } },
        { path: 'usuarios', name: 'usuarios', component: UsuariosView },
        { path: 'progresso', name: 'progresso', component: ProgressoView },
        { path: 'configuracoes', name: 'configuracoes', component: ConfiguracoesView },
      ],
    },
  ],
})

router.beforeEach((to) => {
  if (!PROTEGER_ROTAS) return true
  const logado = !!localStorage.getItem('vibeeco_token')
  if (to.meta.requerLogin && !logado) return { name: 'login' }
  return true
})

export default router
