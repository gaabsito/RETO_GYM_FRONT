<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import LogoCanvas from '@/components/LogoCanvas.vue'

const authStore = useAuthStore()
const router = useRouter()
const drawer = ref(false)

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}

const menuItems = [
  { title: 'Inicio', icon: 'mdi-home', route: '/' },
  { title: 'Entrenamientos', icon: 'mdi-dumbbell', route: '/entrenamientos' },
  { title: 'Ejercicios', icon: 'mdi-run', route: '/exercises' },
  { title: 'Sobre Nosotros', icon: 'mdi-information', route: '/about' },
]

const authMenuItems = [
  { title: 'Mi Perfil', icon: 'mdi-account', route: '/profile' },
  { title: 'Mis Entrenamientos', icon: 'mdi-playlist-check', route: '/mis-entrenamientos' },
]
</script>

<template>
  <v-app-bar class="app-bar">
    <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
    <router-link to="/" class="app-bar__logo">
      <div class="logo-container">
        <LogoCanvas />
      </div>
    </router-link>

    <v-btn variant="text" to="/about" class="desktop-only">
      Sobre Nosotros
    </v-btn>
    <template v-if="!authStore.isAuthenticated">
      <v-btn variant="text" to="/login" class="desktop-only">
        Iniciar Sesión
      </v-btn>
    </template>
    <template v-else>
      <v-btn variant="text" @click="handleLogout" class="desktop-only">
        Cerrar Sesión
      </v-btn>
    </template>
  </v-app-bar>

  <v-navigation-drawer v-model="drawer" temporary>
    <v-list>
      <v-list-item v-for="item in menuItems" :key="item.title" :to="item.route" :prepend-icon="item.icon"
        :title="item.title"></v-list-item>

      <v-divider class="my-2"></v-divider>

      <template v-if="authStore.isAuthenticated">
        <v-list-item v-for="item in authMenuItems" :key="item.title" :to="item.route" :prepend-icon="item.icon"
          :title="item.title"></v-list-item>
        <v-list-item @click="handleLogout" prepend-icon="mdi-logout" title="Cerrar Sesión"></v-list-item>
      </template>
      <template v-else>
        <v-list-item to="/login" prepend-icon="mdi-login" title="Iniciar Sesión"></v-list-item>
        <v-list-item to="/register" prepend-icon="mdi-account-plus" title="Registrarse"></v-list-item>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<style scoped lang="scss">
@import '@/assets/styles/main.scss';

.app-bar {
  background-color: $primary-color !important;
}

.app-bar__logo {
  color: white;
  font-weight: bold;
  text-decoration: none;
  font-size: 1.2rem;
}

.desktop-only {
  display: none;
}

@media (min-width: 768px) {
  .desktop-only {
    display: inline-flex;
  }
}
</style>