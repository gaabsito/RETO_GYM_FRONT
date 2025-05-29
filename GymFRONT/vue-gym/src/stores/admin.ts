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

// Interfaz actualizada con el nuevo campo
export interface AdminStats {
  totalUsuarios: number
  usuariosActivos: number
  totalAdministradores: number
  totalEjercicios: number
  totalEntrenamientos: number
  entrenamientosPublicos: number
  usuariosRegistradosHoy: number
  usuariosRegistradosEsteMes: number  // CAMPO AÑADIDO
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

  // Helper function to get headers
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authStore.token}`
  })

  // Stats - Endpoint correcto: /admin/dashboard
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

  // Users Management
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
      const response = await fetch(`${API_URL}/admin/usuarios`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al crear usuario')
      }
      
      await fetchUsers() // Refresh list
      return true
    } catch (e) {
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
      const response = await fetch(`${API_URL}/admin/usuarios/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(userData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al actualizar usuario')
      }
      
      await fetchUsers() // Refresh list
      return true
    } catch (e) {
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
      const response = await fetch(`${API_URL}/admin/usuarios/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al eliminar usuario')
      }
      
      await fetchUsers() // Refresh list
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error desconocido'
      throw e
    } finally {
      loading.value = false
    }
  }

  // Workouts Management
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

  async function createWorkout(workoutData: {
    titulo: string
    descripcion: string
    duracionMinutos: number
    dificultad: string
    imagenURL?: string
    publico: boolean
    autorID?: number
  }) {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_URL}/admin/entrenamientos`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(workoutData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al crear entrenamiento')
      }
      
      await fetchWorkouts() // Refresh list
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error desconocido'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateWorkout(id: number, workoutData: Partial<AdminWorkout>) {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_URL}/admin/entrenamientos/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(workoutData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al actualizar entrenamiento')
      }
      
      await fetchWorkouts() // Refresh list
      return true
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
      const response = await fetch(`${API_URL}/admin/entrenamientos/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al eliminar entrenamiento')
      }
      
      await fetchWorkouts() // Refresh list
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error desconocido'
      throw e
    } finally {
      loading.value = false
    }
  }

  // Exercises Management
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
      
      await fetchExercises() // Refresh list
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
      
      await fetchExercises() // Refresh list
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
      
      await fetchExercises() // Refresh list
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error desconocido'
      throw e
    } finally {
      loading.value = false
    }
  }

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
    fetchStats
  }
})