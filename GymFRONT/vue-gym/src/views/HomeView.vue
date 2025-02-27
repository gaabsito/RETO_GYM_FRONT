<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useWorkoutStore } from '@/stores/workouts'
import type { Workout } from '@/types/Workout'
import heroImage from '@/assets/images/arnold.jpg'
import SvgInter from '@/components/SvgInter.vue';

const workoutStore = useWorkoutStore()
const featuredWorkouts = ref<Workout[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const workouts = await workoutStore.fetchWorkouts()
    featuredWorkouts.value = workouts.slice(0, 6)
  } catch (error) {
    console.error('Error cargando entrenamientos:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <v-container class="pa-0" fluid>
    <!-- Hero Section -->
    <v-parallax 
      :src="heroImage"
      class="align-center justify-center parallax-container">
      <div class="d-flex flex-column fill-height justify-center align-center text-white">
        <v-container class="features">
          <v-row align="center" justify="center">
            <v-col cols="12" md="8" class="text-center">
              <h1 class="txt-h2">
                TRANSFÓRMATE CON NOSOTROS
              </h1>
              <h2 class="text-h5 mb-6">
                Descubre entrenamientos personalizados y alcanza tus objetivos fitness
              </h2>
              <v-btn size="x-large"  class="me-4" to="/register">
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
            <v-card v-bind="props" :elevation="isHovering ? 12 : 2" class="transition-swing pa-6 h-100">
              <div class="d-flex flex-column align-center">
                <v-icon size="64" color="primary" class="mb-4">
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
            <v-card v-bind="props" :elevation="isHovering ? 12 : 2" class="transition-swing pa-6 h-100">
              <div class="d-flex flex-column align-center">
                <v-icon size="64" color="primary" class="mb-4">
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
            <v-card v-bind="props" :elevation="isHovering ? 12 : 2" class="transition-swing pa-6 h-100">
              <div class="d-flex flex-column align-center">
                <v-icon size="64" color="primary" class="mb-4">
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
    <v-container class="py-12">
      <h2 class="text-h4 mb-6 text-center">Entrenamientos Destacados</h2>

      <v-row v-if="!loading" justify="center">
        <v-col v-for="workout in featuredWorkouts" :key="workout.entrenamientoID" cols="12" sm="4" md="3" lg="2">
          <v-hover v-slot="{ isHovering, props }">
            <v-card v-bind="props" :elevation="isHovering ? 8 : 2" class="workout-card">
              <v-img :src="workout.imagenURL" cover
                class="align-end workout-image">
              </v-img>
              <v-card-title class="text-white bg-opacity-50 pb-4">
                  {{ workout.titulo }}
              </v-card-title>
              <v-card-text>
                <div class="d-flex align-center mb-2">
                  <v-icon size="small"
                    :color="workout.dificultad === 'Fácil' ? 'success' : workout.dificultad === 'Media' ? 'warning' : 'error'"
                    class="me-2">
                    mdi-signal-cellular-{{
                      workout.dificultad === 'Fácil' ? '1' : workout.dificultad === 'Media' ? '2' : '3'
                    }}
                  </v-icon>
                  <span>{{ workout.dificultad }}</span>
                  <v-spacer></v-spacer>
                  <v-icon size="small" class="me-1">mdi-clock-outline</v-icon>
                  <span>{{ workout.duracionMinutos }} min</span>
                </div>
                <!-- <p class="text-truncate">{{ workout.descripcion }}</p> -->
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" variant="text" :to="`/entrenamientos/${workout.entrenamientoID}`">
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
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        </v-col>
      </v-row>
    </v-container>

    <!-- CTA Section -->
    <v-container class="c-destacados">
      <v-row align="center" justify="center" class="c-row">
        <v-col cols="12" md="8" class="text-center">
          <h2 class="text-h4 text-white mb-6">
            ¿Listo para comenzar tu transformación?
          </h2>
          <p class="text-h6 font-weight-regular text-white mb-6">
            Únete ahora y obtén acceso a todos nuestros entrenamientos premium
          </p>
          <v-btn size="x-large" to="/register" class="me-4">
            Empieza Gratis
            <v-icon end>mdi-arrow-right</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<style lang="scss">
@import '@/assets/styles/main.scss';
.feature-container {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 20px;
}

.cta-section {
  border-radius: $border-radius;
  width: 100% !important; 
}

.txt-h2{
  font-size: 40px;
  font-weight: bold;
}

.py-12 {
  padding: 0px;
}

.pb-4 {
  padding-top: 0.5rem !important;
  padding-right: 1rem !important;
  padding-bottom: 0.5rem !important;
  padding-left: 1rem !important;
}

.v-container {
  margin-bottom: 2rem !important;
}

.v-card-text {
  padding: 1rem !important;
}

.v-parallax {
  border-radius: $border-radius;
}
.parallax-container {
  position: relative;
  height: 800px;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5); // Capa oscura con 50% de opacidad
    z-index: 1;
  }

  .d-flex {
    position: relative;
    z-index: 2; // Para que el texto se vea por encima de la capa oscura
  }
}
.me-4{
color: $primary-color;
}

.v-card{
  border-radius: $border-radius;
}

.v-card-title {
  background-color: $primary-color;
  transition: background-color 0.3s ease-in-out;
}

.workout-card:hover {
  .v-card-title {
  background-color: darken($primary-color, 70%);
  }
}

.c-destacados{
  background-color: black;
  border-radius: $border-radius;
}
.c-row {
  padding: 2% !important;
}
.pa-0 {
  padding-top: 3% !important;
  padding-bottom: 3% !important;
}
.py-12{
  color:$primary-color;
}

.v-col-md-8 {
  padding-top: 4rem !important;
  padding-bottom: 4rem !important;
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

@media (max-width: 768px) {
  .feature-container {
    flex-direction: column;
    align-items: center;
  }
}

</style>