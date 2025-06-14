// src/stores/admin.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7087'

export interface AdminUser {
  usuarioID: number
  nombre: string
  apellido: string
  email: string
  fechaRegistro: Date
  estaActivo: boolean
  esAdmin: boolean
  edad?: number
  peso?: number
  altura?: number
  fotoPerfilURL?: string
}

export interface AdminWorkout {
  entrenamientoID: number
  titulo: string
  descripcion: string
  duracionMinutos: number
  dificultad: string
  imagenURL?: string
  fechaCreacion: Date
  publico: boolean
  autorID?: number
}

export interface AdminExercise {
  ejercicioID: number
  nombre: string
  descripcion?: string
  grupoMuscular?: string
  imagenURL?: string
  videoURL?: string
  equipamientoNecesario: boolean
}

export interface AdminStats {
  totalUsuarios: number
  usuariosActivos: number
  totalAdministradores: number
  totalEjercicios: number
  totalEntrenamientos: number
  entrenamientosPublicos: number
  usuariosRegistradosHoy: number
  usuariosRegistradosEsteMes: number
}

export const useAdminStore = defineStore('admin', () => {
  const authStore = useAuthStore()
  
  // State
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Users
  const users = ref<AdminUser[]>([])
  const userLoading = ref(false)
  
  // Workouts
  const workouts = ref<AdminWorkout[]>([])
  const workoutLoading = ref(false)
  
  // Exercises
  const exercises = ref<AdminExercise[]>([])
  const exerciseLoading = ref(false)
  
  // Stats
  const stats = ref<AdminStats | null>(null)
  const statsLoading = ref(false)

  // Helper function to get headers for JSON requests
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authStore.token}`
  })

  // Helper function to get headers for FormData requests (no Content-Type)
  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${authStore.token}`
  })

  // ============ STATS ============
  async function fetchStats() {
    statsLoading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_URL}/admin/dashboard`, {
        headers: getHeaders()
      })
      
      if (!response.ok) {
        throw new Error('Error al cargar estadísticas')
      }
      
      const data = await response.json()
      stats.value = data.data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error desconocido'
      throw e
    } finally {
      statsLoading.value = false
    }
  }

  // ============ USERS MANAGEMENT ============
  async function fetchUsers() {
    userLoading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_URL}/admin/usuarios`, {
        headers: getHeaders()
      })
      
      if (!response.ok) {
        throw new Error('Error al cargar usuarios')
      }
      
      const data = await response.json()
      users.value = data.data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error desconocido'
      throw e
    } finally {
      userLoading.value = false
    }
  }

  async function createUser(userData: {
    nombre: string
    apellido: string
    email: string
    password: string
    esAdmin?: boolean
    estaActivo?: boolean
    edad?: number
    peso?: number
    altura?: number
  }) {
    loading.value = true
    error.value = null
    try {
      console.log('🔥 createUser - Creando usuario con datos:', userData)

      const response = await fetch(`${API_URL}/admin/usuarios`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData)
      })
      
      console.log('🔥 createUser - Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ createUser - Error del servidor:', errorData)
        throw new Error(errorData.message || 'Error al crear usuario')
      }
      
      const result = await response.json()
      console.log('✅ createUser - Usuario creado exitosamente:', result)
      
      await fetchUsers() // Refresh list
      return true
    } catch (e) {
      console.error('❌ createUser - Error en catch:', e)
      error.value = e instanceof Error ? e.message : 'Error desconocido'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateUser(id: number, userData: Partial<AdminUser>) {
    loading.value = true
    error.value = null
    try {
      console.log('🔥 updateUser - Iniciando actualización:', {
        id,
        userData,
        url: `${API_URL}/admin/usuarios/${id}`,
        headers: getHeaders(),
        userDataStringified: JSON.stringify(userData)
      })

      const response = await fetch(`${API_URL}/admin/usuarios/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(userData)
      })
      
      console.log('🔥 updateUser - Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      const responseText = await response.text()
      console.log('🔥 updateUser - Texto de respuesta:', responseText)

      if (!response.ok) {
        let errorData
        try {
          errorData = JSON.parse(responseText)
        } catch {
          errorData = { message: responseText }
        }
        console.error('❌ updateUser - Error del servidor:', errorData)
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }
      
      let result
      try {
        result = JSON.parse(responseText)
      } catch {
        result = { success: true, data: responseText }
      }
      console.log('✅ updateUser - Respuesta exitosa:', result)
      
      // Refrescar la lista de usuarios
      console.log('🔄 updateUser - Refrescando lista de usuarios...')
      await fetchUsers()
      
      // Verificar si el usuario se actualizó correctamente
      const updatedUser = users.value.find(u => u.usuarioID === id)
      console.log('🔍 updateUser - Usuario actualizado en la lista:', updatedUser)
      
      if (updatedUser && userData.esAdmin !== undefined) {
        console.log('🔍 updateUser - Verificación esAdmin:', {
          valorEnviado: userData.esAdmin,
          valorActual: updatedUser.esAdmin,
          coincide: userData.esAdmin === updatedUser.esAdmin
        })
      }
      
      return true
    } catch (e) {
      console.error('❌ updateUser - Error en catch:', e)
      error.value = e instanceof Error ? e.message : 'Error desconocido'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteUser(id: number) {
    loading.value = true
    error.value = null
    try {
      console.log('🔥 deleteUser - Eliminando usuario:', id)

      const response = await fetch(`${API_URL}/admin/usuarios/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      })
      
      console.log('🔥 deleteUser - Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ deleteUser - Error del servidor:', errorData)
        throw new Error(errorData.message || 'Error al eliminar usuario')
      }
      
      const result = await response.json()
      console.log('✅ deleteUser - Usuario eliminado exitosamente:', result)
      
      await fetchUsers() // Refresh list
      return true
    } catch (e) {
      console.error('❌ deleteUser - Error en catch:', e)
      error.value = e instanceof Error ? e.message : 'Error desconocido'
      throw e
    } finally {
      loading.value = false
    }
  }

  // ============ WORKOUTS MANAGEMENT ============
  async function fetchWorkouts() {
    workoutLoading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_URL}/admin/entrenamientos`, {
        headers: getHeaders()
      })
      
      if (!response.ok) {
        throw new Error('Error al cargar entrenamientos')
      }
      
      const data = await response.json()
      workouts.value = data.data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error desconocido'
      throw e
    } finally {
      workoutLoading.value = false
    }
  }

  async function createWorkout(formData: FormData) {
    loading.value = true
    error.value = null
    try {
      console.log('🔥 Creando entrenamiento...')
      
      const response = await fetch(`${API_URL}/admin/entrenamientos`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Error del servidor:', errorData)
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('✅ Entrenamiento creado exitosamente:', result)
      
      await fetchWorkouts()
      return true
    } catch (e) {
      console.error('❌ Error en createWorkout:', e)
      error.value = e instanceof Error ? e.message : 'Error desconocido'
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateWorkout(id: number, formData: FormData) {
    loading.value = true
    error.value = null
    try {
      console.log('🔥 Actualizando entrenamiento ID:', id)
      
      const response = await fetch(`${API_URL}/admin/entrenamientos/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: formData
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Error del servidor:', errorData)
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('✅ Entrenamiento actualizado exitosamente:', result)
      
      await fetchWorkouts()
      return true
    } catch (e) {
      console.error('❌ Error en updateWorkout:', e)
      error.value = e instanceof Error ? e.message : 'Error desconocido'
      return false
    } finally {
      loading.value = false
    }
  }

  async function deleteWorkout(id: number) {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_URL}/admin/entrenamientos/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al eliminar entrenamiento')
      }
      
      await fetchWorkouts()
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error desconocido'
      throw e
    } finally {
      loading.value = false
    }
  }

  // ============ EXERCISES MANAGEMENT ============
  async function fetchExercises() {
    exerciseLoading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_URL}/admin/ejercicios`, {
        headers: getHeaders()
      })
      
      if (!response.ok) {
        throw new Error('Error al cargar ejercicios')
      }
      
      const data = await response.json()
      exercises.value = data.data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error desconocido'
      throw e
    } finally {
      exerciseLoading.value = false
    }
  }

  async function createExercise(exerciseData: {
    nombre: string
    descripcion?: string
    grupoMuscular?: string
    imagenURL?: string
    videoURL?: string
    equipamientoNecesario: boolean
  }) {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_URL}/admin/ejercicios`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(exerciseData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al crear ejercicio')
      }
      
      await fetchExercises()
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error desconocido'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateExercise(id: number, exerciseData: Partial<AdminExercise>) {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_URL}/admin/ejercicios/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(exerciseData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al actualizar ejercicio')
      }
      
      await fetchExercises()
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error desconocido'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteExercise(id: number) {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_URL}/admin/ejercicios/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al eliminar ejercicio')
      }
      
      await fetchExercises()
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error desconocido'
      throw e
    } finally {
      loading.value = false
    }
  }

  // ============ UTILITY FUNCTIONS ============
  
  function validateWorkoutFormData(formData: FormData): boolean {
    const titulo = formData.get('Titulo')
    const dificultad = formData.get('Dificultad')
    const duracionMinutos = formData.get('DuracionMinutos')

    if (!titulo || titulo.toString().trim().length === 0) {
      throw new Error('El título es requerido')
    }

    if (!dificultad || !['Fácil', 'Media', 'Difícil'].includes(dificultad.toString())) {
      throw new Error('La dificultad debe ser Fácil, Media o Difícil')
    }

    const duracion = parseInt(duracionMinutos?.toString() || '0')
    if (!duracion || duracion < 5 || duracion > 300) {
      throw new Error('La duración debe estar entre 5 y 300 minutos')
    }

    return true
  }

  async function createWorkoutValidated(formData: FormData) {
    loading.value = true
    error.value = null
    
    try {
      validateWorkoutFormData(formData)
      
      console.log('🔥 Creando entrenamiento validado con datos:', {
        titulo: formData.get('Titulo'),
        dificultad: formData.get('Dificultad'),
        duracion: formData.get('DuracionMinutos'),
        publico: formData.get('Publico')
      })
      
      const response = await fetch(`${API_URL}/admin/entrenamientos`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al crear entrenamiento')
      }
      
      await fetchWorkouts()
      return true
      
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Error desconocido'
      error.value = errorMsg
      console.error('❌ Error en createWorkoutValidated:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // ============ RETURN STORE ============
  return {
    // State
    loading,
    error,
    
    // Users
    users,
    userLoading,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    
    // Workouts
    workouts,
    workoutLoading,
    fetchWorkouts,
    createWorkout,
    createWorkoutValidated,
    updateWorkout,
    deleteWorkout,
    
    // Exercises
    exercises,
    exerciseLoading,
    fetchExercises,
    createExercise,
    updateExercise,
    deleteExercise,
    
    // Stats
    stats,
    statsLoading,
    fetchStats,
    
    // Utility
    validateWorkoutFormData
  }
})