<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useExerciseStore } from '@/stores/exercises'
import { storeToRefs } from 'pinia'
import ExerciseCard from '@/components/ExerciseCard.vue'
import PageHeader from '@/components/PageHeader.vue'

const exerciseStore = useExerciseStore()
const { exercises, loading, error } = storeToRefs(exerciseStore)
const initialized = ref(false)

// Filtros
const searchQuery = ref('')
const selectedMuscleGroup = ref<string | null>(null)
const showEquipmentOnly = ref(false)

const muscleGroups = [
  'Pecho',
  'Espalda',
  'Hombros',
  'Bíceps',
  'Tríceps',
  'Piernas',
  'Abdominales',
  'Core'
]

onMounted(async () => {
  try {
    await exerciseStore.fetchExercises()
    initialized.value = true
  } catch (err) {
    // El error ya se maneja en el store
  }
})

// Filtrar ejercicios
const filteredExercises = computed(() => {
  if (!initialized.value) return []
  return exercises.value.filter(exercise => {
    // Filtrar por búsqueda
    const matchesSearch = exercise.nombre.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (exercise.descripcion?.toLowerCase().includes(searchQuery.value.toLowerCase()) ?? false)

    // Filtrar por grupo muscular
    const matchesMuscleGroup = !selectedMuscleGroup.value || 
      exercise.grupoMuscular === selectedMuscleGroup.value

    // Filtrar por equipamiento
    const matchesEquipment = !showEquipmentOnly.value || exercise.equipamientoNecesario

    return matchesSearch && matchesMuscleGroup && matchesEquipment
  })
})

// Limpiar filtros
const clearFilters = () => {
  searchQuery.value = ''
  selectedMuscleGroup.value = null
  showEquipmentOnly.value = false
}
</script>

<template>
  <v-container fluid>
    <!-- Hero Section -->
    <PageHeader 
      title="Catálogo de Ejercicios"
      subtitle="Explora nuestra colección completa de ejercicios para todos los niveles"
    />

    <!-- Filtros -->
    <v-row class="filters-container mb-8">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="searchQuery"
          label="Buscar ejercicios"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          clearable
          hide-details
        ></v-text-field>
      </v-col>

      <v-col cols="12" md="4">
        <v-select
          v-model="selectedMuscleGroup"
          :items="muscleGroups"
          label="Grupo muscular"
          prepend-inner-icon="mdi-muscle"
          variant="outlined"
          clearable
          hide-details
        ></v-select>
      </v-col>

      <v-col cols="12" md="3" class="d-flex align-center justify-center">
        <v-checkbox
          v-model="showEquipmentOnly"
          label="Solo ejercicios con equipamiento"
          color="primary"
          hide-details
        ></v-checkbox>
      </v-col>

      <v-col cols="12" md="1" class="d-flex justify-center align-center">
        <v-btn
          variant="text"
          @click="clearFilters"
          :disabled="!searchQuery && !selectedMuscleGroup && !showEquipmentOnly"
        >
          Limpiar
        </v-btn>
      </v-col>
    </v-row>

    <!-- Lista de Ejercicios -->
    <v-row v-if="!loading && !error">
      <v-col
        v-for="exercise in filteredExercises"
        :key="exercise.ejercicioID"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <ExerciseCard :exercise="exercise" />
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
    <v-row v-if="!loading && !error && filteredExercises.length === 0">
      <v-col cols="12" class="text-center">
        <v-alert type="info" class="mb-4">
          No se encontraron ejercicios con los filtros seleccionados
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.v-input {
  padding: 12px;
}

.v-col-md-4 {
  padding: 12px;
}

.v-container {
  padding-bottom: 2rem !important;
}

.filters-container {
  background-color: $light-gray;
  border-radius: $border-radius;
  padding: 1.5rem !important;
  margin: 1rem 0 2rem !important;
}

.v-text-field, .v-select {
  border-radius: $border-radius !important;
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

.v-checkbox {
  font-family: $font-family-text;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
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