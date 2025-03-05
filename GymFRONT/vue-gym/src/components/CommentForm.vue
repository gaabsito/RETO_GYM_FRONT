<script setup lang="ts">
import { ref } from 'vue'
import { useCommentStore } from '@/stores/comments'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const props = defineProps<{
  workoutId: number
}>()

const commentStore = useCommentStore()
const authStore = useAuthStore()
const router = useRouter()

const form = ref({
  contenido: '',
  calificacion: 4
})

const loading = ref(false)
const error = ref('')
const success = ref(false)

const handleSubmit = async () => {
  // Si no está autenticado, redirigir a login
  if (!authStore.isAuthenticated) {
    router.push(`/login?redirect=/workouts/${props.workoutId}`)
    return
  }

  if (!form.value.contenido.trim()) {
    error.value = 'Por favor, escribe un comentario'
    return
  }

  try {
    loading.value = true
    error.value = ''
    success.value = false

    await commentStore.addComment({
      entrenamientoID: props.workoutId,
      contenido: form.value.contenido,
      calificacion: form.value.calificacion
    })

    // Limpiar formulario y mostrar mensaje de éxito
    form.value = {
      contenido: '',
      calificacion: 4
    }
    success.value = true

    // Ocultar mensaje de éxito después de 3 segundos
    setTimeout(() => {
      success.value = false
    }, 3000)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al añadir comentario'
  } finally {
    loading.value = false
  }
}

// Función directa para redirigir al login
const redirectToLogin = () => {
  router.push(`/login?redirect=/workouts/${props.workoutId}`)
}
</script>

<template>
  <div class="comment-form-wrapper">
    <h3 class="info-section-title mb-4">Tu opinión</h3>
    
    <v-alert v-if="error" type="error" variant="tonal" density="comfortable" class="mb-4 error-alert">
      {{ error }}
    </v-alert>
    
    <v-alert v-if="success" type="success" variant="tonal" density="comfortable" class="mb-4 success-alert">
      <v-icon start>mdi-check-circle</v-icon>
      ¡Gracias por tu valoración!
    </v-alert>
    
    <v-card class="comment-form-card">
      <v-card-text>
        <v-form @submit.prevent="handleSubmit">
          <div class="rating-container mb-4">
            <div class="d-flex justify-center align-center">
              <span class="rating-label me-3">Tu valoración:</span>
              <v-rating
                v-model="form.calificacion"
                color="yellow-darken-3"
                hover
                half-increments
              ></v-rating>
            </div>
          </div>
          
          <v-textarea
            v-model="form.contenido"
            :label="authStore.isAuthenticated ? 'Comparte tu experiencia con este entrenamiento...' : 'Inicia sesión para comentar'"
            variant="outlined"
            rows="3"
            auto-grow
            counter="500"
            maxlength="500"
            bg-color="grey-lighten-4"
            :disabled="loading || !authStore.isAuthenticated"
            :hint="!authStore.isAuthenticated ? 'Debes iniciar sesión para dejar un comentario' : ''"
            persistent-hint
            class="comment-textarea"
          ></v-textarea>
          
          <div class="d-flex justify-center mt-4 mb-6">
            <!-- Botón de autenticación (muestra el botón normal de enviar o el de iniciar sesión) -->
            <v-btn
              v-if="authStore.isAuthenticated"
              type="submit"
              color="primary"
              :loading="loading"
              :disabled="loading"
              class="submit-button"
              prepend-icon="mdi-send"
            >
              Publicar comentario
            </v-btn>
            <v-btn
              v-else
              type="button"
              color="primary"
              class="submit-button"
              prepend-icon="mdi-login"
              @click="redirectToLogin"
            >
              Iniciar sesión para comentar
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.comment-form-wrapper {
  margin-bottom: 2rem;
}

.info-section-title {
  font-family: $font-family-base;
  font-weight: 600;
  margin-bottom: 1rem;
  position: relative;
  padding-left: 1rem;
  font-size: 1.25rem;

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

.v-card-text {
  padding: 12px;
}

.mb-6 {
  margin: 0px !important;
  padding: 12px;
}

.rating-container {
  background-color: $light-gray;
  border-radius: $border-radius;
  padding: 1rem;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: darken($light-gray, 3%);
  }
}

.rating-label {
  font-family: $font-family-text;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.7);
}

.comment-form-card {
  border-radius: $border-radius;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05) !important;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
  }
}

.comment-textarea {
  margin-top: 1rem;

  :deep(.v-field) {
    border-radius: $border-radius !important;
    transition: all 0.3s ease;
  }
}

.submit-button {
  border-radius: $border-radius;
  font-family: $font-family-base;
  font-weight: 500;
  transition: transform 0.2s ease;
  padding: 0.5rem 1.5rem;

  &:not(:disabled):hover {
    transform: translateY(-2px);
  }
}

.error-alert, 
.success-alert {
  border-radius: $border-radius;
  font-family: $font-family-text;
}
</style>