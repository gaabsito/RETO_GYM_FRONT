import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Comment } from '@/types/Comment'
import type { User } from '@/types/User'
import { useAuthStore } from './auth'

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7087'

export const useCommentStore = defineStore('comments', () => {
    const comments = ref<Comment[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function fetchCommentsByWorkout(workoutId: number) {
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

            const response = await fetch(`${API_URL}/Comentario/entrenamiento/${workoutId}`, { headers })
            
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Error cargando comentarios')
            }

            const data = await response.json()
            // Enriquecer los comentarios con los datos de usuario si están disponibles
            comments.value = data.map((comment: any) => {
                if (comment.usuario) {
                    return { ...comment }
                } else {
                    return { 
                        ...comment,
                        usuario: {
                            nombre: 'Usuario',
                            apellido: ''
                        }
                    }
                }
            })
            return data
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            comments.value = []
            throw e
        } finally {
            loading.value = false
        }
    }

    async function addComment(comment: { 
        entrenamientoID: number, 
        contenido: string, 
        calificacion: number 
    }) {
        loading.value = true
        error.value = null
        try {
            const authStore = useAuthStore()
            if (!authStore.token || !authStore.user) {
                throw new Error('No autorizado')
            }
    
            const commentData = {
                entrenamientoID: comment.entrenamientoID,
                usuarioID: authStore.user.usuarioID,
                contenido: comment.contenido,
                calificacion: comment.calificacion
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
    
            // Como el comentario no tiene ID válido en la respuesta,
            // simplemente refrescamos la lista completa de comentarios
            await fetchCommentsByWorkout(comment.entrenamientoID)
            
            return true
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            throw e
        } finally {
            loading.value = false
        }
    }

    async function updateComment(id: number, updatedData: { 
        contenido?: string, 
        calificacion?: number 
    }) {
        loading.value = true
        error.value = null
        try {
            const authStore = useAuthStore()
            if (!authStore.token) {
                throw new Error('No autorizado')
            }

            const response = await fetch(`${API_URL}/Comentario/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authStore.token}`
                },
                body: JSON.stringify(updatedData)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Error al actualizar comentario')
            }

            // Actualizar el comentario en la lista local
            const index = comments.value.findIndex(c => c.comentarioID === id)
            if (index !== -1) {
                comments.value[index] = { 
                    ...comments.value[index], 
                    ...updatedData 
                }
            }

            return true
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            throw e
        } finally {
            loading.value = false
        }
    }

    async function deleteComment(id: number) {
        if (!id || id <= 0) {
            console.error('Intentando eliminar un comentario con ID inválido:', id);
            error.value = 'ID de comentario inválido';
            return false;
        }
    
        loading.value = true
        error.value = null
        try {
            const authStore = useAuthStore()
            if (!authStore.token) {
                throw new Error('No autorizado')
            }
    
            console.log(`Eliminando comentario con ID: ${id}`);
            const response = await fetch(`${API_URL}/Comentario/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authStore.token}`
                }
            })
    
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Error al eliminar comentario. Status: ${response.status}, Respuesta:`, errorText);
                throw new Error(`Error al eliminar comentario (${response.status})`)
            }
    
            // Eliminar el comentario de la lista local
            comments.value = comments.value.filter(c => c.comentarioID !== id)
            
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
        updateComment,
        deleteComment
    }
})