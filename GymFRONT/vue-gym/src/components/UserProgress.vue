<!-- src/components/UserProgress.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import EntrenamientoCalendar from '@/components/EntrenamientoCalendar.vue';
import UserRole from '@/components/UserRole.vue';

const authStore = useAuthStore();
const activeTab = ref('calendar');
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
        <EntrenamientoCalendar />
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
              Tu nivel se determina según la cantidad de días que entrenas cada semana.
              Cuantos más días completes entrenamientos, más alto será tu nivel. ¡El máximo es 7 días a la semana!
            </p>
            <p class="text-caption mt-2">
              Completar entrenamientos regularmente te ayudará a subir de nivel y mantener tu progreso.
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
</style>