// src/stores/workouts.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Workout, CreateWorkoutDTO, EntrenamientoEjercicio } from '@/types/Workout'
import type { ApiResponse } from '@/types/ApiResponse'
import { useAuthStore } from './auth'

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7087/api'

export const useWorkoutStore = defineStore('workouts', () => {
    const workouts = ref<Workout[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    /**
     * Fetches all workouts from the API
     * @returns Promise with workouts array
     */
    async function fetchWorkouts() {
        loading.value = true;
        error.value = null;
        try {
            const authStore = useAuthStore();
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            };

            // Include auth token if available for proper filtering
            if (authStore.token) {
                headers['Authorization'] = `Bearer ${authStore.token}`;
            }

            const response = await fetch(`${API_URL}/Entrenamiento`, { headers });
            console.log('Fetch workouts response status:', response.status);

            // Handle empty response
            const text = await response.text();
            if (!text) {
                console.warn('API returned empty response');
                workouts.value = [];
                return [];
            }

            // Parse JSON response
            let data: Workout[];
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('Error parsing workouts JSON:', e);
                throw new Error('Error en el formato de respuesta del servidor');
            }

            if (!response.ok) {
                throw new Error('Error al cargar los entrenamientos');
            }

            console.log(`Fetched ${data.length} workouts`);
            workouts.value = data;
            return data;
        } catch (e) {
            console.error('Error in fetchWorkouts:', e);
            error.value = e instanceof Error ? e.message : 'Error desconocido';
            workouts.value = [];
            throw e;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Get a specific workout by ID
     * @param id Workout ID to fetch
     * @returns Promise with workout data
     */
    async function getWorkoutById(id: number) {
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

            console.log(`Fetching workout ID: ${id}`);
            const response = await fetch(`${API_URL}/Entrenamiento/${id}`, { headers });
            console.log('Fetch workout by ID response status:', response.status);
            
            // Handle permission errors
            if (response.status === 403) {
                throw new Error('No tienes permiso para ver este entrenamiento');
            }
            
            if (!response.ok) {
                throw new Error('Error al cargar el entrenamiento');
            }

            const text = await response.text();
            if (!text) {
                throw new Error('La API devolvió una respuesta vacía');
            }

            // Parse JSON response
            let data: Workout;
            try {
                data = JSON.parse(text);
                console.log('Workout data fetched:', data);
                return data;
            } catch (e) {
                console.error('Error parsing workout JSON:', e);
                throw new Error('Error en el formato de respuesta del servidor');
            }
        } catch (e) {
            console.error('Error in getWorkoutById:', e);
            error.value = e instanceof Error ? e.message : 'Error desconocido';
            throw e;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Create a new workout
     * @param workout Workout data to create
     * @returns Promise with created workout
     */
    async function createWorkout(workout: CreateWorkoutDTO) {
        loading.value = true;
        error.value = null;
        try {
            const authStore = useAuthStore();
            if (!authStore.token || !authStore.user) {
                throw new Error('No autorizado');
            }
            
            // 1. Create workout base data with defaults for optional fields
            const workoutBase = {
                titulo: workout.titulo,
                descripcion: workout.descripcion || "",
                duracionMinutos: workout.duracionMinutos,
                dificultad: workout.dificultad,
                imagenURL: workout.imagenURL || "",
                publico: workout.publico,
                autorID: authStore.user.usuarioID
            };
        
            console.log('Creating workout with data:', JSON.stringify(workoutBase));
            
            const response = await fetch(`${API_URL}/Entrenamiento`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authStore.token}`
                },
                body: JSON.stringify(workoutBase)
            });
        
            console.log('Create workout response status:', response.status);
            
            // Get response text for debugging
            const responseText = await response.text();
            console.log('Create workout response text:', responseText);
            
            // Handle error responses
            if (!response.ok) {
                let errorMessage = 'Error creando entrenamiento';
                try {
                    const errorData = JSON.parse(responseText);
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    if (responseText) errorMessage += ': ' + responseText;
                }
                throw new Error(errorMessage);
            }
            
            // Try to extract workout ID from response
            let workoutId: number | null = null;
            try {
                const data = JSON.parse(responseText);
                console.log('Created workout response data:', data);
                
                // Handle different response formats
                if (data.entrenamientoID) {
                    workoutId = data.entrenamientoID;
                } else if (data.id) {
                    workoutId = data.id;
                }
            } catch (e) {
                console.error('Error parsing workout response:', e);
            }
            
            // If we couldn't get workout ID from response, find the newest workout
            if (!workoutId) {
                console.log('No workout ID in response, searching for newest workout...');
                
                // Get all workouts to find the one we just created
                await fetchWorkouts();
                
                // Find workout by title and author ID
                const createdWorkout = workouts.value.find(w => 
                    w.autorID === authStore.user?.usuarioID && 
                    w.titulo === workout.titulo
                );
                
                if (createdWorkout) {
                    workoutId = createdWorkout.entrenamientoID;
                    console.log(`Found created workout with ID: ${workoutId}`);
                } else {
                    console.error('Could not find created workout in workouts list');
                }
            }
            
            // If we have workout ID and exercises to add, associate them
            if (workoutId && workout.ejercicios && workout.ejercicios.length > 0) {
                console.log(`Associating ${workout.ejercicios.length} exercises with workout ID ${workoutId}`);
                
                const exercisePromises = workout.ejercicios.map(async (ejercicio) => {
                    try {
                        const ejercicioData = {
                            entrenamientoID: workoutId,
                            ejercicioID: ejercicio.ejercicioID,
                            series: ejercicio.series,
                            repeticiones: ejercicio.repeticiones,
                            descansoSegundos: ejercicio.descansoSegundos,
                            notas: ejercicio.notas || ""
                        };
                        
                        console.log(`Associating exercise:`, ejercicioData);
                        
                        const ejercicioResponse = await fetch(`${API_URL}/EntrenamientoEjercicio`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${authStore.token}`
                            },
                            body: JSON.stringify(ejercicioData)
                        });
                        
                        if (!ejercicioResponse.ok) {
                            const errorText = await ejercicioResponse.text();
                            console.warn(`Error associating exercise ID ${ejercicio.ejercicioID}:`, errorText);
                        } else {
                            console.log(`✅ Exercise ID ${ejercicio.ejercicioID} associated successfully`);
                        }
                        
                        return ejercicioResponse.ok;
                    } catch (e) {
                        console.error(`Error associating exercise:`, e);
                        return false;
                    }
                });
                
                // Wait for all exercise associations to complete
                await Promise.allSettled(exercisePromises);
            }
            
            // Get the full workout data to return
            if (workoutId) {
                const createdWorkout = await getWorkoutById(workoutId);
                return createdWorkout;
            }
            
            // If we get here, we couldn't get the workout ID
            console.warn('Creating workout succeeded but could not get workout details');
            return null;
        } catch (e) {
            console.error('Error in createWorkout:', e);
            error.value = e instanceof Error ? e.message : 'Error desconocido';
            throw e;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Get exercises associated with a workout
     * @param workoutId Workout ID to get exercises for
     * @returns Promise with workout exercises data
     */
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

            console.log(`Fetching exercises for workout ID: ${workoutId}`);
            const response = await fetch(`${API_URL}/EntrenamientoEjercicio/${workoutId}`, { headers });
            console.log('Fetch workout exercises response status:', response.status);

            if (!response.ok) {
                throw new Error(`Error al cargar ejercicios. Código: ${response.status}`);
            }

            const text = await response.text();
            if (!text) {
                console.warn("API returned empty response for exercises");
                return [];
            }

            // Parse the JSON response carefully
            try {
                const data = JSON.parse(text);
                console.log("Workout exercises response:", data);
                
                // Handle both response formats (with data property or direct array)
                const exercises = data.data || data;
                
                if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
                    console.warn("No exercises found for this workout");
                    return [];
                }
                
                return exercises;
            } catch (e) {
                console.error("Error parsing exercises JSON:", e);
                throw new Error("Error al procesar la respuesta de ejercicios");
            }
        } catch (e) {
            console.error("Error in getWorkoutExercises:", e);
            error.value = e instanceof Error ? e.message : 'Error desconocido';
            throw e;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Delete a workout
     * @param id Workout ID to delete
     * @returns Promise with success status
     */
    async function deleteWorkout(id: number) {
        loading.value = true;
        error.value = null;
        try {
            const authStore = useAuthStore();
            if (!authStore.token) {
                throw new Error('No autorizado');
            }
            
            console.log(`Deleting workout ID: ${id}`);
            const response = await fetch(`${API_URL}/Entrenamiento/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authStore.token}`
                }
            });
            
            console.log('Delete workout response status:', response.status);
            
            if (response.status === 403) {
                throw new Error('No tienes permiso para eliminar este entrenamiento');
            }
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Error eliminando entrenamiento');
            }
            
            // Remove the workout from the local state
            workouts.value = workouts.value.filter(w => w.entrenamientoID !== id);
            console.log(`Workout ID ${id} deleted successfully`);
            return true;
        } catch (e) {
            console.error('Error in deleteWorkout:', e);
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
        deleteWorkout
    }
})