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
    <h3 class="info-section-title">TU OPINIÓN</h3>
    
    <v-alert v-if="error" type="error" variant="tonal" density="compact" class="error-alert">
      {{ error }}
    </v-alert>
    
    <v-alert v-if="success" type="success" variant="tonal" density="compact" class="success-alert">
      <v-icon start>mdi-check-circle</v-icon>
      ¡Gracias por tu valoración!
    </v-alert>
    
    <v-card class="comment-form-card">
      <v-card-text class="card-content">
        <v-form @submit.prevent="handleSubmit">
          <div class="rating-container">
            <div class="d-flex justify-center align-center">
              <span class="rating-label">Tu valoración:</span>
              <v-rating
                v-model="form.calificacion"
                color="yellow-darken-3"
                hover
                half-increments
                size="small"
                density="compact"
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
            hide-details="auto"
            density="compact"
            class="comment-textarea"
          ></v-textarea>
          
          <div class="action-container">
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
  margin-bottom: 1rem;
  padding: 0 0.5rem;
}

.info-section-title {
  font-family: $font-family-base;
  font-weight: 600;
  margin-bottom: 0.5rem;
  position: relative;
  padding-left: 1rem;
  font-size: 1.1rem;
  text-transform: uppercase;

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

.card-content {
  padding: 0.75rem !important;
}

.rating-container {
  background-color: $light-gray;
  border-radius: $border-radius;
  padding: 0.5rem;
  margin-bottom: 0.75rem;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: darken($light-gray, 3%);
  }
}

.rating-label {
  font-family: $font-family-text;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.7);
  margin-right: 0.5rem;
  font-size: 0.9rem;
}

.comment-form-card {
  border-radius: $border-radius;
  overflow: hidden;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.05) !important;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1) !important;
  }
}

.comment-textarea {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;

  :deep(.v-field) {
    border-radius: $border-radius !important;
  }
}

.action-container {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
}

.submit-button {
  border-radius: $border-radius;
  font-family: $font-family-base;
  font-weight: 500;
  font-size: 0.9rem;
  padding: 0.4rem 1rem;

  &:not(:disabled):hover {
    transform: translateY(-1px);
  }
}

.error-alert, 
.success-alert {
  border-radius: $border-radius;
  font-family: $font-family-text;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

/* Ajustes específicos para móvil */
@media (max-width: 600px) {
  .comment-form-wrapper {
    padding: 0 0.25rem;
  }

  .info-section-title {
    font-size: 1rem;
    margin: 0.5rem 0;
  }

  .card-content {
    padding: 0.5rem !important;
  }

  .rating-container {
    padding: 1rem;
  }

  .submit-button {
    font-size: 0.85rem;
    padding: 0.35rem 0.75rem;
  }
}
</style>