<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkoutStore } from '@/stores/workouts'
import { useExerciseStore } from '@/stores/exercises'
import { storeToRefs } from 'pinia'
import type { Workout } from '@/types/Workout'
import type { Exercise } from '@/types/Exercise'
import SectionContainer from '@/components/SectionContainer.vue'

const route = useRoute()
const router = useRouter()
const workoutStore = useWorkoutStore()
const exerciseStore = useExerciseStore()
const { workouts, loading, error } = storeToRefs(workoutStore)

const workout = ref<Workout | null>(null)
const workoutExercises = ref<{ exercise: Exercise, details: any }[]>([])
const loadingExercises = ref(false)

onMounted(async () => {
  try {
    const workoutId = parseInt(route.params.id as string)
    if (isNaN(workoutId)) {
      throw new Error('ID de entrenamiento inválido')
    }

    // Cargar el entrenamiento - mantenemos el código original que funciona
    await workoutStore.fetchWorkouts()
    workout.value = workouts.value.find(w => w.entrenamientoID === workoutId) || null

    if (!workout.value) {
      throw new Error('Entrenamiento no encontrado')
    }

    // Cargar los ejercicios asociados al entrenamiento
    loadingExercises.value = true

    try {
      // Primero cargamos todos los ejercicios
      await exerciseStore.fetchExercises()

      // Obtenemos los detalles de los ejercicios del entrenamiento
      // @ts-ignore
      const workoutExerciseData = await workoutStore.getWorkoutExercises(workoutId)

      if (workoutExerciseData && workoutExerciseData.length > 0) {
        workoutExercises.value = workoutExerciseData.map(relation => {
          const exercise = exerciseStore.exercises.find(e => e.ejercicioID === relation.ejercicioID)

          return {
            exercise: {
              ejercicioID: relation.ejercicioID,
              nombre: exercise?.nombre || 'Ejercicio no encontrado',
              descripcion: exercise?.descripcion || '',
              grupoMuscular: exercise?.grupoMuscular || '',
              imagenURL: exercise?.imagenURL,
              videoURL: exercise?.videoURL,
              equipamientoNecesario: exercise?.equipamientoNecesario || false,
              series: relation.series,  // ✅ Se agregan propiedades faltantes
              repeticiones: relation.repeticiones,
              descansoSegundos: relation.descansoSegundos,
              notas: relation.notas
            },
            details: {
              series: relation.series,
              repeticiones: relation.repeticiones,
              descansoSegundos: relation.descansoSegundos,
              notas: relation.notas
            }
          }
        })
      }

    } catch (exerciseErr) {
      console.error('Error cargando ejercicios:', exerciseErr)
    } finally {
      loadingExercises.value = false
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al cargar el entrenamiento'
  } finally {
    loading.value = false
  }
})

const goBack = () => {
  router.back()
}
</script>

<template>
  <v-container fluid>
    <!-- Loading State -->
    <div v-if="loading" class="d-flex justify-center align-center" style="min-height: 400px;">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </div>

    <!-- Error State -->
    <v-alert v-else-if="error" type="error" class="mb-4">
      {{ error }}
      <template v-slot:append>
        <v-btn color="error" variant="text" @click="goBack">
          Volver
        </v-btn>
      </template>
    </v-alert>

    <!-- Workout Details -->
    <SectionContainer v-else-if="workout">
      <v-row>
        <!-- Breadcrumb -->
        <v-col cols="12">
          <v-btn variant="text" color="primary" class="titulo" prepend-icon="mdi-arrow-left" @click="goBack">
            Volver a entrenamientos
          </v-btn>
        </v-col>
      </v-row>

      <v-card class="workout-card mb-4">
        <v-row>
          <!-- Workout Image -->
          <v-col cols="12" md="4">
            <v-img v-if="workout.imagenURL" :src="workout.imagenURL" height="250" cover class="workout-image"></v-img>
            <v-img v-else src="/api/placeholder/800/600" height="250" cover class="workout-image"></v-img>
          </v-col>

          <!-- Workout Information -->
          <v-col cols="12" md="8">
            <v-card-title class="workout-title">
              {{ workout.titulo }}
            </v-card-title>

            <v-card-text>
              <div class="workout-details mb-4">
                <v-chip
                  :color="workout.dificultad === 'Fácil' ? 'success' : workout.dificultad === 'Media' ? 'warning' : 'error'"
                  class="mr-2">
                  Dificultad: {{ workout.dificultad }}
                </v-chip>

                <v-chip color="primary">
                  Duración: {{ workout.duracionMinutos }} min
                </v-chip>
              </div>

              <div class="text-h6 mb-2">Descripción:</div>
              <p class="text-body-1">{{ workout.descripcion }}</p>
            </v-card-text>
          </v-col>
        </v-row>
      </v-card>

      <!-- Ejercicios del entrenamiento -->
      <v-card class="mt-6 workout-card">
        <v-card-title class="workout-title">
          <v-icon start color="white" class="me-2">mdi-dumbbell</v-icon>
          Ejercicios incluidos
        </v-card-title>

        <v-card-text>
          <div v-if="loadingExercises" class="d-flex justify-center my-4">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
          </div>

          <div v-else-if="workoutExercises.length === 0" class="text-center my-4">
            <p>No hay ejercicios asociados a este entrenamiento</p>
          </div>

          <v-row v-else>
            <v-col v-for="item in workoutExercises" :key="item.exercise.ejercicioID" cols="12" sm="6" md="4">
              <v-card class="exercise-card mb-4">
                <v-img v-if="item.exercise.imagenURL" :src="item.exercise.imagenURL" height="120" cover
                  class="exercise-image"></v-img>
                <v-card-title class="exercise-title d-flex justify-space-between align-center">
                  {{ item.exercise.nombre }}
                  <v-icon v-if="item.exercise.equipamientoNecesario" color="white" size="small"
                    title="Requiere equipamiento">
                    mdi-dumbbell
                  </v-icon>
                </v-card-title>

                <v-card-text>
                  <v-list>
                    <v-list-item prepend-icon="mdi-sync" class="exercise-detail">
                      <v-list-item-title>Series: {{ item.details.series }}</v-list-item-title>
                    </v-list-item>

                    <v-list-item prepend-icon="mdi-repeat" class="exercise-detail">
                      <v-list-item-title>Repeticiones: {{ item.details.repeticiones }}</v-list-item-title>
                    </v-list-item>

                    <v-list-item prepend-icon="mdi-timer" class="exercise-detail">
                      <v-list-item-title>Descanso: {{ item.details.descansoSegundos }}s</v-list-item-title>
                    </v-list-item>

                    <v-list-item v-if="item.details.notas" prepend-icon="mdi-note-text" class="exercise-detail">
                      <v-list-item-title>{{ item.details.notas }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" variant="text" :to="`/exercises/${item.exercise.ejercicioID}`"
                    density="comfortable">
                    Ver ejercicio
                    <v-icon end>mdi-arrow-right</v-icon>
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </SectionContainer>
  </v-container>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.titulo {
  margin-top: 1rem !important;
}

.section-container {
  padding: 0rem !important;
  margin-bottom: 2rem;
  border-radius: $border-radius;
}

.workout-card,
.exercise-card {
  border-radius: $border-radius;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.workout-title,
.exercise-title {
  background-color: $primary-color;
  color: white;
  padding: 1rem;
  font-size: 1.5rem;
  font-weight: 500;
  font-family: $font-family-base;
}

.workout-image {
  border-radius: $border-radius $border-radius 0 0;
}

.v-card-text {
  font-family: $font-family-text;
  padding: 1.5rem;
}

.workout-details {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.exercise-detail {
  padding: 4px 0 !important;
}

.exercise-image {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.text-body-1 {
  line-height: 1.6;
  opacity: 0.85;
}

.v-col-sm-6 {
  padding: 12px !important;
}

.v-btn {
  font-family: $font-family-base;
  border-radius: $border-radius;
  padding-right: 12px !important;
  padding-left: 12px !important;

  &:hover {
    transform: translateY(-1px);
  }
}

.v-chip {
  font-family: $font-family-base;
}

.mt-6 {
  margin-top: 2rem !important;
}

// Responsive
@media (max-width: 960px) {
  .v-container {
    padding: 1rem;
  }

  .workout-title,
  .exercise-title {
    font-size: 1.25rem;
  }

  .v-card {
    margin-bottom: 1rem;
  }
}
</style>