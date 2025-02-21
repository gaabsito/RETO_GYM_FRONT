import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Exercise } from '@/types/Exercise'
import type { ApiResponse } from '@/types/ApiResponse'
import { useAuthStore } from './auth'

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7087'

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

            const response = await fetch(`${API_URL}/ejercicio`, { headers })
            const data = await response.json()

            if (!response.ok) throw new Error(data.message || 'Error cargando ejercicios')

            // Guardamos los ejercicios en el state
            exercises.value = data
            return exercises.value
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            exercises.value = [] // Limpiamos el state en caso de error
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
    
            const response = await fetch(`${API_URL}/ejercicio/${id}`, { headers })
            const data = await response.json()
    
            if (!response.ok) throw new Error(data.message || 'Error cargando ejercicio')
    
            // Devolvemos directamente data
            return data
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