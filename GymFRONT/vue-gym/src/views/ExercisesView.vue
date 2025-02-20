<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useExerciseStore } from '@/stores/exercises'
import { storeToRefs } from 'pinia'

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
    <v-row class="mb-8">
      <v-col cols="12" class="text-center">
        <h1 class="text-h3 mb-4">Catálogo de Ejercicios</h1>
        <p class="text-body-1">
          Explora nuestra colección completa de ejercicios para todos los niveles
        </p>
      </v-col>
    </v-row>

    <!-- Filtros -->
    <v-row class="mb-8">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="searchQuery"
          label="Buscar ejercicios"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          clearable
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
        ></v-select>
      </v-col>

      <v-col cols="12" md="3" class="d-flex align-center">
        <v-checkbox
          v-model="showEquipmentOnly"
          label="Solo ejercicios con equipamiento"
          color="primary"
          hide-details
        ></v-checkbox>
      </v-col>

      <v-col cols="12" md="1" class="d-flex align-center">
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
        <v-hover v-slot="{ isHovering, props }">
          <v-card
            v-bind="props"
            :elevation="isHovering ? 8 : 2"
            class="h-100"
          >
            <v-img
              :src="exercise.imagenURL || '/api/placeholder/400/300'"
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
              {{ exercise.nombre }}
              <v-icon
                v-if="exercise.equipamientoNecesario"
                color="primary"
                class="ms-2"
                size="small"
                title="Requiere equipamiento"
              >
                mdi-dumbbell
              </v-icon>
            </v-card-title>

            <v-card-subtitle>
              <v-icon size="small" class="me-1">mdi-muscle</v-icon>
              {{ exercise.grupoMuscular }}
            </v-card-subtitle>

            <v-card-text>
              <p class="text-truncate">{{ exercise.descripcion }}</p>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                variant="text"
                color="primary"
                :to="`/ejercicios/${exercise.ejercicioID}`"
              >
                Ver detalles
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

.v-card {
  border-radius: $border-radius;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
}

:deep(.v-field) {
  border-radius: $border-radius !important;
}

.v-btn {
  font-family: $font-family-base;
  border-radius: $border-radius;
}

.v-checkbox {
  font-family: $font-family-text;
}
</style>