import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import RecuperarPasswordView from '@/views/RecuperarPasswordView.vue'
import ResetPasswordView from '@/views/ResetPasswordView.vue'
import SobreNosotrosView from '@/views/SobreNosotrosView.vue'
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
      path: '/about',
      name: 'about',
      component: SobreNosotrosView,
    },
    {
      path: '/perfil',
      name: 'perfil',
      component: ProfileView,
      meta: { requiresAuth: true },
    }
  ],
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Si la ruta requiere autenticación y el usuario no está autenticado
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // Si el usuario está autenticado y trata de acceder a páginas de auth
  if (authStore.isAuthenticated && 
      ['login', 'register', 'RecuperarPassword', 'ResetPassword'].includes(to.name as string)) {
    next({ name: 'perfil' })
    return
  }

  next()
})

export default router