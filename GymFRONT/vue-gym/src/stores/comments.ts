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

    // Función auxiliar para obtener la información del usuario
    async function fetchUserInfo(userId: number): Promise<{nombre: string, apellido: string} | null> {
        try {
            const authStore = useAuthStore()
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            }
            
            if (authStore.token) {
                headers['Authorization'] = `Bearer ${authStore.token}`
            }
            
            const response = await fetch(`${API_URL}/Usuario/${userId}`, { headers })
            
            if (!response.ok) {
                console.error(`Error al obtener información del usuario ${userId}`)
                return null
            }
            
            const userData = await response.json()
            return {
                nombre: userData.nombre || 'Usuario',
                apellido: userData.apellido || ''
            }
        } catch (error) {
            console.error('Error al obtener información de usuario:', error)
            return null
        }
    }

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
            
            // Procesar cada comentario para asegurar que tenga información de usuario
            const processedComments = []
            
            for(const comment of data) {
                let commentWithUser = { ...comment }
                
                // Si el comentario no tiene información de usuario pero sí un usuarioID
                if ((!comment.usuario || !comment.usuario.nombre) && comment.usuarioID) {
                    // Verificar si el comentario fue creado por el usuario actual
                    if (authStore.user && comment.usuarioID === authStore.user.usuarioID) {
                        commentWithUser.usuario = {
                            nombre: authStore.user.nombre,
                            apellido: authStore.user.apellido
                        }
                    } else {
                        // Obtener información del usuario desde la API
                        const userInfo = await fetchUserInfo(comment.usuarioID)
                        if (userInfo) {
                            commentWithUser.usuario = userInfo
                        } else {
                            // Si no se puede obtener la información, usar valores por defecto
                            commentWithUser.usuario = {
                                nombre: 'Usuario',
                                apellido: ''
                            }
                        }
                    }
                } else if (!comment.usuario) {
                    // Si no hay usuario ni ID, usar valores por defecto
                    commentWithUser.usuario = {
                        nombre: 'Usuario',
                        apellido: ''
                    }
                }
                
                processedComments.push(commentWithUser)
            }
            
            comments.value = processedComments
            return processedComments
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
    
            // Esperar un momento para que la BD procese la inserción
            await new Promise(resolve => setTimeout(resolve, 300))
            
            // Refrescar la lista completa de comentarios con la información de usuario
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