<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkoutStore } from '@/stores/workouts'
import { useExerciseStore } from '@/stores/exercises'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import type { Workout } from '@/types/Workout'
import type { Exercise } from '@/types/Exercise'
import SectionContainer from '@/components/SectionContainer.vue'
import CommentForm from '@/components/CommentForm.vue'
import CommentList from '@/components/CommentList.vue'

const route = useRoute()
const router = useRouter()
const workoutStore = useWorkoutStore()
const exerciseStore = useExerciseStore()
const authStore = useAuthStore()
const { workouts, loading, error } = storeToRefs(workoutStore)

const workout = ref<Workout | null>(null)
const workoutExercises = ref<{ exercise: Exercise, details: any }[]>([])
const loadingExercises = ref(false)
const selectedTabIndex = ref(0)
const accessDenied = ref(false)

const tabs = [
  { title: 'Información', icon: 'mdi-information-outline' },
  { title: 'Ejercicios', icon: 'mdi-dumbbell' },
  { title: 'Comentarios', icon: 'mdi-comment-multiple-outline' }
]

// Formatear duración para mostrar de manera más legible
const formattedDuration = computed(() => {
  if (!workout.value) return ''
  const hours = Math.floor(workout.value.duracionMinutos / 60)
  const minutes = workout.value.duracionMinutos % 60

  if (hours > 0) {
    return `${hours}h ${minutes > 0 ? minutes + 'min' : ''}`
  }
  return `${minutes} min`
})

// Determinar el color de la dificultad
const difficultyColor = computed(() => {
  if (!workout.value) return 'primary'

  switch (workout.value.dificultad) {
    case 'Fácil': return 'success'
    case 'Media': return 'warning'
    case 'Difícil': return 'error'
    default: return 'primary'
  }
})

// Determinar si el usuario actual es el autor
const isAuthor = computed(() => {
  return authStore.isAuthenticated &&
    authStore.user &&
    workout.value &&
    workout.value.autorID === authStore.user.usuarioID
})

onMounted(async () => {
  try {
    const workoutId = parseInt(route.params.id as string)
    if (isNaN(workoutId)) {
      throw new Error('ID de entrenamiento inválido')
    }

    try {
      // Primero intentamos cargar el entrenamiento
      await workoutStore.fetchWorkouts()
      workout.value = workouts.value.find(w => w.entrenamientoID === workoutId) || null

      // Si no lo encontramos en el store, intentamos cargarlo directamente
      if (!workout.value) {
        try {
          workout.value = await workoutStore.getWorkoutById(workoutId)
        } catch (e) {
          // Verificar si es un error de permisos
          if (e instanceof Error && e.message.includes('permiso')) {
            accessDenied.value = true
            throw new Error('No tienes permiso para ver este entrenamiento privado')
          } else {
            throw e
          }
        }
      }

      if (!workout.value) {
        throw new Error('Entrenamiento no encontrado')
      }

      // Verificación extra de privacidad
      if (!workout.value.publico && 
          (!authStore.isAuthenticated || 
           workout.value.autorID !== authStore.user?.usuarioID)) {
        accessDenied.value = true
        throw new Error('No tienes permiso para ver este entrenamiento privado')
      }

      // Cargar los ejercicios asociados al entrenamiento
      loadingExercises.value = true

      try {
        // Primero cargamos todos los ejercicios
        await exerciseStore.fetchExercises()

        // Obtenemos los detalles de los ejercicios del entrenamiento
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
                series: relation.series,
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
      if (err instanceof Error && err.message.includes('permiso')) {
        accessDenied.value = true
        error.value = 'No tienes permiso para ver este entrenamiento privado'
      } else {
        error.value = err instanceof Error ? err.message : 'Error al cargar el entrenamiento'
      }
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

const getTotalWorkoutTime = computed(() => {
  if (!workoutExercises.value.length) return workout.value?.duracionMinutos || 0

  // Calcular tiempo basado en ejercicios (ejemplo simplificado)
  let totalTime = 0

  workoutExercises.value.forEach(item => {
    // Tiempo por ejercicio = series * repeticiones * 3seg + descanso entre series
    const exerciseTime = item.details.series *
      (item.details.repeticiones * 3 + item.details.descansoSegundos)
    totalTime += exerciseTime
  })

  // Convertir a minutos
  return Math.ceil(totalTime / 60)
})
</script>

<template>
  <v-container fluid class="workout-info-container">
    <!-- Loading State -->
    <div v-if="loading" class="d-flex justify-center align-center loading-container">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </div>

    <!-- Access Denied State -->
    <v-alert v-else-if="accessDenied" type="error" class="error-alert">
      No tienes permiso para ver este entrenamiento privado.
      <template v-slot:append>
        <v-btn color="error" variant="text" @click="goBack">
          Volver
        </v-btn>
      </template>
    </v-alert>

    <!-- Error State -->
    <v-alert v-else-if="error" type="error" class="error-alert">
      {{ error }}
      <template v-slot:append>
        <v-btn color="error" variant="text" @click="goBack">
          Volver
        </v-btn>
      </template>
    </v-alert>

    <!-- Workout Details -->
    <div v-else-if="workout" class="workout-container">
      <!-- Breadcrumb y botones -->
      <div class="d-flex align-center justify-space-between navigation-bar">
        <v-btn variant="text" color="primary" class="back-button" prepend-icon="mdi-arrow-left" @click="goBack">
          Volver a entrenamientos
        </v-btn>
      </div>

      <v-row class="workout-header-row">
        <v-col cols="12" md="5" lg="4">
          <v-card class="workout-image-card">
            <v-img v-if="workout.imagenURL" :src="workout.imagenURL" :alt="workout.titulo" class="workout-header-image"
              cover :aspect-ratio="16 / 9" gradient="to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.8)">
              <template v-slot:placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular indeterminate color="primary"></v-progress-circular>
                </v-row>
              </template>
            </v-img>
            <v-img v-else src="/api/placeholder/800/600" class="workout-header-image" cover :aspect-ratio="16 / 9"
              gradient="to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.8)"></v-img>

            <div class="workout-title-overlay">
              <h1 class="text-h4 text-white workout-title">
                {{ workout.titulo }}
                <v-chip v-if="!workout.publico" color="warning" size="small" class="ml-2">
                  Privado
                </v-chip>
                <v-chip v-if="isAuthor" color="primary" size="small" class="ml-2">
                  Tu entrenamiento
                </v-chip>
              </h1>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="7" lg="8">
          <v-card class="workout-info-card">
            <v-tabs v-model="selectedTabIndex" bg-color="#e25401" align-tabs="center" slider-color="white"
              class="workout-tabs">
              <v-tab v-for="(tab, index) in tabs" :key="index" :value="index" class="white--text">
                <v-icon start color="white">{{ tab.icon }}</v-icon>
                {{ tab.title.toUpperCase() }}
              </v-tab>
            </v-tabs>

            <v-window v-model="selectedTabIndex">
              <!-- Tab de Información -->
              <v-window-item :value="0">
                <v-card-text class="workout-details">
                  <div class="stats-container mb-6">
                    <div class="stat-card">
                      <v-icon size="32" color="primary" class="stat-icon">mdi-clock-outline</v-icon>
                      <div class="stat-content">
                        <div class="stat-value">{{ formattedDuration }}</div>
                        <div class="stat-label">Duración</div>
                      </div>
                    </div>

                    <div class="stat-card">
                      <v-icon size="32" :color="difficultyColor" class="stat-icon">
                        mdi-signal-cellular-{{
                          workout.dificultad === 'Fácil' ? '1' :
                            workout.dificultad === 'Media' ? '2' : '3'
                        }}
                      </v-icon>
                      <div class="stat-content">
                        <div class="stat-value">{{ workout.dificultad }}</div>
                        <div class="stat-label">Dificultad</div>
                      </div>
                    </div>

                    <div class="stat-card">
                      <v-icon size="32" color="primary" class="stat-icon">mdi-dumbbell</v-icon>
                      <div class="stat-content">
                        <div class="stat-value">{{ workoutExercises.length }}</div>
                        <div class="stat-label">Ejercicios</div>
                      </div>
                    </div>
                  </div>

                  <h2 class="text-h5 mb-3 info-section-title">Descripción</h2>
                  <p class="workout-description mb-6">
                    {{ workout.descripcion || 'Este entrenamiento no tiene descripción.' }}
                  </p>

                  <v-divider class="mb-6"></v-divider>

                  <div class="d-flex align-center additional-info mb-2">
                    <v-icon class="me-2" color="grey">mdi-calendar</v-icon>
                    <span class="additional-info-text">Creado: {{ new Date(workout.fechaCreacion).toLocaleDateString()
                    }}</span>
                  </div>

                  <div class="d-flex align-center additional-info">
                    <v-icon class="me-2" color="grey">mdi-eye</v-icon>
                    <span class="additional-info-text">Visibilidad: {{ workout.publico ? 'Público' : 'Privado' }}</span>
                  </div>
                </v-card-text>
              </v-window-item>

              <!-- Tab de Ejercicios -->
              <v-window-item :value="1">
                <v-card-text>
                  <div v-if="loadingExercises" class="d-flex justify-center my-4">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                  </div>

                  <div v-else-if="workoutExercises.length === 0" class="text-center my-4 no-exercises">
                    <v-icon size="48" color="grey-lighten-1">mdi-dumbbell-off</v-icon>
                    <p class="mt-4">No hay ejercicios asociados a este entrenamiento</p>
                  </div>

                  <div v-else class="exercises-container">
                    <v-row>
                      <v-col v-for="(item, index) in workoutExercises" :key="item.exercise.ejercicioID" cols="12" sm="6"
                        lg="4">
                        <v-hover v-slot="{ isHovering, props }">
                          <v-card v-bind="props" :elevation="isHovering ? 8 : 2" class="exercise-card">
                            <div class="exercise-number">{{ index + 1 }}</div>
                            <v-img v-if="item.exercise.imagenURL" :src="item.exercise.imagenURL" height="160" cover
                              class="exercise-image"></v-img>
                            <v-img v-else src="/api/placeholder/400/300" height="160" cover
                              class="exercise-image"></v-img>

                            <v-card-title class="exercise-title d-flex justify-space-between align-center">
                              <div class="text-truncate pe-2">{{ item.exercise.nombre }}</div>
                              <v-tooltip location="top" v-if="item.exercise.equipamientoNecesario">
                                <template v-slot:activator="{ props }">
                                  <v-icon v-bind="props" color="white" size="small">mdi-dumbbell</v-icon>
                                </template>
                                <span>Requiere equipamiento</span>
                              </v-tooltip>
                            </v-card-title>

                            <v-card-text class="exercise-details">
                              <div class="exercise-metrics">
                                <div class="metric">
                                  <v-icon size="small" color="primary">mdi-sync</v-icon>
                                  <span>{{ item.details.series }} series</span>
                                </div>
                                <div class="metric">
                                  <v-icon size="small" color="primary">mdi-repeat</v-icon>
                                  <span>{{ item.details.repeticiones }} reps</span>
                                </div>
                                <div class="metric">
                                  <v-icon size="small" color="primary">mdi-timer-outline</v-icon>
                                  <span>{{ item.details.descansoSegundos }}s descanso</span>
                                </div>
                              </div>

                              <div v-if="item.details.notas" class="exercise-notes mt-3">
                                <v-icon size="small" color="grey">mdi-note-text-outline</v-icon>
                                <span class="notes-text">{{ item.details.notas }}</span>
                              </div>
                            </v-card-text>

                            <v-divider></v-divider>

                            <v-card-actions>
                              <v-spacer></v-spacer>
                              <v-btn color="primary" variant="text" :to="`/exercises/${item.exercise.ejercicioID}`"
                                class="exercise-button">
                                Ver ejercicio
                                <v-icon end>mdi-arrow-right</v-icon>
                              </v-btn>
                            </v-card-actions>
                          </v-card>
                        </v-hover>
                      </v-col>
                    </v-row>
                  </div>
                </v-card-text>
              </v-window-item>

              <!-- Tab de Comentarios -->
              <v-window-item :value="2">
                <v-card-text class="comments-tab">
                  <!-- Formulario para añadir comentarios -->
                  <CommentForm :workoutId="Number(route.params.id)" />
                  
                  <!-- Lista de comentarios -->
                  <CommentList :workoutId="Number(route.params.id)" />
                </v-card-text>
              </v-window-item>
            </v-window>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.workout-info-container {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.loading-container {
  min-height: 70vh;
}

.error-alert {
  margin: 2rem auto;
  max-width: 600px;
  border-radius: $border-radius;
}

.navigation-bar {
  margin-bottom: 1.5rem;
}

.back-button {
  font-weight: 500;
  transition: transform 0.2s;

  &:hover {
    transform: translateX(-3px);
  }
}

.action-button {
  margin-left: 0.5rem;
  border-radius: $border-radius;
}

.workout-container {
  animation: fadeIn 0.4s ease-in-out;
}

.workout-header-row {
  margin-bottom: 2rem;
}

.workout-image-card {
  border-radius: $border-radius;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  height: 100%;
  position: relative;

  .workout-header-image {
    height: 100%;
    min-height: 300px;
  }

  .workout-title-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1.5rem;
    z-index: 2;
  }

  .workout-title {
    font-family: $font-family-base;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    font-weight: 700;
    letter-spacing: 0.5px;
  }
}

.workout-info-card {
  border-radius: $border-radius;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.workout-tabs {
  background-color: $primary-color;
}

:deep(.workout-tabs .v-tab) {
  color: white;
  opacity: 0.8;
  padding: 1rem 1.5rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}

:deep(.workout-tabs .v-tab--selected) {
  opacity: 1;
  font-weight: 700;
}

.workout-details {
  padding: 1.5rem;
}

.stats-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  flex: 1;
  min-width: 120px;
  background-color: $light-gray;
  border-radius: $border-radius;
  padding: 1rem;
  display: flex;
  align-items: center;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .stat-icon {
    margin-right: 0.75rem;
  }

  .stat-content {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-size: 1.2rem;
    font-weight: 700;
    color: $secondary-color;
  }

  .stat-label {
    font-size: 0.85rem;
    color: rgba(0, 0, 0, 0.6);
  }
}

.info-section-title {
  font-family: $font-family-base;
  font-weight: 600;
  margin-bottom: 0.75rem;
  position: relative;
  padding-left: 1rem;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.25rem;
    bottom: 0.25rem;
    width: 4px;
    background-color: $primary-color;
    border-radius: 4px;
  }
}

.workout-description {
  font-family: $font-family-text;
  line-height: 1.7;
  font-size: 1rem;
  color: rgba(0, 0, 0, 0.8);
  white-space: pre-line;
  padding: 0 0.5rem;
}

.additional-info {
  padding: 0.5rem;

  .additional-info-text {
    font-family: $font-family-text;
    color: rgba(0, 0, 0, 0.6);
  }
}

.no-exercises {
  padding: 3rem 1rem;
  color: rgba(0, 0, 0, 0.5);
  font-family: $font-family-text;
}

.exercises-container {
  padding: 12px;

  .v-col {
    padding: 0.75rem;
  }
}

.v-card-actions {
  gap: 0px !important;
}

.v-col-sm-6 {
  margin-right: 12px;
}

.exercise-card {
  border-radius: $border-radius;
  height: 100%;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  .exercise-number {
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background-color: $primary-color;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    z-index: 2;
    font-size: 0.9rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
}

.v-col-md-5 {
  padding-right: 12px !important;
}

.exercise-image {
  height: 160px;
  border-radius: $border-radius $border-radius 0 0;
}

.exercise-title {
  background-color: $primary-color;
  color: white;
  padding: 0.75rem 1rem;
  font-size: 1.1rem;
  font-weight: 500;
  font-family: $font-family-base;
}

.exercise-details {
  padding: 1rem;
  font-family: $font-family-text;

  .exercise-metrics {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    .metric {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.95rem;
    }
  }

  .exercise-notes {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.75rem;
    background-color: $light-gray;
    border-radius: $border-radius;
    margin-top: 1rem;

    .notes-text {
      font-size: 0.9rem;
      line-height: 1.5;
      opacity: 0.9;
    }
  }
}

.exercise-button {
  width: 100%;
  border-radius: 0;
  padding: 0.65rem 1rem;
  font-weight: 500;
  font-family: $font-family-base;
}

.comments-tab {
  padding: 1.5rem;
}

// Animaciones
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Responsive
@media (max-width: 959px) {
  .workout-header-row {
    flex-direction: column;
  }

  .workout-image-card {
    margin-bottom: 1.5rem;

    .workout-header-image {
      min-height: 240px;
    }
  }

  .stats-container {
    flex-direction: column;

    .stat-card {
      width: 100%;
    }
  }
}

@media (max-width: 599px) {
  .workout-info-container {
    padding: 1rem 0.5rem;
  }

  .back-button {
    font-size: 0.9rem;
  }

  .workout-title {
    font-size: 1.5rem !important;
  }

  .tab-item {
    font-size: 0.85rem;
  }
}
</style>