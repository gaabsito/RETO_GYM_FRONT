<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useExerciseStore } from '@/stores/exercises'
import type { Exercise } from '@/types/Exercise'
import SectionContainer from '@/components/SectionContainer.vue'

const route = useRoute()
const router = useRouter()
const exerciseStore = useExerciseStore()

const exercise = ref<Exercise | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const exerciseId = parseInt(route.params.id as string)
    if (isNaN(exerciseId)) {
      throw new Error('ID de ejercicio inválido')
    }

    exercise.value = await exerciseStore.getExerciseById(exerciseId)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al cargar el ejercicio'
  } finally {
    loading.value = false
  }
})

const goBack = () => {
  router.back()
}

// Función para convertir URLs de YouTube a formato embed
const getEmbedUrl = (url: string | undefined): string => {
  if (!url) return '';

  // Manejar URLs de YouTube
  if (url.includes('youtube.com/watch')) {
    // Extraer el ID del video de YouTube
    const videoId = new URL(url).searchParams.get('v');
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  } else if (url.includes('youtu.be')) {
    // Manejar formato corto de YouTube
    const videoId = url.split('/').pop();
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }

  // Si no es YouTube o no se puede procesar, devolver la URL original
  return url;
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

    <!-- Exercise Details -->
    <template v-else-if="exercise">
      <v-row>
        <!-- Breadcrumb -->
        <v-col cols="12">
          <v-btn variant="text" color="primary" class="mb-4" prepend-icon="mdi-arrow-left" @click="goBack">
            Volver a ejercicios
          </v-btn>
        </v-col>
      </v-row>

      <SectionContainer>
        <v-row>
          <!-- Image and Video -->
          <v-col cols="12" md="6">
            <v-card class="mb-4 exercise-card">
              <v-img :src="exercise.imagenURL || '/api/placeholder/800/600'" height="400" cover class="bg-grey-lighten-2">
                <template v-slot:placeholder>
                  <v-row class="fill-height ma-0" align="center" justify="center">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                  </v-row>
                </template>
              </v-img>
            </v-card>

            <!-- Video del ejercicio -->
            <v-card v-if="exercise.videoURL" class="mt-4 exercise-card">
              <v-card-title class="exercise-title">
                <v-icon start color="white" class="me-2">mdi-video</v-icon>
                Video demostrativo
              </v-card-title>
              <v-card-text class="pa-0">
                <iframe 
                  :src="getEmbedUrl(exercise.videoURL)" 
                  width="100%" 
                  height="315" 
                  frameborder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowfullscreen 
                  class="video-frame"
                ></iframe>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Exercise Information -->
          <v-col cols="12" md="6">
            <v-card class="exercise-card info-card">
              <v-card-title class="exercise-title">
                {{ exercise.nombre }}
                <v-chip v-if="exercise.equipamientoNecesario" color="primary" class="ml-2" size="small">
                  <v-icon start size="small">mdi-dumbbell</v-icon>
                  Requiere equipamiento
                </v-chip>
              </v-card-title>

              <v-card-text>
                <v-row>
                  <v-col cols="12">
                    <div class="d-flex align-center mb-4">
                      <span class="text-h6">Grupo Muscular:</span>
                      <v-chip class="ml-2" color="primary" variant="outlined">
                        {{ exercise.grupoMuscular }}
                      </v-chip>
                    </div>
                  </v-col>

                  <v-col cols="12">
                    <div class="text-h6 mb-2">Descripción:</div>
                    <p class="text-body-1">{{ exercise.descripcion }}</p>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Recomendaciones -->
            <v-card class="mt-4 exercise-card">
              <v-card-title class="exercise-title">
                <v-icon start color="white" class="me-2">mdi-information</v-icon>
                Recomendaciones
              </v-card-title>
              <v-card-text>
                <v-list>
                  <v-list-item prepend-icon="mdi-check-circle" class="mb-2">
                    <v-list-item-title>Mantén una postura correcta durante todo el ejercicio</v-list-item-title>
                  </v-list-item>
                  <v-list-item prepend-icon="mdi-check-circle" class="mb-2">
                    <v-list-item-title>Realiza movimientos controlados y conscientes</v-list-item-title>
                  </v-list-item>
                  <v-list-item prepend-icon="mdi-check-circle" class="mb-2">
                    <v-list-item-title>Respira de manera adecuada durante la ejecución</v-list-item-title>
                  </v-list-item>
                  <v-list-item prepend-icon="mdi-check-circle">
                    <v-list-item-title>Ajusta el peso y las repeticiones según tu nivel</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </SectionContainer>
    </template>
  </v-container>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.video-frame {
  border-radius: $border-radius !important;
}

.exercise-card {
  border-radius: $border-radius;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.exercise-title {
  background-color: $primary-color;
  color: white;
  padding: 1rem;
  font-size: 1.5rem;
  font-weight: 500;
  font-family: $font-family-base;
}

.info-card {
  max-height: 100%;
  display: flex;
  flex-direction: column;
}

.v-card-text {
  font-family: $font-family-text;
  padding: 1.5rem;
  flex-grow: 1;
}

.v-img {
  border-radius: $border-radius $border-radius 0 0;
}

.v-btn {
  font-family: $font-family-base;
  border-radius: $border-radius;

  &:hover {
    transform: translateY(-1px);
  }
}

.v-chip {
  font-family: $font-family-base;
}

.text-body-1 {
  line-height: 1.6;
  opacity: 0.85;
}

.v-list-item {
  padding: 0.5rem 0;
}

.mt-4 {
  margin-top: 1.5rem !important;
}

// Responsive
@media (max-width: 960px) {
  .v-container {
    padding: 1rem;
  }

  .exercise-title {
    font-size: 1.25rem;
  }

  .v-card {
    margin-bottom: 1rem;
  }
}
</style>