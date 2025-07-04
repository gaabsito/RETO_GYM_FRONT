<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useWorkoutStore } from '@/stores/workouts'
import type { Workout } from '@/types/Workout'
import PageHeader from '@/components/PageHeader.vue'
import SectionContainer from '@/components/SectionContainer.vue'
import WorkoutCard from '@/components/WorkoutCard.vue'
import CallToAction from '@/components/CallToAction.vue'
import SvgInter from '@/components/SvgInter.vue'
import Carrusel from '@/components/Carrusel.vue'
import CookieConsent from '@/components/CookieConsent.vue'
import AchievementSection from '@/components/AchievementSection.vue'
import heroImage from '@/assets/images/arnold.jpg'

const workoutStore = useWorkoutStore()
const featuredWorkouts = ref<Workout[]>([])
const loading = ref(true)

// Datos de las características
onMounted(async () => {
  try {
    const workouts = await workoutStore.fetchWorkouts()
    // Cambiamos de 6 a 4 entrenamientos destacados
    featuredWorkouts.value = workouts.slice(0, 4)
  } catch (error) {
    console.error('Error cargando entrenamientos:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <v-container fluid class="pa-0">
    <!-- Hero Section -->
    <PageHeader
      title="TRANSFÓRMATE CON NOSOTROS"
      subtitle="Descubre entrenamientos personalizados y alcanza tus objetivos fitness"
      :backgroundImage="heroImage"
    >
      <v-btn size="x-large" to="/register" class="mt-4">
        Empieza Ahora
        <v-icon end icon="mdi-arrow-right"></v-icon>
      </v-btn>
    </PageHeader>

    <!-- Features Section -->
    <div class="feature-container">
      <SvgInter 
        icon="weight" 
        title="ENTRENAMIENTOS PERSONALIZADOS"
        text="Rutinas adaptadas a tu nivel y objetivos, diseñadas por expertos en fitness." 
      />
      <SvgInter 
        icon="users" 
        title="COMUNIDAD ACTIVA"
        text="Únete a una comunidad de entusiastas del fitness y comparte tus experiencias." 
      />
      <SvgInter 
        icon="chart" 
        title="SEGUIMIENTO DE PROGRESO"
        text="Monitorea tu evolución y mantén un registro detallado de tus logros." 
      />
    </div>

    <!-- Featured Workouts -->
    <SectionContainer title="Entrenamientos Destacados" backgroundColor="#f8f8f8">
      <template v-if="!loading">
        <Carrusel v-if="$vuetify.display.xs" :workouts="featuredWorkouts" />
        <v-row v-else justify="center">
          <v-col 
            v-for="workout in featuredWorkouts" 
            :key="workout.entrenamientoID" 
            cols="12" sm="6" md="6" lg="3"
          >
            <WorkoutCard :workout="workout" />
          </v-col>
        </v-row>
      </template>
      <v-row v-else>
        <v-col cols="12" class="text-center">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        </v-col>
      </v-row>
      
      <!-- Botón para ver más entrenamientos -->
      <div class="text-center mt-6">
        <v-btn 
          color="primary" 
          size="large" 
          to="/workouts" 
          prepend-icon="mdi-dumbbell"
          class="workout-btn"
        >
          <span class="d-none d-sm-inline">Ver todos los entrenamientos</span>
          <span class="d-sm-none">Ver entrenamientos</span>
        </v-btn>
      </div>
    </SectionContainer>

    <!-- Sistema de Logros Section -->
    <SectionContainer backgroundColor="#f5f5f5">
      <AchievementSection />
    </SectionContainer>

    <!-- CTA Section -->
    <CallToAction
      title="¿Listo para comenzar tu transformación?"
      subtitle="Únete ahora y obtén acceso a todos nuestros entrenamientos premium"
      buttonText="Empieza Gratis"
      buttonLink="/register"
    />

    <!-- Cookie Consent Banner -->
    <CookieConsent :cookie-options="true" position="bottom" theme="dark" />
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

h2 {
  padding: 1rem !important;
}

// Responsive adjustments
@media (max-width: 600px) {
  .v-container {
    padding: 0.5rem !important;
  }
  
  .workout-btn,
  .achievement-btn {
    font-size: 0.9rem !important;
  }
}

@media (max-width: 768px) {
  .feature-container {
    flex-direction: column;
    align-items: center;
  }
}
</style>