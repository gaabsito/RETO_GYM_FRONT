// src/stores/rutinasCompletadas.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RutinaCompletada, RutinaCompletadaCreate, RutinaCompletadaUpdate, ResumenRutinas } from '@/types/RutinaCompletada'
import type { ApiResponse } from '@/types/ApiResponse'
import { useAuthStore } from './auth'

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7087/api'

export const useRutinasCompletadasStore = defineStore('rutinasCompletadas', () => {
    const rutinasCompletadas = ref<RutinaCompletada[]>([])
    const resumen = ref<ResumenRutinas | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    // Obtener todas las rutinas completadas del usuario actual
    async function fetchRutinasCompletadas() {
        loading.value = true
        error.value = null
        try {
            const authStore = useAuthStore()
            if (!authStore.token) {
                throw new Error('No autorizado')
            }

            const response = await fetch(`${API_URL}/RutinaCompletada`, {
                headers: {
                    'Authorization': `Bearer ${authStore.token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Error al cargar rutinas completadas')
            }

            const data: ApiResponse<RutinaCompletada[]> = await response.json()
            
            if (!data.success) {
                throw new Error(data.message || 'Error al cargar rutinas completadas')
            }

            // Convertir fechas de string a Date
            rutinasCompletadas.value = data.data.map(rc => ({
                ...rc,
                fechaCompletada: new Date(rc.fechaCompletada)
            }))
            
            return rutinasCompletadas.value
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            throw e
        } finally {
            loading.value = false
        }
    }

    // Obtener una rutina completada específica
    async function getRutinaCompletadaById(id: number) {
        loading.value = true
        error.value = null
        try {
            const authStore = useAuthStore()
            if (!authStore.token) {
                throw new Error('No autorizado')
            }

            const response = await fetch(`${API_URL}/RutinaCompletada/${id}`, {
                headers: {
                    'Authorization': `Bearer ${authStore.token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Error al cargar rutina completada')
            }

            const data: ApiResponse<RutinaCompletada> = await response.json()
            
            if (!data.success) {
                throw new Error(data.message || 'Error al cargar rutina completada')
            }

            // Convertir fecha de string a Date
            const rutinaCompletada: RutinaCompletada = {
                ...data.data,
                fechaCompletada: new Date(data.data.fechaCompletada)
            }
            
            return rutinaCompletada
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            throw e
        } finally {
            loading.value = false
        }
    }

    // Obtener las rutinas completadas para un entrenamiento específico
    async function getRutinasCompletadasByEntrenamiento(entrenamientoId: number) {
        loading.value = true
        error.value = null
        try {
            const authStore = useAuthStore()
            if (!authStore.token) {
                throw new Error('No autorizado')
            }

            const response = await fetch(`${API_URL}/RutinaCompletada/Entrenamiento/${entrenamientoId}`, {
                headers: {
                    'Authorization': `Bearer ${authStore.token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || 'Error al cargar rutinas completadas')
            }

            const text = await response.text()
            if (!text) {
                return []
            }

            const data: ApiResponse<RutinaCompletada[]> = JSON.parse(text)
            
            if (!data.success) {
                throw new Error(data.message || 'Error al cargar rutinas completadas')
            }

            // Convertir fechas de string a Date
            const rutinasEntrenamiento = data.data.map(rc => ({
                ...rc,
                fechaCompletada: new Date(rc.fechaCompletada)
            }))
            
            return rutinasEntrenamiento
        } catch (e) {
            console.error('Error al cargar rutinas completadas por entrenamiento:', e)
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            // Retornar array vacío en lugar de lanzar error para manejar gracefully
            return []
        } finally {
            loading.value = false
        }
    }

    // Obtener el resumen de las rutinas completadas
    async function fetchResumen() {
        loading.value = true
        error.value = null
        try {
            const authStore = useAuthStore()
            if (!authStore.token) {
                throw new Error('No autorizado')
            }

            const response = await fetch(`${API_URL}/RutinaCompletada/Resumen`, {
                headers: {
                    'Authorization': `Bearer ${authStore.token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Error al cargar resumen')
            }

            const data: ApiResponse<ResumenRutinas> = await response.json()
            
            if (!data.success) {
                throw new Error(data.message || 'Error al cargar resumen')
            }

            resumen.value = data.data
            return resumen.value
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            throw e
        } finally {
            loading.value = false
        }
    }

    // Marcar una rutina como completada
    async function completarRutina(rutinaCompletada: RutinaCompletadaCreate) {
        loading.value = true
        error.value = null
        try {
            const authStore = useAuthStore()
            if (!authStore.token) {
                throw new Error('No autorizado')
            }

            console.log('Completando rutina:', rutinaCompletada)

            const response = await fetch(`${API_URL}/RutinaCompletada`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authStore.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(rutinaCompletada)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Error al marcar rutina como completada')
            }

            const data: ApiResponse<RutinaCompletada> = await response.json()
            
            if (!data.success) {
                throw new Error(data.message || 'Error al marcar rutina como completada')
            }

            // Convertir fecha de string a Date
            const nuevaRutinaCompletada: RutinaCompletada = {
                ...data.data,
                fechaCompletada: new Date(data.data.fechaCompletada)
            }
            
            // Añadir a la lista local
            rutinasCompletadas.value.unshift(nuevaRutinaCompletada)
            
            // Obtener el resumen actualizado inmediatamente
            try {
                await fetchResumen()
                console.log('Resumen actualizado después de completar rutina')
            } catch (resumenError) {
                console.error('Error al actualizar resumen después de completar rutina:', resumenError)
            }
            
            return nuevaRutinaCompletada
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            throw e
        } finally {
            loading.value = false
        }
    }

    // Actualizar una rutina completada
    async function updateRutinaCompletada(id: number, datos: RutinaCompletadaUpdate) {
        loading.value = true
        error.value = null
        try {
            const authStore = useAuthStore()
            if (!authStore.token) {
                throw new Error('No autorizado')
            }

            const response = await fetch(`${API_URL}/RutinaCompletada/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authStore.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Error al actualizar rutina completada')
            }

            const data: ApiResponse<RutinaCompletada> = await response.json()
            
            if (!data.success) {
                throw new Error(data.message || 'Error al actualizar rutina completada')
            }

            // Convertir fecha de string a Date
            const rutinaActualizada: RutinaCompletada = {
                ...data.data,
                fechaCompletada: new Date(data.data.fechaCompletada)
            }
            
            // Actualizar en la lista local
            const index = rutinasCompletadas.value.findIndex(rc => rc.rutinaCompletadaID === id)
            if (index !== -1) {
                rutinasCompletadas.value[index] = rutinaActualizada
            }
            
            // Actualizar resumen
            await fetchResumen()
            
            return rutinaActualizada
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            throw e
        } finally {
            loading.value = false
        }
    }

    // Eliminar una rutina completada
    async function deleteRutinaCompletada(id: number) {
        loading.value = true
        error.value = null
        try {
            const authStore = useAuthStore()
            if (!authStore.token) {
                throw new Error('No autorizado')
            }

            const response = await fetch(`${API_URL}/RutinaCompletada/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authStore.token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Error al eliminar rutina completada')
            }

            const data: ApiResponse<boolean> = await response.json()
            
            if (!data.success) {
                throw new Error(data.message || 'Error al eliminar rutina completada')
            }

            // Eliminar de la lista local
            rutinasCompletadas.value = rutinasCompletadas.value.filter(rc => rc.rutinaCompletadaID !== id)
            
            // Actualizar resumen
            await fetchResumen()
            
            return true
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            throw e
        } finally {
            loading.value = false
        }
    }

    return {
        rutinasCompletadas,
        resumen,
        loading,
        error,
        fetchRutinasCompletadas,
        getRutinaCompletadaById,
        getRutinasCompletadasByEntrenamiento,
        fetchResumen,
        completarRutina,
        updateRutinaCompletada,
        deleteRutinaCompletada
    }
})