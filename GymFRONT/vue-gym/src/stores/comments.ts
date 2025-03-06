import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Comment } from '@/types/Comment'
import { useAuthStore } from './auth'

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7087'

export const useCommentStore = defineStore('comments', () => {
    const comments = ref<Comment[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    // Obtener comentarios por entrenamiento
    async function fetchCommentsByWorkout(entrenamientoId: number) {
        loading.value = true
        error.value = null
        try {
            const authStore = useAuthStore()
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            }

            if (authStore.token) {
                headers['Authorization'] = `Bearer ${authStore.token}`
            }

            const response = await fetch(`${API_URL}/Comentario/entrenamiento/${entrenamientoId}`, { headers })
            
            if (!response.ok) {
                throw new Error('Error al cargar comentarios')
            }

            const text = await response.text()
            if (!text) {
                comments.value = []
                return []
            }

            const data = JSON.parse(text)
            comments.value = data
            return data
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            comments.value = []
            throw e
        } finally {
            loading.value = false
        }
    }

    // Añadir un comentario
    async function addComment(comment: {
        entrenamientoID: number
        contenido: string
        calificacion: number
    }) {
        loading.value = true
        error.value = null
        try {
            const authStore = useAuthStore()
            if (!authStore.token || !authStore.user) {
                throw new Error('Debes iniciar sesión para comentar')
            }

            const commentData = {
                ...comment,
                usuarioID: authStore.user.usuarioID
            }

            const response = await fetch(`${API_URL}/Comentario`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authStore.token}`
                },
                body: JSON.stringify(commentData)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Error al añadir comentario')
            }

            // Obtenemos la respuesta del servidor
            const newComment = await response.json()
            
            // Si el ID es 0 o no existe, simplemente recargamos todos los comentarios
            if (!newComment.comentarioID || newComment.comentarioID === 0) {
                console.log('Comentario creado exitosamente, pero sin ID. Recargando comentarios...');
                await fetchCommentsByWorkout(comment.entrenamientoID);
                return;
            }

            // Si llegamos aquí, es porque el comentario tiene un ID válido
            const commentWithUser: Comment = {
                ...newComment,
                usuarioID: authStore.user.usuarioID,
                usuario: {
                    nombre: authStore.user.nombre,
                    apellido: authStore.user.apellido
                }
            }
            
            // Añadir el nuevo comentario a la lista local
            comments.value.push(commentWithUser)
            
            return commentWithUser
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            throw e
        } finally {
            loading.value = false
        }
    }

    // Eliminar un comentario
    async function deleteComment(commentId: number) {
        // Validar que el ID sea válido
        if (!commentId || commentId <= 0) {
            console.error('ID de comentario inválido:', commentId);
            return false;
        }
        
        loading.value = true
        error.value = null
        try {
            const authStore = useAuthStore()
            if (!authStore.token) {
                throw new Error('No autorizado')
            }

            const response = await fetch(`${API_URL}/Comentario/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authStore.token}`
                }
            })

            if (!response.ok) {
                throw new Error('Error al eliminar comentario')
            }

            // Eliminar el comentario de la lista local
            comments.value = comments.value.filter(c => c.comentarioID !== commentId)
            
            return true
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            throw e
        } finally {
            loading.value = false
        }
    }

    // Actualizar un comentario
    async function updateComment(commentId: number, data: { contenido?: string, calificacion?: number }) {
        // Validar que el ID sea válido
        if (!commentId || commentId <= 0) {
            console.error('ID de comentario inválido:', commentId);
            return false;
        }
        
        loading.value = true
        error.value = null
        try {
            const authStore = useAuthStore()
            if (!authStore.token) {
                throw new Error('No autorizado')
            }

            const response = await fetch(`${API_URL}/Comentario/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authStore.token}`
                },
                body: JSON.stringify(data)
            })

            if (!response.ok) {
                throw new Error('Error al actualizar comentario')
            }

            // Actualizar el comentario en la lista local
            comments.value = comments.value.map(c => {
                if (c.comentarioID === commentId) {
                    return { ...c, ...data }
                }
                return c
            })
            
            return true
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            throw e
        } finally {
            loading.value = false
        }
    }

    return {
        comments,
        loading,
        error,
        fetchCommentsByWorkout,
        addComment,
        deleteComment,
        updateComment
    }
})