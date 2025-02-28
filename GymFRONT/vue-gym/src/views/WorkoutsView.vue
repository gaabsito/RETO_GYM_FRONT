<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useWorkoutStore } from '@/stores/workouts'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const workoutStore = useWorkoutStore()
const authStore = useAuthStore()
const { workouts, loading, error } = storeToRefs(workoutStore)
const initialized = ref(false)

// Filtros
const searchQuery = ref('')
const selectedDifficulty = ref<string | null>(null)
const showPublicOnly = ref(false)

const difficulties = [
  'Fácil',
  'Media', 
  'Difícil'
]

onMounted(async () => {
  try {
    await workoutStore.fetchWorkouts()
    initialized.value = true
  } catch (err) {
    // El error ya se maneja en el store
  }
})

// Filtrar entrenamientos
const filteredWorkouts = computed(() => {
  if (!initialized.value) return []
  return workouts.value.filter(workout => {
    // Filtrar por búsqueda
    const matchesSearch = 
      workout.titulo.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (workout.descripcion?.toLowerCase().includes(searchQuery.value.toLowerCase()) ?? false)

    // Filtrar por dificultad
    const matchesDifficulty = !selectedDifficulty.value || 
      workout.dificultad === selectedDifficulty.value

    // Filtrar por público
    const matchesPublic = !showPublicOnly.value || workout.publico

    return matchesSearch && matchesDifficulty && matchesPublic
  })
})

// Limpiar filtros
const clearFilters = () => {
  searchQuery.value = ''
  selectedDifficulty.value = null
  showPublicOnly.value = false
}
</script>

<template>
  <v-container fluid>
    <!-- Hero Section -->
    <v-row class="mb-8">
      <v-col cols="12" class="d-flex flex-column flex-md-row justify-space-between align-center">
        <div class="text-center text-md-left">
          <h1 class="text-h3 mb-4">Entrenamientos</h1>
          <p class="text-body-1">
            Explora nuestra colección de entrenamientos para todos los niveles
          </p>
        </div>
        
        <!-- Botón para crear nuevo entrenamiento (solo para usuarios autenticados) -->
        <div v-if="authStore.isAuthenticated" class="mt-4 mt-md-0">
          <v-btn
            color="primary"
            size="large"
            to="/crear-entrenamiento"
            prepend-icon="mdi-plus"
            class="boton-crear"
          >
            Crear Entrenamiento
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Filtros -->
    <v-row class="filters-container">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="searchQuery"
          label="Buscar entrenamientos"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          clearable
          hide-details
        ></v-text-field>
      </v-col>

      <v-col cols="12" md="4">
        <v-select
          v-model="selectedDifficulty"
          :items="difficulties"
          label="Dificultad"
          prepend-inner-icon="mdi-signal-cellular-outline"
          variant="outlined"
          clearable
          hide-details
        ></v-select>
      </v-col>

      <v-col cols="12" md="3" class="d-flex align-center justify-center">
        <v-checkbox
          v-model="showPublicOnly"
          label="Solo entrenamientos públicos"
          color="primary"
          hide-details
        ></v-checkbox>
      </v-col>

      <v-col cols="12" md="1" class="d-flex justify-center align-center">
        <v-btn
          variant="text"
          @click="clearFilters"
          :disabled="!searchQuery && !selectedDifficulty && !showPublicOnly"
        >
          Limpiar
        </v-btn>
      </v-col>
    </v-row>

    <!-- Lista de Entrenamientos -->
    <v-row v-if="!loading && !error">
      <v-col
        v-for="workout in filteredWorkouts"
        :key="workout.entrenamientoID"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-hover v-slot="{ isHovering, props }">
          <v-card
            v-bind="props"
            :elevation="isHovering ? 8 : 2"
            class="h-100 workout-card"
          >
            <v-img
              :src="workout.imagenURL || '/api/placeholder/400/300'"
              height="200"
              cover
              class="bg-grey-lighten-2"
            >
              <template v-slot:placeholder>
                <v-row
                  class="fill-height ma-0"
                  align="center"
                  justify="center"
                >
                  <v-progress-circular
                    indeterminate
                    color="primary"
                  ></v-progress-circular>
                </v-row>
              </template>
            </v-img>

            <v-card-title class="text-truncate">
              {{ workout.titulo }}
              <v-chip 
                v-if="!workout.publico" 
                color="warning" 
                size="small" 
                class="ml-2"
              >
                Privado
              </v-chip>
            </v-card-title>

            <v-card-subtitle>
              <div class="d-flex align-center">
                <v-icon 
                  size="small"
                  :color="
                    workout.dificultad === 'Fácil' ? 'success' : 
                    workout.dificultad === 'Media' ? 'warning' : 'error'
                  "
                  class="me-2"
                >
                  mdi-signal-cellular-{{
                    workout.dificultad === 'Fácil' ? '1' : 
                    workout.dificultad === 'Media' ? '2' : '3'
                  }}
                </v-icon>
                {{ workout.dificultad }} | {{ workout.duracionMinutos }} min
              </div>
            </v-card-subtitle>

            <v-card-text>
              <p class="text-truncate">{{ workout.descripcion }}</p>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                variant="text"
                color="primary"
                :to="`/entrenamientos/${workout.entrenamientoID}`"
              >
                Ver más
                <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <v-row v-else-if="loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
      </v-col>
    </v-row>

    <!-- Error State -->
    <v-row v-else>
      <v-col cols="12">
        <v-alert type="error" class="mb-4">
          {{ error }}
        </v-alert>
      </v-col>
    </v-row>

    <!-- No Results -->
    <v-row v-if="!loading && !error && filteredWorkouts.length === 0">
      <v-col cols="12" class="text-center">
        <v-alert type="info" class="mb-4">
          No se encontraron entrenamientos con los filtros seleccionados
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.v-text-field {
    padding: 12px !important;
}

.v-col-sm-6 {
    padding: 12px !important;
}

.v-btn {
  padding-right: 12px !important;
  padding-left: 12px !important;
}

.v-container {
  padding-top: 2rem !important;
  padding-bottom: 2rem !important;
}

.v-card-title {
  background-color: $primary-color;
  padding: 12px !important;
}

.workout-card {
  border-radius: $border-radius;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-5px);
  }

  .v-card-title {
    color: white !important;
    font-size: 1.25rem;
    font-weight: 500;
    line-height: 1.6;
    padding: 1rem;
  }

  .v-card-subtitle {
    padding: 1rem;
    opacity: 0.8;
    font-size: 0.9rem;
  }

  .v-card-text {
    padding: 1rem;
    line-height: 1.6;
  }

  .v-card-actions {
    padding: 1rem;
  }

  .v-img {
    border-radius: $border-radius $border-radius 0 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }
}

:deep(.v-field) {
  border-radius: $border-radius !important;
}

.filters-container {
  background-color: $light-gray;
  border-radius: $border-radius;
  padding: 1.5rem;
  margin-top: 1rem;
  margin-bottom: 1rem !important;
}

.v-btn {
  font-family: $font-family-base;
  border-radius: $border-radius;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
  }
}

.v-checkbox {
  font-family: $font-family-text;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
}

.text-h3 {
  font-weight: 700;
  letter-spacing: -0.5px;
  margin-bottom: 1rem;
}

.boton-crear {
  margin: 2rem !important;
}

.text-body-1 {
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
  opacity: 0.85;
}

// Filtros
.mb-8 {
  border-radius: $border-radius;
  padding: 1.5rem;
  margin: 1rem 0 1rem !important;
}

// Mejoras en los alerts
:deep(.v-alert) {
  border-radius: $border-radius;
  font-family: $font-family-text;
}

// Responsive adjustments
@media (max-width: 600px) {
  .v-container {
    padding: 0.5rem !important;
  }

  .text-h3 {
    font-size: 1.8rem !important;
  }

  .v-card {
    margin-bottom: 1rem;
  }
}
</style>