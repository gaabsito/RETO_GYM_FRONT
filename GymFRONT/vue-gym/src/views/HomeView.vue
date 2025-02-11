<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useWorkoutStore } from '@/stores/workouts'
import type { Workout } from '@/types/Workout'

const workoutStore = useWorkoutStore()
const featuredWorkouts = ref<Workout[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    await workoutStore.fetchWorkouts(true)
    featuredWorkouts.value = workoutStore.workouts.slice(0, 6)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <v-container class="pa-0" fluid>
    <!-- Hero Section -->
    <v-parallax
      src="https://cdn.pixabay.com/photo/2017/08/07/14/02/man-2604149_1280.jpg"
      class="align-center justify-center"
      height="600"
    >
      <div class="d-flex flex-column fill-height justify-center align-center text-white">
        <v-container>
          <v-row align="center" justify="center">
            <v-col cols="12" md="8" class="text-center">
              <h1 class="text-h2 font-weight-bold mb-4">
                Transforma tu cuerpo
              </h1>
              <h2 class="text-h5 mb-6">
                Descubre entrenamientos personalizados y alcanza tus objetivos fitness
              </h2>
              <v-btn
                size="x-large"
                color="primary"
                class="me-4"
                to="/registro"
              >
                Empieza Ahora
                <v-icon end icon="mdi-arrow-right"></v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </div>
    </v-parallax>

    <!-- Features Section -->
    <v-container class="py-12">
      <v-row>
        <v-col cols="12" md="4">
          <v-hover v-slot="{ isHovering, props }">
            <v-card
              v-bind="props"
              :elevation="isHovering ? 12 : 2"
              class="transition-swing pa-6 h-100"
            >
              <div class="d-flex flex-column align-center">
                <v-icon
                  size="64"
                  color="primary"
                  class="mb-4"
                >
                  mdi-dumbbell
                </v-icon>
                <h3 class="text-h5 mb-4">Entrenamientos Personalizados</h3>
                <p class="text-body-1 text-center">
                  Rutinas adaptadas a tu nivel y objetivos, diseñadas por expertos en fitness.
                </p>
              </div>
            </v-card>
          </v-hover>
        </v-col>

        <v-col cols="12" md="4">
          <v-hover v-slot="{ isHovering, props }">
            <v-card
              v-bind="props"
              :elevation="isHovering ? 12 : 2"
              class="transition-swing pa-6 h-100"
            >
              <div class="d-flex flex-column align-center">
                <v-icon
                  size="64"
                  color="primary"
                  class="mb-4"
                >
                  mdi-account-group
                </v-icon>
                <h3 class="text-h5 mb-4">Comunidad Activa</h3>
                <p class="text-body-1 text-center">
                  Únete a una comunidad de entusiastas del fitness y comparte tus experiencias.
                </p>
              </div>
            </v-card>
          </v-hover>
        </v-col>

        <v-col cols="12" md="4">
          <v-hover v-slot="{ isHovering, props }">
            <v-card
              v-bind="props"
              :elevation="isHovering ? 12 : 2"
              class="transition-swing pa-6 h-100"
            >
              <div class="d-flex flex-column align-center">
                <v-icon
                  size="64"
                  color="primary"
                  class="mb-4"
                >
                  mdi-chart-line
                </v-icon>
                <h3 class="text-h5 mb-4">Seguimiento de Progreso</h3>
                <p class="text-body-1 text-center">
                  Monitorea tu evolución y mantén un registro detallado de tus logros.
                </p>
              </div>
            </v-card>
          </v-hover>
        </v-col>
      </v-row>
    </v-container>

    <!-- Featured Workouts -->
    <v-container class="py-12 bg-grey-lighten-4">
      <h2 class="text-h4 mb-6 text-center">Entrenamientos Destacados</h2>
      
      <v-row v-if="!loading">
        <v-col 
          v-for="workout in featuredWorkouts" 
          :key="workout.entrenamientoID"
          cols="12" 
          sm="6" 
          md="4"
        >
          <v-hover v-slot="{ isHovering, props }">
            <v-card
              v-bind="props"
              :elevation="isHovering ? 8 : 2"
              class="h-100"
            >
              <v-img
                :src="`https://picsum.photos/400/200?random=${workout.entrenamientoID}`"
                height="200"
                cover
                class="align-end"
              >
                <v-card-title class="text-white bg-black bg-opacity-50 pb-4">
                  {{ workout.titulo }}
                </v-card-title>
              </v-img>

              <v-card-text>
                <div class="d-flex align-center mb-2">
                  <v-icon 
                    size="small" 
                    :color="workout.dificultad === 'Fácil' ? 'success' : workout.dificultad === 'Media' ? 'warning' : 'error'"
                    class="me-2"
                  >
                    mdi-signal-cellular-{{ 
                      workout.dificultad === 'Fácil' ? '1' : workout.dificultad === 'Media' ? '2' : '3' 
                    }}
                  </v-icon>
                  <span>{{ workout.dificultad }}</span>
                  <v-spacer></v-spacer>
                  <v-icon size="small" class="me-1">mdi-clock-outline</v-icon>
                  <span>{{ workout.duracionMinutos }} min</span>
                </div>
                <p class="text-truncate">{{ workout.descripcion }}</p>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="primary"
                  variant="text"
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

      <v-row v-else>
        <v-col cols="12" class="text-center">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          ></v-progress-circular>
        </v-col>
      </v-row>
    </v-container>

    <!-- CTA Section -->
    <v-container fluid class="bg-primary py-12">
      <v-row align="center" justify="center">
        <v-col cols="12" md="8" class="text-center">
          <h2 class="text-h4 text-white mb-6">
            ¿Listo para comenzar tu transformación?
          </h2>
          <p class="text-h6 font-weight-regular text-white mb-6">
            Únete ahora y obtén acceso a todos nuestros entrenamientos premium
          </p>
          <v-btn
            size="x-large"
            color="secondary"
            to="/registro"
          >
            Empieza Gratis
            <v-icon end>mdi-arrow-right</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>