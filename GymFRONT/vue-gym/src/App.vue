<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ref, onMounted } from 'vue'

const authStore = useAuthStore()
const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

// Cerrar menú al cambiar de ruta
const closeMenu = () => {
  isMenuOpen.value = false
}
</script>

<template>
  <div class="app-container">
    <header class="header">
      <div class="header__content container">
        <RouterLink to="/" class="header__logo" @click="closeMenu">
          GymApp
        </RouterLink>
        
        <button 
          class="header__menu-toggle" 
          @click="toggleMenu"
          :aria-expanded="isMenuOpen"
          aria-label="Toggle menu"
        >
          <span class="header__menu-icon" :class="{ 'is-active': isMenuOpen }"></span>
        </button>

        <nav class="header__nav" :class="{ 'is-open': isMenuOpen }">
          <RouterLink 
            to="/" 
            class="nav-link" 
            @click="closeMenu"
          >
            Inicio
          </RouterLink>
          
          <RouterLink 
            to="/entrenamientos" 
            class="nav-link"
            @click="closeMenu"
          >
            Entrenamientos
          </RouterLink>
          
          <RouterLink 
            to="/ejercicios" 
            class="nav-link"
            @click="closeMenu"
          >
            Ejercicios
          </RouterLink>
          
          <!-- Enlaces condicionados por autenticación -->
          <template v-if="authStore.isAuthenticated">
            <RouterLink 
              to="/perfil" 
              class="nav-link"
              @click="closeMenu"
            >
              Mi Perfil
            </RouterLink>
            
            <RouterLink 
              to="/mis-entrenamientos" 
              class="nav-link"
              @click="closeMenu"
            >
              Mis Entrenamientos
            </RouterLink>
            
            <button 
              @click="authStore.logout" 
              class="nav-link nav-link--button"
            >
              Cerrar Sesión
            </button>
          </template>
          
          <template v-else>
            <RouterLink 
              to="/login" 
              class="nav-link"
              @click="closeMenu"
            >
              Iniciar Sesión
            </RouterLink>
            
            <RouterLink 
              to="/registro" 
              class="nav-link nav-link--accent"
              @click="closeMenu"
            >
              Registrarse
            </RouterLink>
          </template>
        </nav>
      </div>
    </header>

    <main class="main-content">
      <RouterView />
    </main>

    <footer class="footer">
      <div class="container">
        <div class="footer__content">
          <div class="footer__section">
            <h3 class="footer__title">GymApp</h3>
            <p>Tu compañero perfecto para el entrenamiento</p>
          </div>
          
          <div class="footer__section">
            <h4 class="footer__subtitle">Enlaces</h4>
            <RouterLink to="/about" class="footer__link">Sobre Nosotros</RouterLink>
            <RouterLink to="/privacy" class="footer__link">Privacidad</RouterLink>
            <RouterLink to="/terms" class="footer__link">Términos</RouterLink>
          </div>
          
          <div class="footer__section">
            <h4 class="footer__subtitle">Contacto</h4>
            <a href="mailto:info@gymapp.com" class="footer__link">info@gymapp.com</a>
          </div>
        </div>
        
        <div class="footer__bottom">
          <p>&copy; {{ new Date().getFullYear() }} GymApp. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  </div>
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