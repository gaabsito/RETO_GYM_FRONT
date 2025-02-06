import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Workout, CreateWorkoutDTO } from '@/types/Workout'
import type { ApiResponse } from '@/types/ApiResponse'
import { useAuthStore } from './auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5288'

export const useWorkoutStore = defineStore('workouts', () => {
    const workouts = ref<Workout[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function fetchWorkouts(isPublic: boolean = true) {
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

            const response = await fetch(
                `${API_URL}/entrenamientos${isPublic ? '/public' : ''}`,
                { headers }
            )

            const data: ApiResponse<Workout[]> = await response.json()

            if (!response.ok) throw new Error(data.message || 'Error cargando entrenamientos')

            workouts.value = data.data
            return data.data
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
            const authStore = useAuthStore()
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            }

            if (authStore.token) {
                headers['Authorization'] = `Bearer ${authStore.token}`
            }

            const response = await fetch(`${API_URL}/entrenamientos/${id}`, { headers })
            const data: ApiResponse<Workout> = await response.json()

            if (!response.ok) throw new Error(data.message || 'Error cargando entrenamiento')

            return data.data
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            throw e
        } finally {
            loading.value = false
        }
    }

    async function createWorkout(workout: CreateWorkoutDTO) {
        loading.value = true
        error.value = null
        try {
            const authStore = useAuthStore()
            if (!authStore.token) throw new Error('No autorizado')

            const response = await fetch(`${API_URL}/entrenamientos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authStore.token}`
                },
                body: JSON.stringify(workout)
            })

            const data: ApiResponse<Workout> = await response.json()

            if (!response.ok) throw new Error(data.message || 'Error creando entrenamiento')

            workouts.value.push(data.data)
            return data.data
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
        createWorkout
    }
})