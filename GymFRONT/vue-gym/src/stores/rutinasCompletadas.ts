// src/stores/rutinasCompletadas.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RutinaCompletada, RutinaCompletadaCreate, RutinaCompletadaUpdate, ResumenRutinas } from '@/types/RutinaCompletada'
import type { ApiResponse } from '@/types/ApiResponse'
import { useAuthStore } from './auth'

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7087'

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
                throw new Error('Error al cargar las rutinas completadas')
            }

            const data: ApiResponse<RutinaCompletada[]> = await response.json()
            
            if (!data.success) {
                throw new Error(data.message || 'Error al cargar las rutinas completadas')
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
                throw new Error('Error al cargar la rutina completada')
            }

            const data: ApiResponse<RutinaCompletada> = await response.json()
            
            if (!data.success) {
                throw new Error(data.message || 'Error al cargar la rutina completada')
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
                throw new Error('Error al cargar las rutinas completadas')
            }

            const data: ApiResponse<RutinaCompletada[]> = await response.json()
            
            if (!data.success) {
                throw new Error(data.message || 'Error al cargar las rutinas completadas')
            }

            // Convertir fechas de string a Date
            const rutinasEntrenamiento = data.data.map(rc => ({
                ...rc,
                fechaCompletada: new Date(rc.fechaCompletada)
            }))
            
            return rutinasEntrenamiento
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            throw e
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
                throw new Error('Error al cargar el resumen')
            }

            const data: ApiResponse<ResumenRutinas> = await response.json()
            
            if (!data.success) {
                throw new Error(data.message || 'Error al cargar el resumen')
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

            const response = await fetch(`${API_URL}/RutinaCompletada`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authStore.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(rutinaCompletada)
            })

            if (!response.ok) {
                throw new Error('Error al marcar la rutina como completada')
            }

            const data: ApiResponse<RutinaCompletada> = await response.json()
            
            if (!data.success) {
                throw new Error(data.message || 'Error al marcar la rutina como completada')
            }

            // Convertir fecha de string a Date
            const nuevaRutinaCompletada: RutinaCompletada = {
                ...data.data,
                fechaCompletada: new Date(data.data.fechaCompletada)
            }
            
            // Añadir a la lista local
            rutinasCompletadas.value.unshift(nuevaRutinaCompletada)
            
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
                throw new Error('Error al actualizar la rutina completada')
            }

            const data: ApiResponse<RutinaCompletada> = await response.json()
            
            if (!data.success) {
                throw new Error(data.message || 'Error al actualizar la rutina completada')
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
                throw new Error('Error al eliminar la rutina completada')
            }

            const data: ApiResponse<boolean> = await response.json()
            
            if (!data.success) {
                throw new Error(data.message || 'Error al eliminar la rutina completada')
            }

            // Eliminar de la lista local
            rutinasCompletadas.value = rutinasCompletadas.value.filter(rc => rc.rutinaCompletadaID !== id)
            
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