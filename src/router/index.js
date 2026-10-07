import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: LoginView },
    // { path: '/painel', name: 'painel', component: () => import('@/views/DashboardView.vue') },
  ],
})