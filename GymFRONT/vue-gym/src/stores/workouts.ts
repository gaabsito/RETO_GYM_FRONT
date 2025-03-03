// src/stores/workouts.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Workout, CreateWorkoutDTO } from '@/types/Workout'
import type { ApiResponse } from '@/types/ApiResponse'
import { useAuthStore } from './auth'

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7087'

export const useWorkoutStore = defineStore('workouts', () => {
    const workouts = ref<Workout[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function fetchWorkouts() {
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

            const response = await fetch(`${API_URL}/Entrenamiento`, { headers })
            const data: Workout[] = await response.json()

            if (!response.ok) {
                throw new Error('Error al cargar los entrenamientos')
            }

            workouts.value = data
            return data
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            workouts.value = []
            throw e
        } finally {
            loading.value = false
        }
    }

    // New method for deleting a workout
    async function deleteWorkout(workoutId: number) {
        loading.value = true
        error.value = null
        try {
            const authStore = useAuthStore()
            if (!authStore.token) {
                throw new Error('No autorizado')
            }

            const response = await fetch(`${API_URL}/Entrenamiento/${workoutId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authStore.token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Error al eliminar el entrenamiento')
            }

            // Remove the workout from the local store
            workouts.value = workouts.value.filter(w => w.entrenamientoID !== workoutId)

            return true
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            throw e
        } finally {
            loading.value = false
        }
    }

    // Existing methods for creating and fetching workouts
    async function createWorkout(workout: CreateWorkoutDTO) {
        loading.value = true
        error.value = null
        try {
            const authStore = useAuthStore()
            if (!authStore.token) throw new Error('No autorizado')
            
            const response = await fetch(`${API_URL}/Entrenamiento`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authStore.token}`
                },
                body: JSON.stringify(workout)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Error creando entrenamiento')
            }

            const createdWorkout: Workout = await response.json()
            
            // Add the new workout to the local store
            workouts.value.push(createdWorkout)

            return createdWorkout
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
        createWorkout,
        deleteWorkout  // Add the new method to the return object
    }
})