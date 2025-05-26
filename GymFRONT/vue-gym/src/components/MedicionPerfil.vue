<!-- src/components/ProfileMeasurementComponent.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useMedicionStore } from '@/stores/medicion';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import type { Medicion } from '@/types/Medicion';

// Stores
const medicionStore = useMedicionStore();
const authStore = useAuthStore();
const router = useRouter();
const { mediciones, loading, error } = storeToRefs(medicionStore);

// Load measurements on component mount
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    return;
  }

  try {
    if (mediciones.value.length === 0) {
      await medicionStore.fetchMediciones();
    }
  } catch (err) {
    console.error('Error loading measurements:', err);
  }
});

// Computed values for display
const latestMeasurement = computed<Medicion | null>(() => {
  if (mediciones.value.length === 0) return null;
  return mediciones.value[0]; // Assuming they're sorted by date (newest first)
});

const previousMeasurement = computed<Medicion | null>(() => {
  if (mediciones.value.length < 2) return null;
  return mediciones.value[1];
});

const weightChange = computed(() => {
  if (!latestMeasurement.value?.peso || !previousMeasurement.value?.peso) return null;
  return latestMeasurement.value.peso - previousMeasurement.value.peso;
});

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString();
};

// Navigate to full measurements page
const goToMeasurements = () => {
  router.push('/mediciones');
};
</script>

<template>
  <v-card class="profile-section">
    <v-card-title class="profile-section-title">
      <v-icon start class="mr-2">mdi-scale-bathroom</v-icon>
      Medidas Corporales
      <v-btn 
        color="primary" 
        variant="outlined" 
        @click="goToMeasurements" 
        class="ml-auto"
        density="comfortable"
        size="small"
      >
        Ver todo
      </v-btn>
    </v-card-title>

    <v-card-text>
      <!-- Loading state -->
      <div v-if="loading" class="d-flex justify-center py-4">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>

      <!-- No data state -->
      <div v-else-if="!latestMeasurement" class="text-center py-4">
        <v-icon color="grey-lighten-1" size="48">mdi-scale-bathroom</v-icon>
        <p class="text-body-1 mt-2">No hay mediciones registradas</p>
        <v-btn 
          color="primary" 
          variant="text" 
          @click="goToMeasurements" 
          class="mt-2"
          prepend-icon="mdi-plus"
        >
          Registrar primera medición
        </v-btn>
      </div>

      <!-- Measurement data -->
      <div v-else>
        <div class="d-flex align-center mb-2">
          <div class="text-subtitle-1 font-weight-bold">Última medición:</div>
          <div class="ml-2 text-caption">{{ formatDate(latestMeasurement.fecha) }}</div>
        </div>

        <!-- Key measurements summary -->
        <div class="d-flex flex-wrap measurement-summary">
          <!-- Weight -->
          <div class="measurement-item" v-if="latestMeasurement.peso">
            <div class="measurement-label">Peso</div>
            <div class="measurement-value">{{ latestMeasurement.peso }} kg</div>
            <div v-if="weightChange !== null" class="measurement-change" :class="weightChange < 0 ? 'success--text' : 'error--text'">
              <v-icon size="small" :color="weightChange < 0 ? 'success' : 'error'">
                {{ weightChange < 0 ? 'mdi-arrow-down' : 'mdi-arrow-up' }}
              </v-icon>
              {{ Math.abs(weightChange).toFixed(1) }} kg
            </div>
          </div>

          <!-- IMC -->
          <div class="measurement-item" v-if="latestMeasurement.imc">
            <div class="measurement-label">IMC</div>
            <div class="measurement-value">{{ latestMeasurement.imc.toFixed(1) }}</div>
            <div class="measurement-category text-caption">
              {{ latestMeasurement.imc < 18.5 
                ? 'Bajo peso' 
                : latestMeasurement.imc < 25 
                  ? 'Peso normal' 
                  : latestMeasurement.imc < 30 
                    ? 'Sobrepeso' 
                    : 'Obesidad' }}
            </div>
          </div>

          <!-- Body Fat -->
          <div class="measurement-item" v-if="latestMeasurement.porcentajeGrasa">
            <div class="measurement-label">Grasa Corporal</div>
            <div class="measurement-value">{{ latestMeasurement.porcentajeGrasa }}%</div>
          </div>

          <!-- Waist circumference -->
          <div class="measurement-item" v-if="latestMeasurement.circunferenciaCintura">
            <div class="measurement-label">Cintura</div>
            <div class="measurement-value">{{ latestMeasurement.circunferenciaCintura }} cm</div>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.profile-section {
  border-radius: $border-radius;
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.profile-section-title {
  background-color: $primary-color;
  color: white;
  display: flex;
  align-items: center;
  font-family: $font-family-base;
  padding: 0.75rem 1rem;
}

.measurement-summary {
  gap: 1rem;
  justify-content: space-between;
}

.measurement-item {
  flex: 1;
  min-width: 110px;
  background-color: $light-gray;
  border-radius: $border-radius;
  padding: 0.75rem;
  text-align: center;
  margin-bottom: 0.5rem;
  
  .measurement-label {
    font-size: 0.8rem;
    color: rgba(0, 0, 0, 0.6);
    font-family: $font-family-text;
  }
  
  .measurement-value {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0.25rem 0;
    font-family: $font-family-base;
  }
  
  .measurement-change {
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
  }
  
  .measurement-category {
    font-size: 0.8rem;
  }
}

// Mobile optimizations
@media (max-width: 600px) {
  .measurement-item {
    min-width: 90px;
    padding: 0.5rem;
    
    .measurement-value {
      font-size: 1.1rem;
    }
  }
}
</style>