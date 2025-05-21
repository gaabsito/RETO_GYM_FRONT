// src/stores/workouts.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'
import type { Workout, CreateWorkoutDTO, EntrenamientoEjercicio } from '@/types/Workout'
import type { ApiResponse } from '@/types/ApiResponse'

// IMPORTANTE: Asegúrate de que esta URL base sea correcta
// Puede ser 'https://localhost:7087' (sin /api) 
// O 'https://localhost:7087/api' (con /api)
const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7087'

export const useWorkoutStore = defineStore('workouts', () => {
    const workouts = ref<Workout[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const authStore = useAuthStore()

    async function fetchWorkouts() {
        loading.value = true
        error.value = null
        try {
            // No añadir "/api" - parece que ya está incluido en la URL base
            const endpoint = authStore.isAuthenticated 
                ? `${API_URL}/Entrenamiento` 
                : `${API_URL}/Entrenamiento/public`
            
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            }

            if (authStore.token) {
                headers['Authorization'] = `Bearer ${authStore.token}`
            }

            const response = await fetch(endpoint, { headers })
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Error cargando entrenamientos')
            }

            workouts.value = data
            return workouts.value
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            throw e
        } finally {
            loading.value = false
        }
    }

    async function getWorkoutById(id: number) {
        loading.value = true
        error.value = null
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            }

            if (authStore.token) {
                headers['Authorization'] = `Bearer ${authStore.token}`
            }

            const response = await fetch(`${API_URL}/Entrenamiento/${id}`, { headers })
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Error cargando entrenamiento')
            }

            return data
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            throw e
        } finally {
            loading.value = false
        }
    }

    async function getWorkoutExercises(id: number) {
        loading.value = true
        error.value = null
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            }

            if (authStore.token) {
                headers['Authorization'] = `Bearer ${authStore.token}`
            }

            const response = await fetch(`${API_URL}/Entrenamiento/ejercicios/${id}`, { headers })
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Error cargando ejercicios del entrenamiento')
            }

            return data.data || []
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            throw e
        } finally {
            loading.value = false
        }
    }

    async function createWorkout(workoutData: FormData) {
        loading.value = true
        error.value = null
        try {
            if (!authStore.token) {
                throw new Error('No autorizado')
            }

            const headers: Record<string, string> = {
                'Authorization': `Bearer ${authStore.token}`
            }
            
            // No añadir Content-Type porque FormData lo establece con el boundary correcto

            const response = await fetch(`${API_URL}/Entrenamiento`, {
                method: 'POST',
                headers,
                body: workoutData
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Error al crear el entrenamiento')
            }

            // Refrescar la lista de entrenamientos
            await fetchWorkouts()
            
            return data
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            throw e
        } finally {
            loading.value = false
        }
    }

    async function updateWorkout(id: number, workoutData: Partial<Workout>) {
        loading.value = true
        error.value = null
        try {
            if (!authStore.token) {
                throw new Error('No autorizado')
            }

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`
            }

            const response = await fetch(`${API_URL}/Entrenamiento/${id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(workoutData)
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Error al actualizar el entrenamiento')
            }

            // Actualizar el workout en el array local
            const index = workouts.value.findIndex(w => w.entrenamientoID === id)
            if (index !== -1) {
                workouts.value[index] = { ...workouts.value[index], ...workoutData }
            }

            return data
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            throw e
        } finally {
            loading.value = false
        }
    }

    async function deleteWorkout(id: number) {
        loading.value = true
        error.value = null
        try {
            if (!authStore.token) {
                throw new Error('No autorizado')
            }

            const headers: Record<string, string> = {
                'Authorization': `Bearer ${authStore.token}`
            }

            const response = await fetch(`${API_URL}/Entrenamiento/${id}`, {
                method: 'DELETE',
                headers
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Error al eliminar el entrenamiento')
            }

            // Eliminar el workout del array local
            workouts.value = workouts.value.filter(w => w.entrenamientoID !== id)

            return true
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            throw e
        } finally {
            loading.value = false
        }
    }

    // Debug: Mostrar la URL base
    console.log('API_URL usado en workouts store:', API_URL);

    async function addExerciseToWorkout(workoutId: number, exerciseId: number, details: {
        series: number;
        repeticiones: number;
        descansoSegundos: number;
        notas?: string;
    }) {
        loading.value = true
        error.value = null
        try {
            if (!authStore.token) {
                throw new Error('No autorizado')
            }

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`
            }

            const data = {
                entrenamientoID: workoutId,
                ejercicioID: exerciseId,
                series: details.series,
                repeticiones: details.repeticiones,
                descansoSegundos: details.descansoSegundos,
                notas: details.notas || ''
            }

            const response = await fetch(`${API_URL}/EntrenamientoEjercicio`, {
                method: 'POST',
                headers,
                body: JSON.stringify(data)
            })

            const responseData = await response.json()

            if (!response.ok) {
                throw new Error(responseData.message || 'Error al añadir ejercicio al entrenamiento')
            }

            return responseData
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            throw e
        } finally {
            loading.value = false
        }
    }

    async function removeExerciseFromWorkout(workoutId: number, exerciseId: number) {
        loading.value = true
        error.value = null
        try {
            if (!authStore.token) {
                throw new Error('No autorizado')
            }

            const headers: Record<string, string> = {
                'Authorization': `Bearer ${authStore.token}`
            }

            const response = await fetch(`${API_URL}/EntrenamientoEjercicio/${workoutId}/${exerciseId}`, {
                method: 'DELETE',
                headers
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Error al eliminar el ejercicio del entrenamiento')
            }

            return true
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            throw e
        } finally {
            loading.value = false
        }
    }

    return {
        workouts,
        loading,
        error,
        fetchWorkouts,
        getWorkoutById,
        getWorkoutExercises,
        createWorkout,
        updateWorkout,
        deleteWorkout,
        addExerciseToWorkout,
        removeExerciseFromWorkout
    }
})