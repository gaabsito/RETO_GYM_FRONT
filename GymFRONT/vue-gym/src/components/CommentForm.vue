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
  calificacion: 3
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
      calificacion: 3
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
</script>

<template>
  <v-card class="comment-form-card">
    <v-card-title class="comment-form-title">
      Deja tu opinión
    </v-card-title>
    
    <v-card-text>
      <v-alert v-if="error" type="error" class="mb-4">
        {{ error }}
      </v-alert>
      <v-alert v-if="success" type="success" class="mb-4">
        Comentario añadido correctamente
      </v-alert>
      
      <v-form @submit.prevent="handleSubmit">
        <div class="rating-container mb-4">
          <span class="mr-2">Tu valoración:</span>
          <v-rating
            v-model="form.calificacion"
            color="yellow-darken-3"
            hover
            half-increments
          ></v-rating>
        </div>
        
        <v-textarea
          v-model="form.contenido"
          label="Escribe tu comentario"
          variant="outlined"
          rows="3"
          auto-grow
          counter="500"
          maxlength="500"
          :disabled="loading"
          :readonly="!authStore.isAuthenticated"
          :hint="!authStore.isAuthenticated ? 'Inicia sesión para comentar' : ''"
          persistent-hint
        ></v-textarea>
        
        <div class="d-flex justify-end mt-4">
          <v-btn
            type="submit"
            color="primary"
            :loading="loading"
            :disabled="!authStore.isAuthenticated || loading"
          >
            {{ authStore.isAuthenticated ? 'Publicar comentario' : 'Inicia sesión para comentar' }}
          </v-btn>
        </div>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.comment-form-card {
  border-radius: $border-radius;
  margin-bottom: 2rem;
}

.comment-form-title {
  background-color: $primary-color;
  color: white;
  padding: 1rem;
  font-family: $font-family-base;
}

.rating-container {
  display: flex;
  align-items: center;
  font-family: $font-family-text;
}

.v-btn {
  font-family: $font-family-base;
  border-radius: $border-radius;
}

:deep(.v-field) {
  border-radius: $border-radius !important;
}
</style>