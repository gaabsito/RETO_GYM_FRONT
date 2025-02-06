import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Exercise } from '@/types/Exercise'
import type { ApiResponse } from '@/types/ApiResponse'
import { useAuthStore } from './auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5288'

export const useExerciseStore = defineStore('exercises', () => {
    const exercises = ref<Exercise[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function fetchExercises() {
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

            const response = await fetch(`${API_URL}/ejercicios`, { headers })
            const data: ApiResponse<Exercise[]> = await response.json()

            if (!response.ok) throw new Error(data.message || 'Error cargando ejercicios')

            exercises.value = data.data
            return data.data
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            throw e
        } finally {
            loading.value = false
        }
    }

    async function getExerciseById(id: number) {
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

            const response = await fetch(`${API_URL}/ejercicios/${id}`, { headers })
            const data: ApiResponse<Exercise> = await response.json()

            if (!response.ok) throw new Error(data.message || 'Error cargando ejercicio')

            return data.data
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            throw e
        } finally {
            loading.value = false
        }
    }

    return {
        exercises,
        loading,
        error,
        fetchExercises,
        getExerciseById
    }
})