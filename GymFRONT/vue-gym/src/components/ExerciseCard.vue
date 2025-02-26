<script setup lang="ts">
import type { Exercise } from '@/types/Exercise'

defineProps<{
  exercise: Exercise
}>()
</script>

<template>
  <v-hover v-slot="{ isHovering, props }">
    <v-card v-bind="props" :elevation="isHovering ? 8 : 2" class="h-100 exercise-card">
      <v-img :src="exercise.imagenURL || '/api/placeholder/400/300'" height="200" cover class="bg-grey-lighten-2">
        <template v-slot:placeholder>
          <v-row class="fill-height ma-0" align="center" justify="center">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
          </v-row>
        </template>
      </v-img>

      <v-card-title class="text-truncate exercise-title">
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
          :to="`/exercises/${exercise.ejercicioID}`"
        >
          Ver detalles
          <v-icon end>mdi-arrow-right</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-hover>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.exercise-card {
  border-radius: $border-radius;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-5px);
  }

  .exercise-title {
    background-color: $primary-color;
    font-family: $font-family-base;
    font-size: 1.25rem;
    font-weight: 500;
    line-height: 1.6;
    padding-top: 0.5rem !important;
    padding-right: 1rem !important;
    padding-bottom: 0.5rem !important;
    padding-left: 1rem !important;
  }

  .v-card-title {
    color: $light-gray !important;
  }

  .v-card-subtitle {
    padding: 1rem;
    opacity: 0.8;
    font-size: 0.9rem;
  }

  .v-card-text {
    padding: 0 1rem;
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
</style>