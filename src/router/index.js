import { createRouter, createWebHistory } from 'vue-router'
import { estaLogado } from '@/services/auth'

// Autenticação
import PrimeiroLoginView from '@/views/PrimeiroLoginView.vue'
import RedefinirSenhaView from '@/views/RedefinirSenhaView.vue'
import LoginView from '@/views/LoginView.vue'
import EsqueciSenhaView from '@/views/EsqueciSenhaView.vue'
import VerificarCodigoView from '@/views/VerificarCodigoView.vue'
import NovaSenhaView from '@/views/NovaSenhaView.vue'

// Área interna
import AdminLayout from '@/components/AdminLayout.vue'
import GestaoTipos from '@/components/GestaoTipos.vue'
import InicioView from '@/views/InicioView.vue'
import MissoesView from '@/views/MissoesView.vue'
import DesafiosView from '@/views/DesafiosView.vue'
import ConteudosView from '@/views/ConteudosView.vue'
import UsuariosView from '@/views/UsuariosView.vue'
import ProgressoView from '@/views/ProgressoView.vue'
import ConfiguracoesView from '@/views/ConfiguracoesView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Quem já entrou vai direto ao painel; quem não entrou vai ao login
    { path: '/', redirect: () => (estaLogado() ? '/painel' : '/login') },

    // Autenticação (públicas)
    { path: '/primeiro-login', name: 'primeiro-login', component: PrimeiroLoginView },
    { path: '/redefinir-senha', name: 'redefinir-senha', component: RedefinirSenhaView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/esqueci-senha', name: 'esqueci-senha', component: EsqueciSenhaView },
    { path: '/verificar-codigo', name: 'verificar-codigo', component: VerificarCodigoView },
    { path: '/nova-senha', name: 'nova-senha', component: NovaSenhaView },

    // Área interna (exige login): todas as rotas compartilham o AdminLayout
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

    // Endereço inexistente: volta para o início do fluxo
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to) => {
  const logado = estaLogado()

  // Área interna sem login: manda para o login e lembra para onde ia
  if (to.meta.requerLogin && !logado) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  // Já logado não precisa ver o login de novo
  if (to.name === 'login' && logado) return { name: 'painel' }
  return true
})

export default router