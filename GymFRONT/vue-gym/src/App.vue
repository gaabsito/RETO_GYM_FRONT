<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ref, onMounted } from 'vue'
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';

// Definir la interfaz para los items del menú
interface MenuItem {
  title: string;
  icon: string;
  route: string;
}

const authStore = useAuthStore()
const router = useRouter()
const drawer = ref(false)

// Inicializar la autenticación al cargar la app
onMounted(() => {
  authStore.init();
})

const menuItems: MenuItem[] = [
  { title: 'Inicio', icon: 'mdi-home', route: '/' },
  { title: 'Entrenamientos', icon: 'mdi-dumbbell', route: '/workouts' },
  { title: 'Ejercicios', icon: 'mdi-run', route: '/exercises' },
  
  { title: 'Sobre Nosotros', icon: 'mdi-information', route: '/about' },
]

const authMenuItems: MenuItem[] = [
  { title: 'Mi Perfil', icon: 'mdi-account', route: '/profile' },
  { title: 'Mis Entrenamientos', icon: 'mdi-playlist-check', route: '/mis-entrenamientos' },
]

// Método para alternar el drawer
const toggleDrawer = () => {
  drawer.value = !drawer.value;
};
</script>

<template>
  <v-app>
    <Header
      :menuItems="menuItems"
      :authMenuItems="authMenuItems"
      :drawer="drawer"
      @toggle-drawer="toggleDrawer"
    />
    <v-main>
      <v-container>
        <RouterView />
      </v-container>
    </v-main>
    <Footer />
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
    height: 64px !important;
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