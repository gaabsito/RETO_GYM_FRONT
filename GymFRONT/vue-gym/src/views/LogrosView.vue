<!-- src/views/LogrosView.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useLogrosStore } from '@/stores/logros';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import LogroPanel from '@/components/LogroPanel.vue';
import LogroNotification from '@/components/LogroNotification.vue';
import PageHeader from '@/components/PageHeader.vue';
//import heroImage from '@/assets/images/logros.jpg'; // Imagen de fondo para la cabecera

const logrosStore = useLogrosStore();
const authStore = useAuthStore();
const router = useRouter();

// Estados
const loading = ref(false);
const showAchievementModal = ref(false);
const activeTab = ref(0);

// Tabs
const tabs = [
  { title: 'TODOS', icon: 'mdi-trophy-outline' },
  { title: 'DESBLOQUEADOS', icon: 'mdi-lock-open-outline' },
  { title: 'PROGRESO', icon: 'mdi-chart-line' }
];

// Comprobar autenticación
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login?redirect=/logros');
    return;
  }
  
  // Mostrar modal de notificación si hay nuevos logros
  checkNewAchievements();
});

// Comprobar nuevos logros
const checkNewAchievements = async () => {
  try {
    loading.value = true;
    
    // Verificar logros actuales
    await logrosStore.verificarLogros();
    
    // Obtener logros recientes
    const recientes = await logrosStore.fetchLogrosRecientes();
    
    // Si hay logros recientes, mostrar notificación
    if (recientes.length > 0) {
      showAchievementModal.value = true;
    }
  } catch (error) {
    console.error('Error al comprobar nuevos logros:', error);
  } finally {
    loading.value = false;
  }
};

// Cerrar modal de notificación
const closeNotificationModal = () => {
  showAchievementModal.value = false;
};
</script>

<template>
  <div>
    <!-- Hero Section -->
    <PageHeader 
      title="Mis Logros"
      subtitle="Descubre y desbloquea logros para mostrar tu progreso"
      :backgroundImage="heroImage"
    >
      <v-btn 
        color="#2d3a4e"
        size="x-large" 
        prepend-icon="mdi-refresh" 
        @click="checkNewAchievements"
        :loading="loading"
        class="mt-4 verify-logros-button"
        rounded="pill"
        elevation="5"
        min-width="200"
      >
        <span class="button-text">VERIFICAR LOGROS</span>
      </v-btn>
    </PageHeader>
    
    <v-container>
      <!-- Tabs -->
      <v-card class="mb-6">
        <v-tabs
          v-model="activeTab"
          bg-color="primary"
          align-tabs="center"
          slider-color="white"
          class="logros-tabs"
        >
          <v-tab 
            v-for="(tab, index) in tabs" 
            :key="index" 
            :value="index" 
            class="white--text tab-item"
          >
            <v-icon start color="white" class="mr-2">{{ tab.icon }}</v-icon>
            {{ tab.title }}
          </v-tab>
        </v-tabs>
      </v-card>
      
      <!-- Tab Content -->
      <v-window v-model="activeTab">
        <!-- Todos los logros -->
        <v-window-item :value="0">
          <LogroPanel :show-progress="true" />
        </v-window-item>
        
        <!-- Solo desbloqueados -->
        <v-window-item :value="1">
          <LogroPanel :show-only-unlocked="true" />
        </v-window-item>
        
        <!-- Progreso -->
        <v-window-item :value="2">
          <LogroPanel :show-progress="true" />
        </v-window-item>
      </v-window>
    </v-container>
    
    <!-- Modal de notificación de logros -->
    <LogroNotification 
      :show="showAchievementModal"
      @close="closeNotificationModal"
    />
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.logros-tabs {
  background-color: $primary-color;
  border-radius: $border-radius;
}

:deep(.logros-tabs .v-tab) {
  color: white;
  opacity: 0.8;
  padding: 1rem 1.5rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  font-family: $font-family-base;
}

:deep(.logros-tabs .v-tab--selected) {
  opacity: 1;
  font-weight: 700;
}

.tab-item {
  margin: 0 16px;
}

.verify-logros-button {
  background-color: #2d3a4e !important;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 0.75rem 2rem !important;
  transition: all 0.3s ease;
  text-transform: uppercase;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3) !important;
  
  .v-icon {
    font-size: 1.2rem;
    margin-right: 0.5rem;
  }
  
  .button-text {
    font-family: $font-family-base;
    font-size: 0.95rem;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4) !important;
    background-color: #37465e !important;
  }
  
  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2) !important;
    background-color: #263044 !important;
  }
  
  @media (max-width: 600px) {
    min-width: 180px;
    margin: 1rem auto !important;
    
    .button-text {
      font-size: 0.85rem;
    }
  }
}

@media (max-width: 600px) {
  .tab-item {
    margin: 0;
    font-size: 0.9rem;
  }
  
  :deep(.logros-tabs .v-tab) {
    padding: 0.8rem 1rem;
  }
}
</style>