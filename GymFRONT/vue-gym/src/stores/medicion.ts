// src/stores/mediciones.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Medicion, MedicionCreateDTO, MedicionUpdateDTO, MedicionResumen } from '@/types/Medicion'
import type { ApiResponse } from '@/types/ApiResponse'
import { useAuthStore } from './auth'

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7087/api'

export const useMedicionStore = defineStore('mediciones', () => {
    const mediciones = ref<Medicion[]>([])
    const medicionesResumen = ref<MedicionResumen[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    // Obtener todas las mediciones del usuario
    async function fetchMediciones() {
        loading.value = true
        error.value = null
        try {
            const authStore = useAuthStore()
            if (!authStore.token) {
                throw new Error('No autorizado')
            }

            const response = await fetch(`${API_URL}/Medicion`, {
                headers: {
                    'Authorization': `Bearer ${authStore.token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Error al cargar mediciones')
            }

            const data: ApiResponse<Medicion[]> = await response.json()
            
            if (data.success && data.data) {
                // Convertir strings de fecha a objetos Date
                mediciones.value = data.data.map(m => ({
                    ...m,
                    fecha: new Date(m.fecha)
                }))
                return mediciones.value
            } else {
                throw new Error(data.message || 'Error al cargar mediciones')
            }
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            mediciones.value = []
            throw e
        } finally {
            loading.value = false
        }
    }

    // Obtener resumen de mediciones para gráficos
    async function fetchMedicionesResumen() {
        loading.value = true
        error.value = null
        try {
            const authStore = useAuthStore()
            if (!authStore.token) {
                throw new Error('No autorizado')
            }

            const response = await fetch(`${API_URL}/Medicion/Resumen`, {
                headers: {
                    'Authorization': `Bearer ${authStore.token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Error al cargar resumen de mediciones')
            }

            const data: ApiResponse<MedicionResumen[]> = await response.json()
            
            if (data.success && data.data) {
                medicionesResumen.value = data.data
                return medicionesResumen.value
            } else {
                throw new Error(data.message || 'Error al cargar resumen de mediciones')
            }
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            medicionesResumen.value = []
            throw e
        } finally {
            loading.value = false
        }
    }

    // Obtener una medición por ID
    async function getMedicionById(id: number) {
        loading.value = true
        error.value = null
        try {
            const authStore = useAuthStore()
            if (!authStore.token) {
                throw new Error('No autorizado')
            }

            const response = await fetch(`${API_URL}/Medicion/${id}`, {
                headers: {
                    'Authorization': `Bearer ${authStore.token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Error al cargar medición')
            }

            const data: ApiResponse<Medicion> = await response.json()
            
            if (data.success && data.data) {
                const medicion = {
                    ...data.data,
                    fecha: new Date(data.data.fecha)
                }
                return medicion
            } else {
                throw new Error(data.message || 'Error al cargar medición')
            }
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            throw e
        } finally {
            loading.value = false
        }
    }

    // Crear una nueva medición
    async function createMedicion(medicion: MedicionCreateDTO) {
        loading.value = true
        error.value = null
        try {
            const authStore = useAuthStore()
            if (!authStore.token || !authStore.user) {
                throw new Error('No autorizado')
            }

            // Asegurar que el usuarioID corresponde al usuario autenticado
            medicion.usuarioID = authStore.user.usuarioID

            const response = await fetch(`${API_URL}/Medicion`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authStore.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(medicion)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Error al crear medición')
            }

            const data: ApiResponse<Medicion> = await response.json()
            
            if (data.success && data.data) {
                const newMedicion = {
                    ...data.data,
                    fecha: new Date(data.data.fecha)
                }
                // Actualizar la lista local
                mediciones.value.unshift(newMedicion)
                return newMedicion
            } else {
                throw new Error(data.message || 'Error al crear medición')
            }
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            throw e
        } finally {
            loading.value = false
        }
    }

    // Actualizar una medición existente
    async function updateMedicion(id: number, medicion: MedicionUpdateDTO) {
        loading.value = true
        error.value = null
        try {
            const authStore = useAuthStore()
            if (!authStore.token) {
                throw new Error('No autorizado')
            }

            const response = await fetch(`${API_URL}/Medicion/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authStore.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(medicion)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Error al actualizar medición')
            }

            const data: ApiResponse<Medicion> = await response.json()
            
            if (data.success && data.data) {
                const updatedMedicion = {
                    ...data.data,
                    fecha: new Date(data.data.fecha)
                }
                
                // Actualizar la medición en la lista local
                const index = mediciones.value.findIndex(m => m.medicionID === id)
                if (index !== -1) {
                    mediciones.value[index] = updatedMedicion
                }
                
                return updatedMedicion
            } else {
                throw new Error(data.message || 'Error al actualizar medición')
            }
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            throw e
        } finally {
            loading.value = false
        }
    }

    // Eliminar una medición
    async function deleteMedicion(id: number) {
        loading.value = true
        error.value = null
        try {
            const authStore = useAuthStore()
            if (!authStore.token) {
                throw new Error('No autorizado')
            }

            const response = await fetch(`${API_URL}/Medicion/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authStore.token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Error al eliminar medición')
            }

            const data: ApiResponse<boolean> = await response.json()
            
            if (data.success) {
                // Eliminar la medición de la lista local
                mediciones.value = mediciones.value.filter(m => m.medicionID !== id)
                return true
            } else {
                throw new Error(data.message || 'Error al eliminar medición')
            }
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            throw e
        } finally {
            loading.value = false
        }
    }

    return {
        mediciones,
        medicionesResumen,
        loading,
        error,
        fetchMediciones,
        fetchMedicionesResumen,
        getMedicionById,
        createMedicion,
        updateMedicion,
        deleteMedicion
    }
})