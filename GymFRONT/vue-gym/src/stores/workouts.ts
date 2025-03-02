import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Workout, CreateWorkoutDTO, EntrenamientoEjercicio } from '@/types/Workout'
import type { ApiResponse } from '@/types/ApiResponse'
import { useAuthStore } from './auth'

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7087'

export const useWorkoutStore = defineStore('workouts', () => {
    const workouts = ref<Workout[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function fetchWorkouts() {
    loading.value = true;
    error.value = null;
    try {
        const authStore = useAuthStore();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        if (authStore.token) {
            headers['Authorization'] = `Bearer ${authStore.token}`;
        }

        const response = await fetch(`${API_URL}/Entrenamiento`, { headers });

        // Verificar si la respuesta está vacía o no es JSON
        const text = await response.text();
        if (!text) {
            throw new Error('La API devolvió una respuesta vacía');
        }

        const data: Workout[] = JSON.parse(text);

        if (!response.ok) {
            throw new Error('Error al cargar los entrenamientos');
        }

        workouts.value = data;
        return data;
    } catch (e) {
        error.value = e instanceof Error ? e.message : 'Error desconocido';
        workouts.value = [];
        throw e;
    } finally {
        loading.value = false;
    }
}
async function addExerciseToWorkout(workoutId: number, ejercicioId: number, series: number, repeticiones: number, descansoSegundos: number, notas: string | null) {
    loading.value = true;
    error.value = null;

    try {
        const authStore = useAuthStore();
        if (!authStore.token) throw new Error('No autorizado');

        const payload = {
            entrenamientoID: workoutId,
            ejercicioID: ejercicioId,
            series,
            repeticiones,
            descansoSegundos,
            notas
        };

        console.log("📤 Enviando ejercicio al backend:", payload);

        const response = await fetch(`${API_URL}/EntrenamientoEjercicio`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al asignar ejercicio');
        }

        console.log("✅ Ejercicio asignado correctamente:", data);
        return data;
    } catch (e) {
        console.error("❌ Error en addExerciseToWorkout:", e);
        error.value = e instanceof Error ? e.message : 'Error desconocido';
        throw e;
    } finally {
        loading.value = false;
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

            const response = await fetch(`${API_URL}/api/Entrenamiento/${id}`, { headers })
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
            
            // Asegurarnos de incluir el autorID si existe un usuario autenticado
            const workoutWithAutor = {
                ...workout,
                autorID: authStore.user?.usuarioID
            } as CreateWorkoutDTO;

            const response = await fetch(`${API_URL}/Entrenamiento`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authStore.token}`
                },
                body: JSON.stringify(workoutWithAutor)
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

    async function getWorkoutExercises(workoutId: number) {
        loading.value = true;
        error.value = null;
        try {
            const authStore = useAuthStore();
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            };
    
            if (authStore.token) {
                headers['Authorization'] = `Bearer ${authStore.token}`;
            }
    
            console.log(`🟡 Solicitando ejercicios para el entrenamiento ID: ${workoutId}`);
    
            const response = await fetch(`${API_URL}/EntrenamientoEjercicio/${workoutId}`, { headers });
    
            if (!response.ok) {
                throw new Error(`❌ Error al cargar ejercicios. Código: ${response.status}`);
            }
    
            const text = await response.text();
            if (!text || text.trim() === "") {
                console.warn("⚠️ La API devolvió una respuesta vacía.");
                return [];
            }
    
            const data = JSON.parse(text);
            console.log("🟢 Respuesta de la API:", data);
    
            if (!Array.isArray(data) || data.length === 0) {
                console.warn("⚠️ No se encontraron ejercicios para este entrenamiento.");
                return [];
            }
    
            return data;
        } catch (e) {
            console.error("🔴 Error en getWorkoutExercises:", e);
            error.value = e instanceof Error ? e.message : 'Error desconocido';
            throw e;
        } finally {
            loading.value = false;
        }
    }
    
    
    

    return {
        workouts,
        loading,
        error,
        fetchWorkouts,
        getWorkoutById,
        createWorkout,
        getWorkoutExercises,
        addExerciseToWorkout  // <-- Agregamos la nueva función aquí
    }
    
})