import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import RecuperarPasswordView from '@/views/RecuperarPasswordView.vue'
import ResetPasswordView from '@/views/ResetPasswordView.vue'
import ProfileView from '@/views/ProfileView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/recuperar-password',
      name: 'RecuperarPassword',
      component: RecuperarPasswordView,
    },
    {
      path: '/reset-password/:token',
      name: 'ResetPassword',
      component: ResetPasswordView,
    },
    {
      path: '/perfil',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true }  // Para asegurar que solo usuarios autenticados pueden acceder
    }
  ],
})

export default router