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
const confirmDeleteDialog = ref(false)
const commentToDelete = ref<number | null>(null)

// Verificar si un comentario puede ser editado/eliminado por el usuario actual
const canManageComment = (comment: Comment) => {
  return authStore.isAuthenticated && authStore.user?.usuarioID === comment.usuarioID
}

// Formatear fecha
const formatDate = (dateInput: string | Date | undefined | null) => {
  // Si la fecha es undefined o null, retornar un mensaje
  if (dateInput === undefined || dateInput === null) {
    return 'Fecha no disponible'
  }
  
  try {
    // Intentar convertir a Date si es un string
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      return 'Fecha no válida'
    }
    
    // Formatear la fecha utilizando toLocaleDateString
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('Error al formatear fecha:', error)
    return 'Error de formato'
  }
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

// Confirmar eliminación
const confirmDelete = (commentId: number) => {
  // Validar que el ID sea válido
  if (!commentId || commentId <= 0) {
    console.error('ID de comentario inválido:', commentId)
    return
  }
  
  // Validar que el usuario pueda eliminar este comentario
  const comment = comments.value.find(c => c.comentarioID === commentId)
  if (!comment || !canManageComment(comment)) {
    console.error('No tienes permiso para eliminar este comentario')
    return
  }
  
  commentToDelete.value = commentId
  confirmDeleteDialog.value = true
}

// Eliminar comentario
const deleteComment = async () => {
  if (!commentToDelete.value) return
  
  try {
    await commentStore.deleteComment(commentToDelete.value)
    confirmDeleteDialog.value = false
    commentToDelete.value = null
  } catch (error) {
    console.error('Error al eliminar comentario:', error)
  }
}

// Obtener nombre de usuario para un comentario
const getUserName = (comment: Comment) => {
  // Si tenemos la propiedad usuario en el comentario, usarla
  if (comment.usuario?.nombre) {
    return `${comment.usuario.nombre} ${comment.usuario.apellido || ''}`;
  }
  
  // Si el comentario es del usuario actual, usar sus datos
  if (authStore.user && comment.usuarioID === authStore.user.usuarioID) {
    return `${authStore.user.nombre} ${authStore.user.apellido || ''}`;
  }
  
  // Caso de fallback
  return 'Usuario';
}

// Obtener iniciales para el avatar
const getUserInitials = (comment: Comment) => {
  // Si tenemos la propiedad usuario en el comentario, usarla
  if (comment.usuario?.nombre) {
    return `${comment.usuario.nombre[0] || ''}${comment.usuario.apellido?.[0] || ''}`;
  }
  
  // Si el comentario es del usuario actual, usar sus datos
  if (authStore.user && comment.usuarioID === authStore.user.usuarioID) {
    return `${authStore.user.nombre[0] || ''}${authStore.user.apellido?.[0] || ''}`;
  }
  
  // Caso de fallback
  return 'U';
}

// Ordenar comentarios del más reciente al más antiguo
const sortedComments = computed(() => {
  return [...comments.value].sort((a, b) => 
    new Date(b.fechaComentario).getTime() - new Date(a.fechaComentario).getTime()
  )
})

// Calcular la calificación promedio
const averageRating = computed(() => {
  if (!comments.value || comments.value.length === 0) return 0
  
  const total = comments.value.reduce((sum, comment) => sum + comment.calificacion, 0)
  return (total / comments.value.length).toFixed(1)
})
</script>

<template>
  <div class="comments-container">
    <h3 class="info-section-title mb-4">Valoraciones y opiniones</h3>
    
    <!-- Estadísticas de valoraciones -->
    <div v-if="!loading && comments.length > 0" class="ratings-stats mb-5">
      <div class="ratings-overview">
        <div class="average-rating">
          <span class="rating-number">{{ averageRating }}</span>
          <v-rating
            :model-value="Number(averageRating)"
            color="yellow-darken-3"
            readonly
            half-increments
            size="small"
          ></v-rating>
          <span class="total-reviews">{{ comments.length }} valoraciones</span>
        </div>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="d-flex justify-center align-center py-5">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
    
    <!-- No Comments -->
    <div v-else-if="sortedComments.length === 0" class="no-comments">
      <v-icon size="48" color="grey-lighten-2">mdi-comment-text-outline</v-icon>
      <p class="mt-3">Aún no hay comentarios para este entrenamiento. ¡Sé el primero en opinar!</p>
    </div>
    
    <!-- Comments List -->
    <div v-else class="comments-list">
      <v-card v-for="comment in sortedComments" :key="comment.comentarioID" class="comment-card mb-4">
        <!-- Comment Header -->
        <v-card-item class="comment-header">
          <template v-slot:prepend>
            <v-avatar color="primary" class="mr-3" size="40">
              <span class="text-caption white--text">
                {{ getUserInitials(comment) }}
              </span>
            </v-avatar>
          </template>
          
          <v-card-title class="user-name">
            {{ getUserName(comment) }}
            
            <span class="text-caption ml-2 text-grey">
              {{ formatDate(comment.fechaComentario) }}
            </span>
          </v-card-title>
          
          <v-card-subtitle class="d-flex justify-left">
            <v-rating
              v-if="editingCommentId !== comment.comentarioID"
              :model-value="comment.calificacion"
              color="yellow-darken-3"
              density="compact"
              half-increments
              readonly
              size="small"
            ></v-rating>
          </v-card-subtitle>
        </v-card-item>
        
        <!-- Comment Content -->
        <v-card-text class="comment-content-wrapper">
          <!-- View Mode -->
          <template v-if="editingCommentId !== comment.comentarioID">
            <p class="comment-content">{{ comment.contenido }}</p>
            
            <!-- Action buttons for comment owner -->
            <div v-if="canManageComment(comment)" class="comment-actions">
              <v-btn
                size="small"
                variant="text"
                color="primary"
                prepend-icon="mdi-pencil"
                @click="startEditing(comment)"
                class="action-btn mr-3"
              >
                Editar
              </v-btn>
              <v-btn
                size="small"
                variant="text"
                color="error"
                prepend-icon="mdi-delete"
                @click="confirmDelete(comment.comentarioID)"
                class="action-btn"
              >
                Eliminar
              </v-btn>
            </div>
          </template>
          
          <!-- Edit Mode -->
          <div v-else class="edit-mode">
            <div class="mb-3">
              <label class="rating-edit-label mb-2 d-block">Calificación:</label>
              <v-rating
                v-model="editForm.calificacion"
                color="yellow-darken-3"
                hover
                half-increments
              ></v-rating>
            </div>
          
            <v-textarea
              v-model="editForm.contenido"
              label="Editar comentario"
              variant="outlined"
              rows="3"
              auto-grow
              hide-details
              bg-color="grey-lighten-4"
              class="mb-3"
            ></v-textarea>
            
            <div class="d-flex justify-end">
              <v-btn
                variant="text"
                color="grey"
                @click="cancelEditing"
                class="mr-2"
                size="small"
              >
                Cancelar
              </v-btn>
              <v-btn
                variant="text"
                color="primary"
                @click="saveEdit(comment.comentarioID)"
                size="small"
              >
                Guardar cambios
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
    
    <!-- Confirmation Dialog -->
    <v-dialog v-model="confirmDeleteDialog" max-width="400">
      <v-card>
        <v-card-title>Confirmar eliminación</v-card-title>
        <v-card-text>
          ¿Estás seguro de que deseas eliminar este comentario? Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="confirmDeleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" @click="deleteComment">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.comments-container {
  margin-top: 1rem;
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

.no-comments {
  text-align: center;
  padding: 3rem 1rem;
  color: rgba(0, 0, 0, 0.5);
  font-family: $font-family-text;
  background-color: $light-gray;
  border-radius: $border-radius;
}

.ratings-stats {
  background-color: $light-gray;
  border-radius: $border-radius;
  padding: 1.25rem;
  
  .ratings-overview {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .average-rating {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .rating-number {
      font-size: 2.5rem;
      font-weight: 700;
      line-height: 1;
      color: $secondary-color;
      font-family: $font-family-base;
    }
    
    .total-reviews {
      margin-top: 0.5rem;
      font-size: 0.9rem;
      color: rgba(0, 0, 0, 0.6);
    }
  }
}

.comment-card {
  border-radius: $border-radius;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
    transform: translateY(-2px);
  }
}

.comment-header {
  padding: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background-color: $light-gray;
}

.user-name {
  font-family: $font-family-base;
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.comment-content-wrapper {
  padding: 1.25rem;
  position: relative;
}

.comment-content {
  white-space: pre-line;
  line-height: 1.6;
  font-family: $font-family-text;
  color: rgba(0, 0, 0, 0.8);
  margin-bottom: 0;
}

.comment-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
  
  .action-btn {
    font-family: $font-family-base;
    font-size: 0.85rem;
    text-transform: none;
    letter-spacing: 0;
  }
}

.edit-mode {
  background-color: rgba(0, 0, 0, 0.02);
  padding: 1rem;
  border-radius: $border-radius;
  
  .rating-edit-label {
    font-family: $font-family-text;
    font-weight: 600;
    font-size: 0.9rem;
    color: rgba(0, 0, 0, 0.7);
  }
}

:deep(.v-field) {
  border-radius: $border-radius !important;
}

:deep(.v-btn) {
  border-radius: $border-radius;
  font-family: $font-family-base;
}

// Responsive
@media (max-width: 599px) {
  .ratings-stats {
    padding: 1rem;
  }
  
  .average-rating .rating-number {
    font-size: 2rem;
  }
  
  .comment-header {
    padding: 0.75rem;
  }
  
  .comment-content-wrapper {
    padding: 1rem;
  }
}
</style>