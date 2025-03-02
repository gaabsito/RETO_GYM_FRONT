<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useCommentStore } from '@/stores/comments'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import type { Comment } from '@/types/Comment'

const props = defineProps<{
  workoutId: number
}>()

const commentStore = useCommentStore()
const authStore = useAuthStore()
const { comments, loading } = storeToRefs(commentStore)

// Estados locales
const editingCommentId = ref<number | null>(null)
const editForm = ref({
  contenido: '',
  calificacion: 0
})

// Verificar si un comentario puede ser editado/eliminado por el usuario actual
const canManageComment = (comment: Comment) => {
  return authStore.isAuthenticated && authStore.user?.usuarioID === comment.usuarioID
}

// Formatear fecha

// Formatear fecha
const formatDate = (dateString: string | Date) => {
  // Asegurarnos de que siempre trabajamos con un objeto Date
  const date = dateString instanceof Date ? dateString : new Date(dateString)
  
  // Verificar si la fecha es válida
  if (isNaN(date.getTime())) {
    return 'Fecha no disponible'
  }
  
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Cargar comentarios
onMounted(async () => {
  try {
    await commentStore.fetchCommentsByWorkout(props.workoutId)
  } catch (error) {
    console.error('Error al cargar comentarios:', error)
  }
})

// Iniciar edición de comentario
const startEditing = (comment: Comment) => {
  editingCommentId.value = comment.comentarioID
  editForm.value = {
    contenido: comment.contenido,
    calificacion: comment.calificacion
  }
}

// Cancelar edición
const cancelEditing = () => {
  editingCommentId.value = null
}

// Guardar edición
const saveEdit = async (commentId: number) => {
  try {
    await commentStore.updateComment(commentId, {
      contenido: editForm.value.contenido,
      calificacion: editForm.value.calificacion
    })
    
    editingCommentId.value = null
  } catch (error) {
    console.error('Error al actualizar comentario:', error)
  }
}

// Eliminar comentario
const deleteComment = async (commentId: number) => {
  try {
    if (confirm('¿Estás seguro de que deseas eliminar este comentario?')) {
      await commentStore.deleteComment(commentId)
    }
  } catch (error) {
    console.error('Error al eliminar comentario:', error)
  }
}

// Ordenar comentarios del más reciente al más antiguo
const sortedComments = computed(() => {
  return [...comments.value].sort((a, b) => 
    new Date(b.fechaComentario).getTime() - new Date(a.fechaComentario).getTime()
  )
})
</script>

<template>
  <div class="comments-container">
    <h3 class="text-h5 mb-4">Comentarios y Valoraciones</h3>
    
    <!-- Loading State -->
    <div v-if="loading" class="d-flex justify-center my-4">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
    
    <!-- No Comments -->
    <v-alert v-else-if="sortedComments.length === 0" type="info" class="mb-4">
      Aún no hay comentarios para este entrenamiento.
    </v-alert>
    
    <!-- Comments List -->
    <div v-else class="comments-list">
      <v-card v-for="comment in sortedComments" :key="comment.comentarioID" class="comment-card mb-4">
        <!-- Comment Header -->
        <v-card-title class="comment-header d-flex justify-space-between align-center">
          <div class="user-info">
            <!-- Avatar placeholder (puede ser reemplazado por avatar del usuario) -->
            <v-avatar color="primary" class="mr-2">
              <span class="text-caption white--text">
                {{ comment.usuario?.nombre?.[0] || 'U' }}{{ comment.usuario?.apellido?.[0] || '' }}
              </span>
            </v-avatar>
            <span class="font-weight-bold">
              {{ comment.usuario?.nombre || 'Usuario' }} {{ comment.usuario?.apellido || '' }}
            </span>
          </div>
          
          <!-- Rating -->
          <v-rating
            v-if="editingCommentId !== comment.comentarioID"
            :model-value="comment.calificacion"
            color="yellow-darken-3"
            density="compact"
            half-increments
            readonly
            size="small"
          ></v-rating>
        </v-card-title>
        
        <!-- Comment Content -->
        <v-card-text>
          <!-- View Mode -->
          <div v-if="editingCommentId !== comment.comentarioID">
            <p class="comment-content">{{ comment.contenido }}</p>
            <div class="d-flex justify-space-between align-center mt-2">
              <span class="text-caption">{{ formatDate(comment.fechaComentario) }}</span>
              
              <!-- Action buttons for comment owner -->
              <div v-if="canManageComment(comment)">
                <v-btn
                  size="small"
                  variant="text"
                  color="primary"
                  icon="mdi-pencil"
                  @click="startEditing(comment)"
                ></v-btn>
                <v-btn
                  size="small"
                  variant="text"
                  color="error"
                  icon="mdi-delete"
                  @click="deleteComment(comment.comentarioID)"
                ></v-btn>
              </div>
            </div>
          </div>
          
          <!-- Edit Mode -->
          <div v-else>
            <v-textarea
              v-model="editForm.contenido"
              label="Editar comentario"
              variant="outlined"
              rows="3"
              auto-grow
              hide-details
              class="mb-2"
            ></v-textarea>
            
            <div class="d-flex flex-column flex-sm-row align-start align-sm-center mt-2">
              <div class="mb-2 mb-sm-0">
                <span class="mr-2">Calificación:</span>
                <v-rating
                  v-model="editForm.calificacion"
                  color="yellow-darken-3"
                  density="compact"
                  half-increments
                ></v-rating>
              </div>
              
              <v-spacer></v-spacer>
              
              <div>
                <v-btn
                  size="small"
                  variant="text"
                  color="grey"
                  @click="cancelEditing"
                  class="mr-2"
                >
                  Cancelar
                </v-btn>
                <v-btn
                  size="small"
                  variant="text"
                  color="primary"
                  @click="saveEdit(comment.comentarioID)"
                >
                  Guardar
                </v-btn>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.comments-container {
  margin-top: 2rem;
}

.comment-card {
  border-radius: $border-radius;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
}

.comment-header {
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.comment-content {
  white-space: pre-line;
  line-height: 1.6;
  font-family: $font-family-text;
}

.user-info {
  display: flex;
  align-items: center;
}

.v-card-text {
  padding: 1rem;
}

.v-btn {
  font-family: $font-family-base;
}

:deep(.v-field) {
  border-radius: $border-radius !important;
}
</style>