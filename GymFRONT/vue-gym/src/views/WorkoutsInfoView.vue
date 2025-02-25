<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useWorkoutStore } from '@/stores/workouts'
import { storeToRefs } from 'pinia'

const workoutStore = useWorkoutStore()
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
      <v-col cols="12" class="text-center">
        <h1 class="text-h3 mb-4">Entrenamientos</h1>
        <p class="text-body-1">
          Explora nuestra colección de entrenamientos para todos los niveles
        </p>
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
        <v-card class="h-100 workout-card">
          <v-img
            :src="workout.imagenURL || '/api/placeholder/400/300'"
            height="200"
            cover
            class="bg-grey-lighten-2"
          ></v-img>

          <v-card-title>
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
                mdi-signal-cellular-{ {
                  workout.dificultad === 'Fácil' ? '1' : 
                  workout.dificultad === 'Media' ? '2' : '3'
                }}
              </v-icon>
              {{ workout.dificultad }} | {{ workout.duracionMinutos }} min
            </div>
          </v-card-subtitle>

          <v-card-text>
            <p>{{ workout.descripcion }}</p>
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
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.workout-card {
  border-radius: 12px;
  transition: all 0.3s ease-in-out;

  &:hover {
    transform: translateY(-5px);
  }

  .v-card-title {
    font-size: 1.2rem;
    font-weight: 500;
  }
}
</style>
