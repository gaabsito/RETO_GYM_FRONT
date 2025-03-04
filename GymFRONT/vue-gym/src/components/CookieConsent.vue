<script setup lang="ts">
import { ref, onMounted } from 'vue';
import CookiePolicy from '@/components/CookiePolicy.vue';

// Props para personalizar el componente
const props = defineProps({
  cookieOptions: {
    type: Boolean,
    default: false
  },
  position: {
    type: String,
    default: 'bottom', // 'bottom', 'top'
    validator: (value: string) => ['bottom', 'top'].includes(value)
  },
  theme: {
    type: String,
    default: 'dark', // 'dark', 'light'
    validator: (value: string) => ['dark', 'light'].includes(value)
  }
});

// Estado para controlar la visibilidad
const isVisible = ref(true); // Comenzamos visible y luego verificamos
const showPolicyDialog = ref(false);

// Función para aceptar todas las cookies
const acceptAll = () => {
  console.log('Aceptar todas - antes:', isVisible.value);
  localStorage.setItem('cookie-consent', 'accepted');
  isVisible.value = false;
  console.log('Aceptar todas - después:', isVisible.value);
};

// Función para aceptar solo las cookies necesarias
const acceptNecessary = () => {
  console.log('Solo necesarias - antes:', isVisible.value);
  localStorage.setItem('cookie-consent', 'necessary');
  isVisible.value = false;
  console.log('Solo necesarias - después:', isVisible.value);
};

// Función para personalizar las cookies
const customizeCookies = () => {
  showPolicyDialog.value = true;
};

// Función para cerrar el diálogo de política de cookies
const closePolicyDialog = () => {
  showPolicyDialog.value = false;
  
  // Verificar si el usuario ya tomó una decisión mientras estaba en el diálogo
  const cookieConsent = localStorage.getItem('cookie-consent');
  if (cookieConsent) {
    isVisible.value = false;
  }
};

// Comprobar si el usuario ya ha aceptado las cookies al montar el componente
onMounted(() => {
  console.log('CookieConsent montado');
  
  // Para pruebas: descomenta la siguiente línea para reiniciar
  // localStorage.removeItem('cookie-consent');
  
  const cookieConsent = localStorage.getItem('cookie-consent');
  console.log('Estado cookie-consent:', cookieConsent);
  
  if (cookieConsent) {
    // Si ya hay consentimiento, ocultamos el banner
    isVisible.value = false;
    console.log('Banner oculto (consentimiento previo)');
  } else {
    // Si no hay consentimiento, mostramos el banner
    isVisible.value = true;
    console.log('Banner visible (sin consentimiento previo)');
  }
});
</script>

<template>
  <div>
    <!-- Banner de cookies personalizado -->
    <transition name="cookie-slide">
      <div v-if="isVisible" 
          class="cookie-banner" 
          :class="[
            position === 'top' ? 'top' : 'bottom',
            theme === 'dark' ? 'dark' : 'light'
          ]">
        <div class="cookie-banner-content">
          <div class="cookie-text">
            <h3 class="cookie-title">Este sitio utiliza cookies</h3>
            <p class="cookie-description">
              Utilizamos cookies para mejorar tu experiencia, personalizar contenido y analizar el tráfico del sitio.
              Al hacer clic en "Aceptar todas", consientes el uso de todas las cookies.
            </p>
          </div>
          
          <div class="cookie-buttons">
            <button
              v-if="cookieOptions"
              class="cookie-btn cookie-btn-outline"
              @click="customizeCookies"
            >
              Personalizar
            </button>
            
            <button
              class="cookie-btn cookie-btn-outline"
              @click="acceptNecessary"
            >
              Solo necesarias
            </button>
            
            <button
              class="cookie-btn cookie-btn-primary"
              @click="acceptAll"
            >
              Aceptar todas
            </button>
          </div>
        </div>
      </div>
    </transition>
    
    <!-- Diálogo de política de cookies -->
    <CookiePolicy 
      v-model:show="showPolicyDialog" 
      :theme="theme" 
      @close="closePolicyDialog" 
    />
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

// Transiciones
.cookie-slide-enter-active,
.cookie-slide-leave-active {
  transition: transform 0.5s ease, opacity 0.5s ease;
}
.cookie-slide-enter-from,
.cookie-slide-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

.cookie-banner {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 9999; // Aumentado para asegurar visibilidad
  padding: 1rem;
  width: 100%;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
  
  // Posición
  &.bottom {
    bottom: 0;
  }
  
  &.top {
    top: 0;
  }
  
  // Tema
  &.dark {
    background-color: #212121;
    color: white;
  }
  
  &.light {
    background-color: #f5f5f5;
    color: black;
  }
  
  .cookie-banner-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    @media (min-width: 768px) {
      flex-direction: row;
      justify-content: space-between;
    }
  }
  
  .cookie-text {
    max-width: 800px;
    margin-bottom: 1rem;
    
    @media (min-width: 768px) {
      margin-bottom: 0;
      margin-right: 2rem;
    }
  }
  
  .cookie-title {
    font-size: 1.25rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    font-family: $font-family-base;
  }
  
  .cookie-description {
    font-size: 0.875rem;
    font-family: $font-family-text;
    line-height: 1.4;
  }
  
  .cookie-buttons {
    display: flex;
    flex-direction: column;
    
    @media (min-width: 576px) {
      flex-direction: row;
    }
  }
  
  .cookie-btn {
    padding: 0.5rem 1rem;
    margin: 0.25rem;
    border-radius: $border-radius;
    font-family: $font-family-base;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-1px);
    }
    
    &.cookie-btn-outline {
      background: transparent;
      border: 1px solid;
      
      .dark & {
        border-color: white;
        color: white;
      }
      
      .light & {
        border-color: $primary-color;
        color: $primary-color;
      }
    }
    
    &.cookie-btn-primary {
      background-color: $primary-color;
      color: white;
      border: none;
    }
  }
}
</style>