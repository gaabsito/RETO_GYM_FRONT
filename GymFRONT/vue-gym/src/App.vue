<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ref } from 'vue'

const authStore = useAuthStore()
const drawer = ref(false)

const menuItems = [
  { title: 'Inicio', icon: 'mdi-home', route: '/' },
  { title: 'Entrenamientos', icon: 'mdi-dumbbell', route: '/entrenamientos' },
  { title: 'Ejercicios', icon: 'mdi-run', route: '/ejercicios' },
]

const authMenuItems = [
  { title: 'Mi Perfil', icon: 'mdi-account', route: '/perfil' },
  { title: 'Mis Entrenamientos', icon: 'mdi-playlist-check', route: '/mis-entrenamientos' },
]
</script>

<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar color="primary">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      
      <v-app-bar-title>
        <router-link to="/" class="text-decoration-none text-white">
          GymApp
        </router-link>
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <!-- Botones de autenticación para pantallas grandes -->
      <template v-if="!authStore.isAuthenticated">
        <v-btn
          variant="text"
          to="/login"
          class="hidden-sm-and-down"
        >
          Iniciar Sesión
        </v-btn>
        <v-btn
          color="secondary"
          to="/registro"
          class="hidden-sm-and-down"
        >
          Registrarse
        </v-btn>
      </template>
      <template v-else>
        <v-btn
          variant="text"
          @click="authStore.logout"
          class="hidden-sm-and-down"
        >
          Cerrar Sesión
        </v-btn>
      </template>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      temporary
    >
      <v-list>
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :to="item.route"
          :prepend-icon="item.icon"
          :title="item.title"
        ></v-list-item>

        <v-divider class="my-2"></v-divider>

        <template v-if="authStore.isAuthenticated">
          <v-list-item
            v-for="item in authMenuItems"
            :key="item.title"
            :to="item.route"
            :prepend-icon="item.icon"
            :title="item.title"
          ></v-list-item>
          
          <v-list-item
            @click="authStore.logout"
            prepend-icon="mdi-logout"
            title="Cerrar Sesión"
          ></v-list-item>
        </template>
        <template v-else>
          <v-list-item
            to="/login"
            prepend-icon="mdi-login"
            title="Iniciar Sesión"
          ></v-list-item>
          <v-list-item
            to="/registro"
            prepend-icon="mdi-account-plus"
            title="Registrarse"
          ></v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <v-container>
        <RouterView />
      </v-container>
    </v-main>

    <!-- Footer -->
    <v-footer
      class="bg-primary text-center d-flex flex-column"
    >
      <div>
        <v-btn
          v-for="icon in ['mdi-facebook', 'mdi-twitter', 'mdi-instagram']"
          :key="icon"
          class="mx-4"
          :icon="icon"
          variant="text"
        ></v-btn>
      </div>

      <div class="pt-4">
        <v-btn
          v-for="link in ['Sobre Nosotros', 'Contacto', 'Términos de Uso']"
          :key="link"
          variant="text"
          class="mx-2"
          color="white"
        >
          {{ link }}
        </v-btn>
      </div>

      <v-divider></v-divider>

      <div class="px-4 py-2 text-center w-100">
        {{ new Date().getFullYear() }} — <strong>GymApp</strong>
      </div>
    </v-footer>
  </v-app>
</template>

<style lang="scss">
@import '@/assets/styles/main.scss';

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: $primary-color;
  height: $header-height;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;

  &__content {
    @include flex(row, space-between, center);
    height: 100%;
  }

  &__logo {
    color: white;
    font-size: $font-size-lg;
    font-weight: bold;
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
      color: $accent-color;
    }
  }

  &__nav {
    @include flex(row, flex-end, center);
    gap: $spacing-md;

    @media (max-width: $breakpoint-md) {
      display: none;
      position: absolute;
      top: $header-height;
      left: 0;
      right: 0;
      background: $primary-color;
      padding: $spacing-md;
      flex-direction: column;
      align-items: stretch;

      &.is-open {
        display: flex;
      }
    }
  }

  &__menu-toggle {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: $spacing-sm;

    @media (max-width: $breakpoint-md) {
      display: block;
    }
  }

  &__menu-icon {
    display: block;
    width: 24px;
    height: 2px;
    background-color: white;
    position: relative;
    transition: background-color 0.3s;

    &::before,
    &::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      background-color: white;
      transition: transform 0.3s;
    }

    &::before {
      transform: translateY(-8px);
    }

    &::after {
      transform: translateY(8px);
    }

    &.is-active {
      background-color: transparent;

      &::before {
        transform: rotate(45deg);
      }

      &::after {
        transform: rotate(-45deg);
      }
    }
  }
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: $spacing-sm $spacing-md;
  transition: all 0.3s ease;
  font-size: $font-size-base;

  &:hover {
    color: $accent-color;
  }

  &--button {
    background: none;
    border: none;
    cursor: pointer;
    font: inherit;
  }

  &--accent {
    background-color: $accent-color;
    border-radius: $border-radius;
    
    &:hover {
      background-color: darken($accent-color, 10%);
      color: white;
    }
  }
}

.main-content {
  margin-top: $header-height;
  flex: 1;
  padding: $spacing-xl 0;
}

.footer {
  background-color: $primary-color;
  color: white;
  padding: $spacing-xl 0;
  margin-top: auto;

  &__content {
    @include grid(1, $spacing-xl);
    
    @include responsive(tablet) {
      @include grid(3, $spacing-xl);
    }
  }

  &__section {
    @include flex(column, flex-start, flex-start);
    gap: $spacing-sm;
  }

  &__title {
    font-size: $font-size-lg;
    margin-bottom: $spacing-sm;
  }

  &__subtitle {
    font-size: $font-size-base;
    margin-bottom: $spacing-sm;
  }

  &__link {
    color: $light-gray;
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
      color: $accent-color;
    }
  }

  &__bottom {
    margin-top: $spacing-xl;
    padding-top: $spacing-md;
    border-top: 1px solid rgba(white, 0.1);
    text-align: center;
    font-size: $font-size-sm;
  }
}
</style>