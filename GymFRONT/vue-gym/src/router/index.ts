import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ProfileView from '@/views/ProfileView.vue'
import ExercisesView from '@/views/ExercisesView.vue'
import ExerciseView from '@/views/ExerciseView.vue'
import WorkoutsView from '@/views/WorkoutsView.vue'
import WorkoutsInfoView from '@/views/WorkoutsInfoView.vue'
import CreateWorkoutView from '@/views/CreateWorkoutView.vue'
import MisEntrenamientosView from '@/views/MisEntrenamientosView.vue'
import MedicionesView from '@/views/MedicionView.vue'
import LogrosView from '@/views/LogrosView.vue'

// Admin Views
import AdminDashboardView from '@/views/admin/AdminDashboardView.vue'
import AdminUsersView from '@/views/admin/AdminUsersView.vue'
import AdminWorkoutsView from '@/views/admin/AdminWorkoutsView.vue'
import AdminExercisesView from '@/views/admin/AdminExercisesView.vue'

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
      path: '/exercises',
      name: 'exercises',
      component: ExercisesView,
    },
    {
      path: '/exercises/:id',
      name: 'exercise-detail',
      component: ExerciseView,
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true },
    },
    {
      path: '/workouts',
      name: 'workouts',
      component: WorkoutsView,
    },
    {
      path: '/workouts/:id',
      name: 'workouts-info',
      component: WorkoutsInfoView,
    },
    {
      path: '/crear-entrenamiento',
      name: 'create-workout',
      component: CreateWorkoutView,
      meta: { requiresAuth: true },
    },
    {
      path: '/mis-entrenamientos',
      name: 'my-workouts',
      component: MisEntrenamientosView,
      meta: { requiresAuth: true },
    },
    {
      path: '/mediciones',
      name: 'mediciones',
      component: MedicionesView,
      meta: { requiresAuth: true },
    },
    {
      path: '/logros',
      name: 'logros',
      component: LogrosView,
      meta: { requiresAuth: true },
    },
    // RUTAS DE ADMINISTRADOR
    {
      path: '/admin',
      name: 'admin-dashboard',
      component: AdminDashboardView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/usuarios',
      name: 'admin-users',
      component: AdminUsersView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/entrenamientos',
      name: 'admin-workouts',
      component: AdminWorkoutsView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/ejercicios',
      name: 'admin-exercises',
      component: AdminExercisesView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Si la ruta requiere autenticación y el usuario no está autenticado
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // Si la ruta requiere ser admin y el usuario no es admin
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next({ name: 'home' })
    return
  }

  // Si el usuario está autenticado y trata de acceder a páginas de auth
  if (authStore.isAuthenticated && 
      ['login', 'register'].includes(to.name as string)) {
    // REDIRECCIÓN BASADA EN TIPO DE USUARIO
    if (authStore.isAdmin) {
      next({ name: 'admin-dashboard' })
    } else {
      next({ name: 'profile' })
    }
    return
  }

  next()
})

export default router