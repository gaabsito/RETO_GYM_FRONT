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

.v-text-field {
    padding: 12px !important;
}

.v-col-sm-6 {
    padding: 12px !important;
}

.v-container {
  padding-top: 2rem !important;
  padding-bottom: 2rem !important;
}

.v-card {
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

.text-body-1 {
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
  opacity: 0.85;
}

.hero-section {
  padding: 3rem 0;
}

// Mejoras en los filtros
.mb-8 {
  border-radius: $border-radius;
  padding: 1.5rem;
  margin: 1rem 0 2rem !important;
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