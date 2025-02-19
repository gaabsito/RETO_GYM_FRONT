<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ref } from 'vue'
import LogoCanvas from "./components/LogoCanvas.vue";

const authStore = useAuthStore()
const drawer = ref(false)

const menuItems = [
  { title: 'Inicio', icon: 'mdi-home', route: '/' },
  { title: 'Entrenamientos', icon: 'mdi-dumbbell', route: '/entrenamientos' },
  { title: 'Ejercicios', icon: 'mdi-run', route: '/ejercicios' },
  { title: 'Sobre Nosotros', icon: 'mdi-information', route: '/about' },
]

const authMenuItems = [
  { title: 'Mi Perfil', icon: 'mdi-account', route: '/profile' },
  { title: 'Mis Entrenamientos', icon: 'mdi-playlist-check', route: '/mis-entrenamientos' },
]
</script>

<template>
  <v-app>
    <!-- App Bar (Optimizado para móviles) -->
    <v-app-bar class="app-bar">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <router-link to="/" class="app-bar__logo">
        <div class="logo-container" to="/home">
          <LogoCanvas />
        </div>
      </router-link>

      <!-- Botones de autenticación para pantallas grandes -->
      <v-btn variant="text" to="/about" class="desktop-only">
        Sobre Nosotros
      </v-btn>
      <template v-if="!authStore.isAuthenticated">
        <v-btn variant="text" to="/login" class="desktop-only">
          Iniciar Sesión
        </v-btn>

      </template>
      <template v-else>
        <v-btn variant="text" @click="authStore.logout" class="desktop-only">
          Cerrar Sesión
        </v-btn>
      </template>
    </v-app-bar>

    <!-- Navigation Drawer (Menú lateral para móviles) -->
    <v-navigation-drawer v-model="drawer" temporary>
      <v-list>
        <v-list-item v-for="item in menuItems" :key="item.title" :to="item.route" :prepend-icon="item.icon"
          :title="item.title"></v-list-item>

        <v-divider class="my-2"></v-divider>

        <template v-if="authStore.isAuthenticated">
          <v-list-item v-for="item in authMenuItems" :key="item.title" :to="item.route" :prepend-icon="item.icon"
            :title="item.title"></v-list-item>
          <v-list-item @click="authStore.logout" prepend-icon="mdi-logout" title="Cerrar Sesión"></v-list-item>
        </template>
        <template v-else>
          <v-list-item to="/login" prepend-icon="mdi-login" title="Iniciar Sesión"></v-list-item>
          <v-list-item to="/register" prepend-icon="mdi-account-plus" title="Registrarse"></v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <!-- Contenido principal -->
    <v-main>
      <v-container>
        <RouterView />
      </v-container>
    </v-main>

    <!-- Footer -->
    <v-footer class="footer">
      <div class="footer__icons">
        <v-btn v-for="icon in ['mdi-facebook', 'mdi-twitter', 'mdi-instagram']" :key="icon" class="footer__icon"
          :icon="icon" variant="text"></v-btn>
      </div>

      <div class="footer__links">
        <v-btn v-for="link in ['Sobre Nosotros', 'Contacto', 'Términos de Uso']" :key="link" variant="text"
          class="footer__link">
          {{ link }}
        </v-btn>
      </div>

      <v-divider></v-divider>

      <div class="footer__text">
        {{ new Date().getFullYear() }} — ENTRÉNATE
      </div>
    </v-footer>
  </v-app>
</template>

<style lang="scss">
@import './assets/styles/main.scss';

/* MOBILE FIRST */

/* General */

* {
  font-family: $font-family-base;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.v-toolbar__content {
  display: flex;
  flex: 0 0 auto;
  position: relative;
  transition: inherit;
  width: 100%;
  align-items: center;
  justify-content: space-between;
}

.v-main {
  font-family: $font-family-text !important;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 150px;
  overflow: hidden;
}

canvas {
  width: 150px;
  height: 150px;
  display: block;
}

/* Encabezado */
.app-bar__logo {
  color: white;
  font-weight: bold;
  text-decoration: none;
  font-size: 1.2rem;
}

/* Menú lateral */
.v-navigation-drawer {
  width: 250px;
}

/* Ocultar elementos en móviles por defecto */
.desktop-only {
  display: none;
}

/* Contenido principal */
.main-content {
  flex: 1;
  padding: 20px;
}

/* Encabezado */
.app-bar {
  background-color: $primary-color !important;
}

/* Footer */
.footer {
  background-color: $primary-color;
  color: white;
  padding: 20px 0;
  text-align: center;
  flex-direction: column;

  &__icons {
    margin-bottom: 10px;
  }

  &__icon {
    margin: 0 10px;
  }

  &__links {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 10px;
  }

  &__text {
    font-size: 0.9rem;
  }
}

/* RESPONSIVE DESIGN */

/* Tablets (>= 768px) */
@media (min-width: 768px) {
  .desktop-only {
    display: inline-flex;
  }
}

/* Escritorio (>= 1024px) */
@media (min-width: 1024px) {

  .v-btn__overlay {
    background-color: rgba(255, 255, 255, 0) !important;
  }

  .v-btn__underlay {
    opacity: 0 !important;
  }

  .app-bar {
    background-color: $primary-color !important;

    .v-btn {
      &:hover {
        color: white !important;
        opacity: 0.8;
        transition: all 0.3s ease;
      }
    }
  }

  .logo-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100px;
    height: 100px;
    overflow: hidden;
  }

  .v-toolbar__content {
    justify-content: space-around;
    height: 75px !important;
  }

  .app-bar__logo {
    margin-left: 0;
  }

  .main-content {
    padding: 40px;
  }

  .footer__links {
    flex-direction: row;
    justify-content: center;
  }
}

.v-btn {
  font-size: 19px !important;
  font-weight: bold;
}

:root {
  --v-theme-primary: #{$primary-color};
  --v-theme-secondary: #{$secondary-color};
}

.v-application {
  * {
    font-family: $font-family-base !important;
  }

  .text-body-1,
  .text-body-2,
  p {
    font-family: $font-family-text !important;
  }
}
</style>