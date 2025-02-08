<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useWorkoutStore } from '@/stores/workouts'
import type { Workout } from '@/types/Workout'

const workoutStore = useWorkoutStore()
const featuredWorkouts = ref<Workout[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    await workoutStore.fetchWorkouts(true) // true para obtener entrenamientos públicos
    featuredWorkouts.value = workoutStore.workouts.slice(0, 6) // Tomamos los primeros 6 entrenamientos
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <v-container class="pa-0" fluid>
    <!-- Hero Section -->
    <v-parallax src="https://cdn.pixabay.com/photo/2017/08/07/14/02/man-2604149_1280.jpg" height="400">
      <div class="d-flex flex-column fill-height justify-center align-center text-white">
        <h1 class="text-h2 font-weight-bold mb-4">
          Transforma tu cuerpo
        </h1>
        <h2 class="text-h5 mb-6 text-center">
          Encuentra los mejores entrenamientos personalizados para alcanzar tus objetivos
        </h2>
        <div class="d-flex flex-column align-center gap-4">
          <v-btn color="secondary" size="x-large" to="/registro">
            Empieza Ahora
          </v-btn>
          <v-btn color="primary" size="x-large" variant="outlined" to="/entrenamientos">
            Ver Entrenamientos
          </v-btn>
        </div>

      </div>
    </v-parallax>

    <!-- Features Section -->
    <v-container class="my-8">
      <v-row>
        <v-col cols="12" md="4">
          <v-card class="mx-auto" variant="elevated">
            <v-card-item>
              <template v-slot:prepend>
                <v-icon color="secondary" size="x-large" icon="mdi-dumbbell"></v-icon>
              </template>
              <v-card-title>Entrenamientos Personalizados</v-card-title>
              <v-card-text>
                Accede a rutinas diseñadas específicamente para tus objetivos y nivel de experiencia.
              </v-card-text>
            </v-card-item>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="mx-auto" variant="elevated">
            <v-card-item>
              <template v-slot:prepend>
                <v-icon color="secondary" size="x-large" icon="mdi-account-group"></v-icon>
              </template>
              <v-card-title>Comunidad Activa</v-card-title>
              <v-card-text>
                Únete a una comunidad de entusiastas del fitness y comparte tus experiencias.
              </v-card-text>
            </v-card-item>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="mx-auto" variant="elevated">
            <v-card-item>
              <template v-slot:prepend>
                <v-icon color="secondary" size="x-large" icon="mdi-chart-line"></v-icon>
              </template>
              <v-card-title>Seguimiento de Progreso</v-card-title>
              <v-card-text>
                Monitorea tu evolución y mantén un registro detallado de tus logros.
              </v-card-text>
            </v-card-item>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Featured Workouts Section -->
    <v-container class="my-8">
      <h2 class="text-h4 mb-6">Entrenamientos Destacados</h2>

      <v-row v-if="!loading">
        <v-col v-for="workout in featuredWorkouts" :key="workout.entrenamientoID" cols="12" sm="6" md="4">
          <v-card class="h-100">
            <v-img :src="`https://picsum.photos/400/200?random=${workout.entrenamientoID}`" height="200" cover></v-img>

            <v-card-item>
              <v-card-title>{{ workout.titulo }}</v-card-title>
              <v-card-subtitle>
                {{ workout.duracionMinutos }} minutos · {{ workout.dificultad }}
              </v-card-subtitle>
            </v-card-item>

            <v-card-text>
              {{ workout.descripcion }}
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" variant="text" :to="`/entrenamientos/${workout.entrenamientoID}`">
                Ver más
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-else>
        <v-col cols="12" class="text-center">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        </v-col>
      </v-row>
    </v-container>

    <!-- CTA Section -->
    <v-sheet color="primary" class="pa-12 text-center">
      <h2 class="text-h4 text-white mb-6">
        ¿Listo para comenzar tu transformación?
      </h2>
      <v-btn color="secondary" size="x-large" to="/registro">
        Únete Ahora
      </v-btn>
    </v-sheet>
  </v-container>
</template>