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

            // Siempre incluir el token de autenticación si está disponible
            // para que el backend pueda identificar al usuario y filtrar correctamente
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

    async function getWorkoutById(id: number) {
        loading.value = true
        error.value = null
        try {
            const authStore = useAuthStore()
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            }

            // Importante incluir el token para acceder a entrenamientos privados
            if (authStore.token) {
                headers['Authorization'] = `Bearer ${authStore.token}`
            }

            // Corregimos la URL para que apunte al endpoint correcto
            const response = await fetch(`${API_URL}/Entrenamiento/${id}`, { headers })
            
            // Manejar errores de permisos (403 Forbidden)
            if (response.status === 403) {
                throw new Error('No tienes permiso para ver este entrenamiento')
            }
            
            if (!response.ok) {
                throw new Error('Error al cargar el entrenamiento')
            }

            const text = await response.text()
            if (!text) {
                throw new Error('La API devolvió una respuesta vacía')
            }

            const data = JSON.parse(text)
            return data
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            throw e
        } finally {
            loading.value = false
        }
    }

    async function createWorkout(workout: CreateWorkoutDTO) {
        loading.value = true;
        error.value = null;
        try {
            const authStore = useAuthStore();
            if (!authStore.token) throw new Error('No autorizado');
            
            // 1. Extraer los ejercicios del DTO
            const ejercicios = workout.ejercicios;
            
            // 2. Crear un nuevo DTO sin los ejercicios para el entrenamiento base
            const workoutBase = {
                titulo: workout.titulo,
                descripcion: workout.descripcion,
                duracionMinutos: workout.duracionMinutos,
                dificultad: workout.dificultad,
                imagenURL: workout.imagenURL,
                publico: workout.publico,
                autorID: authStore.user?.usuarioID
            };
    
            console.log('Creando entrenamiento base:', workoutBase);
            const response = await fetch(`${API_URL}/Entrenamiento`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authStore.token}`
                },
                body: JSON.stringify(workoutBase)
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error creando entrenamiento');
            }
    
            const data = await response.json();
            console.log('Entrenamiento creado - respuesta completa:', data);
            
            // 3. Como workaround, obtener el último entrenamiento creado por este usuario
            console.log('Buscando el entrenamiento recién creado...');
            
            // Esperar un momento para asegurar que la BD ha procesado la inserción
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Obtener todos los entrenamientos y filtrar por usuario
            const allWorkoutsResponse = await fetch(`${API_URL}/Entrenamiento`, {
                headers: {
                    'Authorization': `Bearer ${authStore.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!allWorkoutsResponse.ok) {
                throw new Error('Error al recuperar entrenamientos');
            }
            
            const allWorkouts = await allWorkoutsResponse.json();
            console.log('Todos los entrenamientos:', allWorkouts);
            
            // Filtrar por usuario y ordenar por fecha de creación descendente
            const userWorkouts = allWorkouts
                .filter(w => w.autorID === authStore.user?.usuarioID)
                .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
            
            console.log('Entrenamientos del usuario ordenados:', userWorkouts);
            
            // Obtener el entrenamiento más reciente que coincida con el título
            const recentWorkout = userWorkouts.find(w => w.titulo === workout.titulo);
            
            if (!recentWorkout || !recentWorkout.entrenamientoID) {
                throw new Error('No se pudo encontrar el ID del entrenamiento recién creado');
            }
            
            const entrenamientoID = recentWorkout.entrenamientoID;
            console.log(`Entrenamiento encontrado con ID: ${entrenamientoID}`);
            
            // 4. Asociar los ejercicios al entrenamiento
            if (ejercicios && ejercicios.length > 0) {
                console.log(`Asociando ${ejercicios.length} ejercicios al entrenamiento ID ${entrenamientoID}...`);
                
                // Asociar cada ejercicio al entrenamiento
                for (const ejercicio of ejercicios) {
                    console.log(`Asociando ejercicio ID ${ejercicio.ejercicioID} al entrenamiento ID ${entrenamientoID}`);
                    
                    const ejercicioData = {
                        entrenamientoID: entrenamientoID,
                        ejercicioID: ejercicio.ejercicioID,
                        series: ejercicio.series,
                        repeticiones: ejercicio.repeticiones,
                        descansoSegundos: ejercicio.descansoSegundos,
                        notas: ejercicio.notas || ""
                    };
                    
                    const ejercicioResponse = await fetch(`${API_URL}/EntrenamientoEjercicio`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authStore.token}`
                        },
                        body: JSON.stringify(ejercicioData)
                    });
                    
                    if (!ejercicioResponse.ok) {
                        console.error(`Error asociando ejercicio ID ${ejercicio.ejercicioID}:`, 
                                      await ejercicioResponse.text());
                    } else {
                        console.log(`✅ Ejercicio ID ${ejercicio.ejercicioID} asociado correctamente`);
                    }
                }
            }
            
            // 5. Actualizar la lista de entrenamientos
            if (recentWorkout) {
                workouts.value.push(recentWorkout);
                return recentWorkout;
            }
            
            return null;
        } catch (e) {
            console.error('Error en createWorkout:', e);
            error.value = e instanceof Error ? e.message : 'Error desconocido';
            throw e;
        } finally {
            loading.value = false;
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
            if (!text) {
                console.warn("⚠️ La API devolvió una respuesta vacía.");
                return [];
            }

            const data: ApiResponse<EntrenamientoEjercicio[]> = JSON.parse(text);
            console.log("🟢 Respuesta de la API:", data);

            const exercises = data.data ?? data; // Si data.data no existe, usa data directamente
            console.log("🟢 Ejercicios procesados:", exercises);

            if (!exercises || exercises.length === 0) {
                console.warn("⚠️ No se encontraron ejercicios para este entrenamiento.");
                return [];
            }

            return exercises;
        } catch (e) {
            console.error("🔴 Error en getWorkoutExercises:", e);
            error.value = e instanceof Error ? e.message : 'Error desconocido';
            throw e;
        } finally {
            loading.value = false;
        }
    }

    async function deleteWorkout(id: number) {
        loading.value = true;
        error.value = null;
        try {
            const authStore = useAuthStore();
            if (!authStore.token) throw new Error('No autorizado');
            
            const response = await fetch(`${API_URL}/Entrenamiento/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authStore.token}`
                }
            });
            
            if (response.status === 403) {
                throw new Error('No tienes permiso para eliminar este entrenamiento');
            }
            
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Error eliminando entrenamiento');
            }
            
            // Remove the workout from the local state
            workouts.value = workouts.value.filter(w => w.entrenamientoID !== id);
            return true;
        } catch (e) {
            console.error('Error en deleteWorkout:', e);
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