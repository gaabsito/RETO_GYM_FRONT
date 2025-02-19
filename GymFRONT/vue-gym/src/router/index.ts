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
      path: '/iniciar-sesión',
      name: 'iniciar-sesión',
      component: LoginView,
    },
    {
      path: '/registro',
      name: 'registro',
      component: RegisterView,
    },
    {
      path: '/recuperar-contraseña',
      name: 'recuperar-contraseña',
      component: RecuperarPasswordView,
    },
    {
      path: '/cambiar-contraseña/:token',
      name: 'cambiar-contraseña',
      component: ResetPasswordView,
    },
    {
      path: '/sobre-nosotros',
      name: 'sobre-nosotros',
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
    next({ name: 'iniciar-sesión', query: { redirect: to.fullPath } })
    return
  }

  // Si el usuario está autenticado y trata de acceder a páginas de auth
  if (authStore.isAuthenticated && 
      ['iniciar-sesión', 'registro', 'recuperar-contraseña', 'cambiar-contraseña'].includes(to.name as string)) {
    next({ name: 'perfil' })
    return
  }

  next()
})

export default router