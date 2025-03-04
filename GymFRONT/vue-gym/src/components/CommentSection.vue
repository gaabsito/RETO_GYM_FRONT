<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useCommentStore } from '@/stores/comments'
import { useAuthStore } from '@/stores/auth'
import type { Comment } from '@/types/Comment'
import { storeToRefs } from 'pinia'

const props = defineProps<{
    workoutId: number
}>()

const commentStore = useCommentStore()
const authStore = useAuthStore()

const { comments, loading, error } = storeToRefs(commentStore)
const newComment = ref('')
const rating = ref(5)
const showCommentForm = ref(false)

// Cargar comentarios cuando cambie el workoutId
const fetchComments = async () => {
    try {
        await commentStore.fetchCommentsByWorkout(props.workoutId)
    } catch (err) {
        console.error('Error cargando comentarios:', err)
    }
}

onMounted(fetchComments)

// Actualizar comentarios cuando cambie el ID del entrenamiento
watch(() => props.workoutId, (newId, oldId) => {
    if (newId !== oldId) {
        fetchComments()
    }
})

// Formatear la fecha
const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date)
}

// Añadir un nuevo comentario
const addComment = async () => {
    if (!newComment.value.trim()) return

    try {
        await commentStore.addComment({
            entrenamientoID: props.workoutId,
            contenido: newComment.value.trim(),
            calificacion: rating.value
        })

        // Limpiar el formulario
        newComment.value = ''
        rating.value = 5
        showCommentForm.value = false
    } catch (err) {
        console.error('Error al añadir comentario:', err)
    }
}

// Variables para edición
const isEditing = ref(false)
const editCommentId = ref<number | null>(null)
const editContent = ref('')
const editRating = ref(5)

// Iniciar el formulario de comentarios
const toggleCommentForm = () => {
    if (!authStore.isAuthenticated) {
        // Redirigir al login si no está autenticado
        window.location.href = `/login?redirect=/workouts/${props.workoutId}`
        return
    }

    // Resetear estado de edición
    isEditing.value = false
    editCommentId.value = null

    showCommentForm.value = !showCommentForm.value
}

// Iniciar edición de un comentario
const startEditComment = (comment: Comment) => {
    // Llenar el formulario con los datos del comentario
    editCommentId.value = comment.comentarioID
    editContent.value = comment.contenido
    editRating.value = comment.calificacion
    isEditing.value = true
    showCommentForm.value = true

    // Desplazar hacia el formulario
    setTimeout(() => {
        const formElement = document.querySelector('.comment-form')
        if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }, 100)
}

// Actualizar un comentario existente
const updateComment = async () => {
    if (!editCommentId.value || !editContent.value.trim()) return

    try {
        await commentStore.updateComment(editCommentId.value, {
            contenido: editContent.value.trim(),
            calificacion: editRating.value
        })

        // Resetear el formulario
        isEditing.value = false
        editCommentId.value = null
        editContent.value = ''
        editRating.value = 5
        showCommentForm.value = false
    } catch (err) {
        console.error('Error al actualizar comentario:', err)
    }
}

// Eliminar un comentario
const deleteComment = async (commentId: number) => {
    const confirmation = confirm('¿Estás seguro de que deseas eliminar este comentario?')
    if (!confirmation) return

    try {
        await commentStore.deleteComment(commentId)
    } catch (err) {
        console.error('Error al eliminar comentario:', err)
    }
}

// Determinar si el usuario actual es el autor del comentario
const isCommentAuthor = (comment: Comment) => {
    return authStore.user && comment.usuarioID === authStore.user.usuarioID
}
</script>

<template>
    <v-card class="mt-6 comment-card">
        <v-card-title class="comment-title">
            <v-icon start color="white" class="me-2">mdi-comment-multiple</v-icon>
            Comentarios y valoraciones
        </v-card-title>

        <v-card-text>
            <!-- Loading State -->
            <div v-if="loading && !comments.length" class="d-flex justify-center my-4">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>

            <!-- Error State -->
            <v-alert v-if="error" type="error" class="mb-4">
                {{ error }}
            </v-alert>

            <!-- Lista de comentarios -->
            <div v-if="comments.length > 0" class="comments-list">
                <v-card v-for="comment in comments" :key="comment.comentarioID" class="mb-4 comment-item"
                    variant="outlined">
                    <v-card-text>
                        <div class="d-flex justify-space-between align-start">
                            <div>
                                <div class="font-weight-bold mb-1">
                                    {{ comment.usuario?.nombre || 'Usuario' }} {{ comment.usuario?.apellido || '' }}
                                </div>
                                <v-rating :model-value="comment.calificacion" color="amber" size="small" readonly
                                    dense></v-rating>
                            </div>
                            <div class="text-caption text-grey">
                                {{ formatDate(comment.fechaComentario) }}
                            </div>
                        </div>
                        <div class="mt-3">
                            {{ comment.contenido }}
                        </div>

                        <!-- Botones de acciones para el autor del comentario -->
                        <div v-if="isCommentAuthor(comment)" class="d-flex justify-end mt-2">
                            <v-btn size="small" variant="text" icon="mdi-pencil" @click="startEditComment(comment)"
                                class="me-1"></v-btn>
                            <v-btn size="small" variant="text" icon="mdi-delete"
                                @click="deleteComment(comment.comentarioID)"></v-btn>
                        </div>
                    </v-card-text>
                </v-card>

                <!-- Botón para añadir comentario -->
                <div class="d-flex justify-end boton-comentario">
                    <v-btn v-if="!showCommentForm" color="primary" prepend-icon="mdi-comment-plus"
                        @click="toggleCommentForm">
                        Añadir comentario
                    </v-btn>
                </div>

                <!-- Formulario para añadir o editar comentario -->
                <v-expand-transition>
                    <v-card v-if="showCommentForm" class="mb-6 pa-4 comment-form">
                        <v-card-title class="px-0">
                            {{ isEditing ? 'Editar comentario' : 'Nuevo comentario' }}
                        </v-card-title>

                        <v-card-text class="px-0">
                            <v-textarea v-if="isEditing" v-model="editContent"
                                label="Comparte tu opinión sobre este entrenamiento" variant="outlined" rows="3"
                                hide-details class="mb-4"></v-textarea>
                            <v-textarea v-else v-model="newComment" label="Comparte tu opinión sobre este entrenamiento"
                                variant="outlined" rows="3" hide-details class="mb-4"></v-textarea>

                            <div class="d-flex flex-column flex-sm-row align-center">
                                <div class="mb-4 mb-sm-0 me-sm-4">
                                    <v-rating v-if="isEditing" v-model="editRating" color="amber" hover
                                        size="small"></v-rating>
                                    <v-rating v-else v-model="rating" color="amber" hover size="small"></v-rating>
                                </div>

                                <div class="d-flex">
                                    <v-btn variant="text" @click="showCommentForm = false" class="me-2">
                                        Cancelar
                                    </v-btn>
                                    <v-btn color="primary" @click="isEditing ? updateComment() : addComment()"
                                        :disabled="isEditing ? !editContent.trim() : !newComment.trim()"
                                        :loading="loading">
                                        {{ isEditing ? 'Actualizar' : 'Publicar' }}
                                    </v-btn>
                                </div>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-expand-transition>
            </div>

            <!-- No Comments State -->
            <div v-else-if="!loading" class="text-center my-6">
                <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-comment-text-outline</v-icon>
                <p class="text-body-1 text-grey">No hay comentarios para este entrenamiento.</p>
                <p class="text-body-2 text-grey-darken-1">¡Sé el primero en comentar!</p>
            </div>
        </v-card-text>
    </v-card>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.comment-card {
    border-radius: $border-radius;
    background-color: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;

    &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
}

.comment-title {
    background-color: $primary-color;
    color: white;
    font-family: $font-family-base;
    font-size: 1.5rem;
    font-weight: 500;
    padding: 1rem;
}

.comment-form {
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: $border-radius;
    transition: all 0.3s ease;
}

.comment-item {
    border-radius: $border-radius;
    padding: 12px;
    transition: all 0.3s ease;

    &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
}

.v-card-text {
    font-family: $font-family-text;
    padding: 12px;
}

.boton-comentario {
    padding-bottom: 12px;
}

.v-btn {
    font-family: $font-family-base;
    border-radius: $border-radius;
    padding-right: 12px !important;
    padding-left: 12px !important;

    &:hover {
        transform: translateY(-1px);
    }
}

/* Responsive adjustments */
@media (max-width: 600px) {
    .comment-title {
        font-size: 1.25rem;
        padding: 0.75rem 1rem;
    }
}
</style>