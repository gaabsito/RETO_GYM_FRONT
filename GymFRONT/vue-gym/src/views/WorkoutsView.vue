<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useWorkoutStore } from '@/stores/workouts'
import { storeToRefs } from 'pinia'
import PageHeader from '@/components/PageHeader.vue'
import SectionContainer from '@/components/SectionContainer.vue'
import WorkoutCard from '@/components/WorkoutCard.vue'
import backgroundImage from '@/assets/images/arnold.jpg' // Imagina que este es el path a tu imagen

const workoutStore = useWorkoutStore()
const { workouts, loading, error } = storeToRefs(workoutStore)
const initialized = ref(false)

// Filtros
const searchQuery = ref('')
const selectedDifficulty = ref<string | null>(null)
const sortBy = ref('recent')

const difficultyOptions = ['Fácil', 'Media', 'Difícil']

onMounted(async () => {
  try {
    await workoutStore.fetchWorkouts()
    initialized.value = true
  } catch (err) {
    // El error ya se maneja en el store
  }
})

// Filtrar y ordenar entrenamientos
const filteredWorkouts = computed(() => {
  if (!initialized.value) return []
  
  let result = [...workouts.value]
  
  // Aplicar filtro de búsqueda
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(workout => 
      workout.titulo.toLowerCase().includes(query) || 
      (workout.descripcion && workout.descripcion.toLowerCase().includes(query))
    )
  }
  
  // Aplicar filtro de dificultad
  if (selectedDifficulty.value) {
    result = result.filter(workout => workout.dificultad === selectedDifficulty.value)
  }
  
  // Aplicar ordenamiento
  if (sortBy.value === 'recent') {
    result.sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
  } else if (sortBy.value === 'duration-asc') {
    result.sort((a, b) => a.duracionMinutos - b.duracionMinutos)
  } else if (sortBy.value === 'duration-desc') {
    result.sort((a, b) => b.duracionMinutos - a.duracionMinutos)
  }
  
  return result
})

// Limpiar filtros
const clearFilters = () => {
  searchQuery.value = ''
  selectedDifficulty.value = null
  sortBy.value = 'recent'
}
</script>

<template>
  <v-container fluid>
    <!-- Hero Section -->
    <PageHeader 
      title="Entrenamientos"
      subtitle="Descubre rutinas diseñadas por profesionales para todos los niveles"
      :backgroundImage="backgroundImage"
    />

    <!-- Filtros -->
    <v-row class="filters-container mb-8">
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

      <v-col cols="12" md="3">
        <v-select
          v-model="selectedDifficulty"
          :items="difficultyOptions"
          label="Dificultad"
          prepend-inner-icon="mdi-signal"
          variant="outlined"
          clearable
          hide-details
        ></v-select>
      </v-col>

      <v-col cols="12" md="3">
        <v-select
          v-model="sortBy"
          :items="[
            { text: 'Más recientes', value: 'recent' },
            { text: 'Duración: Menor a mayor', value: 'duration-asc' },
            { text: 'Duración: Mayor a menor', value: 'duration-desc' }
          ]"
          label="Ordenar por"
          prepend-inner-icon="mdi-sort"
          variant="outlined"
          hide-details
        ></v-select>
      </v-col>

      <v-col cols="12" md="2" class="d-flex justify-center align-center">
        <v-btn
          variant="text"
          @click="clearFilters"
          :disabled="!searchQuery && !selectedDifficulty && sortBy === 'recent'"
        >
          Limpiar filtros
        </v-btn>
      </v-col>
    </v-row>

    <!-- Lista de Entrenamientos -->
    <SectionContainer>
      <v-row v-if="!loading && !error">
        <v-col
          v-for="workout in filteredWorkouts"
          :key="workout.entrenamientoID"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <WorkoutCard :workout="workout" :showDescription="true" />
        </v-col>
      </v-row>

      <!-- Loading State -->
      <v-row v-else-if="loading">
        <v-col cols="12" class="text-center">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
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
    </SectionContainer>
  </v-container>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.v-container {
  padding-top: 2rem !important;
  padding-bottom: 2rem !important;
}

.filters-container {
  background-color: $light-gray;
  border-radius: $border-radius;
  padding: 1.5rem !important;
  margin: 1rem 0 2rem !important;
}

:deep(.v-field) {
  border-radius: $border-radius !important;
}

.v-btn {
  font-family: $font-family-base;
  border-radius: $border-radius;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
  }
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
  
  .filters-container {
    padding: 1rem !important;
  }
}
</style>