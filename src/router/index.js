import { createRouter, createWebHistory } from 'vue-router'
import PrimeiroLoginView from '@/views/PrimeiroLoginView.vue'
import RedefinirSenhaView from '@/views/RedefinirSenhaView.vue'
import LoginView from '@/views/LoginView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/primeiro-login' },
    { path: '/primeiro-login', name: 'primeiro-login', component: PrimeiroLoginView },
    { path: '/redefinir-senha', name: 'redefinir-senha', component: RedefinirSenhaView },
    { path: '/login', name: 'login', component: LoginView },
  ],
})