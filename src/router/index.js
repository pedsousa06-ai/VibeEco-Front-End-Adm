import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import RedefinirSenhaView from '@/views/RedefinirSenhaView.vue'
import PrimeiroLoginView from '@/views/PrimeiroLoginView.vue' 

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/redefinir-senha', name: 'redefinir-senha', component: RedefinirSenhaView },
    { path: '/primeiro-acesso', name: 'primeiro-acesso', component: PrimeiroLoginView },
    // { path: '/painel', name: 'painel', component: () => import('@/views/DashboardView.vue') },
  ],
})