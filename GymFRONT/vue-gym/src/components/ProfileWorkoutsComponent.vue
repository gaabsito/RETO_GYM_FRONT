<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useWorkoutStore } from '@/stores/workouts'
import { useAuthStore } from '@/stores/auth'
import WorkoutCard from '@/components/WorkoutCard.vue'

const workoutStore = useWorkoutStore()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref<string | null>(null)
const userWorkouts = ref<any[]>([])

// Filtros
const searchQuery = ref('')
const selectedDifficulty = ref<string | null>(null)
const difficulties = ['Fácil', 'Media', 'Difícil']

// Cargar entrenamientos del usuario
onMounted(async () => {
  try {
    loading.value = true
    await workoutStore.fetchWorkouts()
    
    // Filtrar entrenamientos del usuario actual
    if (authStore.user && authStore.user.usuarioID) {
      userWorkouts.value = workoutStore.workouts.filter(workout => 
        workout.autorID === authStore.user?.usuarioID
      )
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al cargar entrenamientos'
  } finally {
    loading.value = false
  }
})

// Filtrar entrenamientos
const filteredWorkouts = computed(() => {
  return userWorkouts.value.filter(workout => {
    // Filtrar por búsqueda
    const matchesSearch = 
      workout.titulo.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (workout.descripcion?.toLowerCase().includes(searchQuery.value.toLowerCase()) ?? false)

    // Filtrar por dificultad
    const matchesDifficulty = !selectedDifficulty.value || 
      workout.dificultad === selectedDifficulty.value

    return matchesSearch && matchesDifficulty
  })
})

// Eliminar entrenamiento
const deleteWorkout = async (workoutId: number) => {
  try {
    if (confirm('¿Estás seguro de que deseas eliminar este entrenamiento?')) {
      await workoutStore.deleteWorkout(workoutId)
      
      // Actualizar la lista de entrenamientos local
      userWorkouts.value = userWorkouts.value.filter(w => w.entrenamientoID !== workoutId)
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al eliminar entrenamiento'
  }
}

// Limpiar filtros
const clearFilters = () => {
  searchQuery.value = ''
  selectedDifficulty.value = null
}
</script>

<template>
  <v-card>
    <v-card-title class="profile-section-title">
      Mis Entrenamientos
      <v-btn 
        color="primary" 
        size="small" 
        to="/crear-entrenamiento" 
        prepend-icon="mdi-plus"
        class="ml-2"
      >
        Crear Nuevo
      </v-btn>
    </v-card-title>

    <v-card-text>
      <!-- Filtros -->
      <v-row class="filters-container mb-4">
        <v-col cols="12" md="5">
          <v-text-field
            v-model="searchQuery"
            label="Buscar entrenamientos"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            clearable
            hide-details
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="5">
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

        <v-col cols="12" md="2" class="d-flex justify-center align-center">
          <v-btn
            variant="text"
            @click="clearFilters"
            :disabled="!searchQuery && !selectedDifficulty"
          >
            Limpiar
          </v-btn>
        </v-col>
      </v-row>

      <!-- Loading State -->
      <v-row v-if="loading" class="mt-4">
        <v-col cols="12" class="text-center">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          ></v-progress-circular>
        </v-col>
      </v-row>

      <!-- Error State -->
      <v-row v-else-if="error" class="mt-4">
        <v-col cols="12">
          <v-alert type="error" class="mb-4">
            {{ error }}
          </v-alert>
        </v-col>
      </v-row>

      <!-- No Workouts State -->
      <v-row v-else-if="userWorkouts.length === 0" class="mt-4">
        <v-col cols="12">
          <v-alert type="info" class="mb-4">
            Aún no has creado ningún entrenamiento. ¡Crea tu primer entrenamiento ahora!
          </v-alert>
        </v-col>
      </v-row>

      <!-- No Results After Filtering -->
      <v-row v-else-if="filteredWorkouts.length === 0" class="mt-4">
        <v-col cols="12" class="text-center">
          <v-alert type="info" class="mb-4">
            No se encontraron entrenamientos con los filtros seleccionados
          </v-alert>
        </v-col>
      </v-row>

      <!-- Workouts List -->
      <v-row v-else class="mt-4">
        <v-col
          v-for="workout in filteredWorkouts"
          :key="workout.entrenamientoID"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card class="workout-card" elevation="2">
            <WorkoutCard :workout="workout" />
            
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn 
                color="error" 
                variant="text" 
                @click="deleteWorkout(workout.entrenamientoID)"
              >
                Eliminar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.profile-section-title {
  background-color: $primary-color;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.filters-container {
  background-color: $light-gray;
  border-radius: $border-radius;
  padding: 1rem;
}

.workout-card {
  margin-bottom: 1rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
  }
}

.v-btn {
  font-family: $font-family-base;
  border-radius: $border-radius;
}

:deep(.v-field) {
  border-radius: $border-radius !important;
}

:deep(.v-alert) {
  border-radius: $border-radius;
  font-family: $font-family-text;
}
</style>