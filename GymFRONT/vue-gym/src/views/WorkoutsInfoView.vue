<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkoutStore } from '@/stores/workouts'
import { storeToRefs } from 'pinia'
import type { Workout } from '@/types/Workout'

const route = useRoute()
const router = useRouter()
const workoutStore = useWorkoutStore()
const { workouts, loading, error } = storeToRefs(workoutStore)

const workout = ref<Workout | null>(null)

onMounted(async () => {
  console.log('Component mounted')
  console.log('Route params:', route.params)
  try {
    const workoutId = parseInt(route.params.id as string)
    if (isNaN(workoutId)) {
      throw new Error('ID de entrenamiento inválido')
    }

    await workoutStore.fetchWorkouts()
    workout.value = workouts.value.find(w => w.entrenamientoID === workoutId) || null

    if (!workout.value) {
      throw new Error('Entrenamiento no encontrado')
    }
    console.log('Workout data:', workout.value)
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
  <div v-if="loading" class="loading">Cargando entrenamiento...</div>
  <div v-else-if="error" class="error">Error: {{ error }}</div>
  <div v-else-if="workout" class="workout-container">
    <button @click="goBack" class="back-button">&#8592; Volver a entrenamientos</button>
    <div class="workout-content">
      <div class="workout-image-container">
        <img v-if="workout.imagenURL" :src="workout.imagenURL" alt="Imagen del entrenamiento" class="workout-image" />
      </div>
      <div class="workout-info">
        <h1 class="workout-title">{{ workout.titulo }}</h1>
        <div class="workout-details">
          <span class="tag">Dificultad: {{ workout.dificultad }}</span>
          <span class="tag">Duración: {{ workout.duracionMinutos }} min</span>
        </div>
        <p class="description">{{ workout.descripcion }}</p>
      </div>
    </div>
    <div class="exercise-section">
      <h3>Ejercicios incluidos</h3>
      <ul class="exercise-list">
        <li v-for="ejercicio in workout.ejercicios" :key="ejercicio.ejercicioID" class="exercise-item">
          <div class="exercise-name">{{ ejercicio.nombre }}</div>
          <div class="exercise-reps">Repeticiones: {{ ejercicio.repeticiones || 'N/A' }}</div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.workout-container {
  max-width: 1100px;
  margin: auto;
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.back-button {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  color: #ff6600;
}
.workout-content {
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
}
.workout-image-container {
  flex: 1;
  text-align: center;
}
.workout-image {
  width: 100%;
  max-width: 400px;
  border-radius: 10px;
}
.workout-info {
  flex: 2;
  text-align: left;
}
.workout-title {
  color: #ff6600;
  font-size: 24px;
  margin-bottom: 10px;
}
.workout-details {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}
.tag {
  background: #ff6600;
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 14px;
}
.exercise-section {
  margin-top: 20px;
}
.exercise-list {
  list-style: none;
  padding: 0;
}
.exercise-item {
  background: #ff6600;
  color: white;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 10px;
  text-align: center;
}
@media (max-width: 768px) {
  .workout-content {
    flex-direction: column;
  }
  .workout-image {
    max-width: 300px;
  }
  .exercise-item {
    font-size: 14px;
  }
}
</style>
