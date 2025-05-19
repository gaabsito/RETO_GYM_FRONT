<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRolesStore } from '@/stores/roles';
import { useRutinasCompletadasStore } from '@/stores/rutinasCompletadas';
import EntrenamientoCalendar from '@/components/EntrenamientoCalendar.vue';
import UserRole from '@/components/UserRole.vue';

const authStore = useAuthStore();
const rolesStore = useRolesStore();
const rutinasStore = useRutinasCompletadasStore();
const activeTab = ref('calendar');

// Función para refrescar datos de progreso
const refreshProgressData = async () => {
  if (!authStore.isAuthenticated) return;
  
  try {
    // Obtener datos actualizados de entrenamientos
    await rutinasStore.fetchRutinasCompletadas();
    await rutinasStore.fetchResumen();
    
    // Obtener rol actualizado
    await rolesStore.getUserRole();
    
    console.log('Datos de progreso actualizados correctamente');
  } catch (error) {
    console.error('Error al actualizar datos de progreso:', error);
  }
};

// Cargar datos iniciales
onMounted(async () => {
  await refreshProgressData();
  
  // Configurar un intervalo para refrescar los datos periódicamente (cada 30 segundos)
  const refreshInterval = setInterval(refreshProgressData, 30000);
  
  // Limpiar el intervalo cuando el componente se desmonta
  onBeforeUnmount(() => {
    clearInterval(refreshInterval);
  });
});

// Si cambia de pestaña, asegurarse de refrescar los datos
watch(activeTab, async () => {
  await refreshProgressData();
});
</script>

<template>
  <div class="user-progress-container">
    <h3 class="section-title">Mi Progreso de Entrenamiento</h3>
    
    <!-- Tabs de navegación -->
    <v-tabs v-model="activeTab" color="primary" align-tabs="center" grow>
      <v-tab value="calendar" class="tab-button">
        <v-icon start class="me-1">mdi-calendar-check</v-icon>
        Calendario
      </v-tab>
      <v-tab value="role" class="tab-button">
        <v-icon start class="me-1">mdi-shield-account</v-icon>
        Nivel
      </v-tab>
    </v-tabs>
    
    <!-- Contenido de las pestañas -->
    <v-window v-model="activeTab" class="tab-content">
      <!-- Pestaña de Calendario -->
      <v-window-item value="calendar" class="pa-4">
        <EntrenamientoCalendar :showWeekProgress="true" />
        
        <div class="note-container mt-4">
          <v-alert type="info" variant="tonal" density="compact">
            <v-icon start size="small">mdi-information-outline</v-icon>
            Los entrenamientos se muestran en el calendario según la fecha en que los has completado. Para entrenar un día específico, selecciona la fecha al marcar un entrenamiento como completado.
          </v-alert>
        </div>
      </v-window-item>
      
      <!-- Pestaña de Roles -->
      <v-window-item value="role" class="pa-4">
        <UserRole :show-next-role="true" />
        
        <!-- Detalle adicional sobre cómo se calculan los roles -->
        <v-card class="mt-4" variant="outlined">
          <v-card-text>
            <div class="text-subtitle-2 mb-2">
              <v-icon start size="small" color="primary">mdi-information-outline</v-icon>
              ¿Cómo se calcula mi nivel?
            </div>
            <p class="text-body-2">
              Tu nivel se determina según los <strong>días únicos</strong> que entrenas cada semana.
              El objetivo es completar entrenamientos en días diferentes para subir de nivel, alcanzando el nivel máximo al entrenar los 7 días de la semana.
            </p>
            <p class="text-caption mt-2">
              <strong>Importante:</strong> Al comenzar una nueva semana, tu progreso se reinicia y deberás volver a entrenar para mantener o mejorar tu nivel.
            </p>
          </v-card-text>
        </v-card>
        
        <!-- Sugerencia para mejorar el nivel -->
        <v-card class="mt-4" variant="outlined" color="primary">
          <v-card-text class="text-center">
            <p class="text-h6 white--text mb-2">Consejo para mejorar</p>
            <p class="text-body-2 text-black">
              Intenta distribuir tus entrenamientos a lo largo de la semana en lugar de acumularlos en pocos días. ¡La consistencia diaria es la clave para alcanzar el nivel Élite!
            </p>
          </v-card-text>
        </v-card>
      </v-window-item>
    </v-window>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.user-progress-container {
  width: 100%;
  background-color: white;
  border-radius: $border-radius;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding: 1rem;
  font-family: $font-family-base;
  border-bottom: 1px solid $light-gray;
  color: $secondary-color;
}

.tab-button {
  font-family: $font-family-base;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tab-content {
  background-color: #fafafa;
  min-height: 400px;
}

.note-container {
  margin-top: 16px;
  font-family: $font-family-text;
}

// Responsive
@media (max-width: 599px) {
  .section-title {
    font-size: 1.1rem;
    padding: 0.8rem;
  }
  
  .tab-content {
    min-height: 350px;
  }
  
  .tab-button {
    font-size: 0.9rem;
  }
}
</style>