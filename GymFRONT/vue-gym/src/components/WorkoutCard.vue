<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { Workout } from '@/types/Workout'

const props = defineProps<{
  workout: Workout
  showDescription?: boolean
  showCompleteButton?: boolean
}>()

const emit = defineEmits(['complete'])

const authStore = useAuthStore()

// Verificar si el usuario está autenticado
const isAuthenticated = computed(() => authStore.isAuthenticated)

// Determinar el color de dificultad
const difficultyColor = computed(() => {
  switch (props.workout.dificultad) {
    case 'Fácil':
      return 'success'
    case 'Media':
      return 'warning'
    case 'Difícil':
      return 'error'
    default:
      return 'primary'
  }
})

// Determinar icono de dificultad
const difficultyIcon = computed(() => {
  switch (props.workout.dificultad) {
    case 'Fácil':
      return 'mdi-signal-cellular-1'
    case 'Media':
      return 'mdi-signal-cellular-2'
    case 'Difícil':
      return 'mdi-signal-cellular-3'
    default:
      return 'mdi-signal-cellular-1'
  }
})

// Manejar el clic en completar
const handleComplete = (event) => {
  event.stopPropagation() // Evitar navegación si está dentro de un elemento clickeable
  emit('complete', props.workout)
}
</script>

<template>
  <v-hover v-slot="{ isHovering, props: hoverProps }">
    <v-card v-bind="hoverProps" :elevation="isHovering ? 8 : 2" class="workout-card">
      <v-img :src="workout.imagenURL || '/api/placeholder/400/200'" cover class="align-end workout-image">
      </v-img>
      <v-card-title class="text-white pb-4">
        {{ workout.titulo }}
        <v-chip v-if="!workout.publico" color="warning" size="small" class="ml-2">
          Privado
        </v-chip>
      </v-card-title>
      <v-card-text>
        <div class="d-flex align-center mb-2">
          <v-icon size="small" :color="difficultyColor" class="me-2">
            {{ difficultyIcon }}
          </v-icon>
          <span>{{ workout.dificultad }}</span>
          <v-spacer></v-spacer>
          <v-icon size="small" class="me-1">mdi-clock-outline</v-icon>
          <span>{{ workout.duracionMinutos }} min</span>
        </div>
        <p v-if="showDescription && workout.descripcion" class="text-truncate">{{ workout.descripcion }}</p>
      </v-card-text>

      <v-card-actions>
        <!-- Botón para marcar como completado (si está habilitado y autenticado) -->
        <v-btn 
          v-if="showCompleteButton && isAuthenticated" 
          color="success" 
          variant="text" 
          @click="handleComplete"
          prepend-icon="mdi-check-circle"
        >
          Completar
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="text" :to="`/workouts/${workout.entrenamientoID}`">
          Ver más
          <v-icon end>mdi-arrow-right</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-hover>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.workout-card {
  border-radius: $border-radius;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
}

.v-btn {
  padding-right: 1rem;
}

.v-card-title {
  background-color: $primary-color;
  transition: background-color 0.3s ease-in-out;
}

.workout-card:hover {
  .v-card-title {
    background-color: darken($primary-color, 10%);
  }
}

.v-card-text {
  padding: 1rem !important;
}

.pb-4 {
  padding-top: 0.5rem !important;
  padding-right: 1rem !important;
  padding-bottom: 0.5rem !important;
  padding-left: 1rem !important;
}
</style>