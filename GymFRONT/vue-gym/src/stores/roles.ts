// src/stores/roles.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Role } from '@/types/Role';
import { useRutinasCompletadasStore } from './rutinasCompletadas';
import { useAuthStore } from './auth';

export const useRolesStore = defineStore('roles', () => {
  // Lista de roles disponibles
  const roles = ref<Role[]>([
    {
      id: 1,
      nombre: 'Principiante',
      descripcion: 'Estás empezando tu camino fitness. ¡El primer paso es el más importante!',
      icono: 'mdi-run',
      color: '#9E9E9E', // Gris
      diasPorSemanaMinimo: 0,
      diasPorSemanaMaximo: 1
    },
    {
      id: 2,
      nombre: 'Constante',
      descripcion: 'Empiezas a crear un hábito saludable entrenando regularmente.',
      icono: 'mdi-trending-up',
      color: '#8BC34A', // Verde claro
      diasPorSemanaMinimo: 2,
      diasPorSemanaMaximo: 2
    },
    {
      id: 3,
      nombre: 'Comprometido',
      descripcion: 'Tu compromiso con el entrenamiento es evidente. ¡Sigue así!',
      icono: 'mdi-arm-flex',
      color: '#4CAF50', // Verde
      diasPorSemanaMinimo: 3,
      diasPorSemanaMaximo: 3
    },
    {
      id: 4,
      nombre: 'Dedicado',
      descripcion: 'Entrenas más de la mitad de la semana. ¡Tu dedicación es admirable!',
      icono: 'mdi-weight-lifter',
      color: '#2196F3', // Azul
      diasPorSemanaMinimo: 4,
      diasPorSemanaMaximo: 4
    },
    {
      id: 5,
      nombre: 'Disciplinado',
      descripcion: '5 días a la semana. ¡Tu disciplina está construyendo resultados increíbles!',
      icono: 'mdi-medal',
      color: '#FF9800', // Naranja
      diasPorSemanaMinimo: 5,
      diasPorSemanaMaximo: 5
    },
    {
      id: 6,
      nombre: 'Atleta',
      descripcion: 'Entrenas casi todos los días. ¡Eres un verdadero atleta!',
      icono: 'mdi-trophy',
      color: '#F44336', // Rojo
      diasPorSemanaMinimo: 6,
      diasPorSemanaMaximo: 6
    },
    {
      id: 7,
      nombre: 'Élite',
      descripcion: '¡Entrenas todos los días! Tu dedicación te coloca en la élite fitness.',
      icono: 'mdi-crown',
      color: '#E91E63', // Rosa
      diasPorSemanaMinimo: 7,
      diasPorSemanaMaximo: 7
    }
  ]);

  const currentRole = ref<Role | null>(null);
  const userCurrentRole = ref<number | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Obtener el rol actual del usuario
  const getUserRole = async () => {
    try {
      loading.value = true;
      error.value = null;
      
      const rutinasStore = useRutinasCompletadasStore();
      const authStore = useAuthStore();
      
      if (!authStore.isAuthenticated) {
        return null;
      }
      
      // Cargar el resumen de rutinas
      await rutinasStore.fetchResumen();
      const resumen = rutinasStore.resumen;
      
      if (!resumen) {
        userCurrentRole.value = 1; // Principiante por defecto
        currentRole.value = roles.value.find(r => r.id === 1) || null;
        return currentRole.value;
      }
      
      // Calcular promedio de entrenamientos por semana
      const entrenasPorSemana = resumen.rutinasUltimaSemana || 0;
      
      // Determinar el rol basado en entrenamientos por semana
      let newRoleId = 1; // Valor por defecto
      
      for (const role of roles.value) {
        if (entrenasPorSemana >= role.diasPorSemanaMinimo && 
            entrenasPorSemana <= role.diasPorSemanaMaximo) {
          newRoleId = role.id;
          break;
        }
      }
      
      // Si entrena todos los días, asignar el rol élite
      if (entrenasPorSemana >= 7) {
        newRoleId = 7;
      }
      
      userCurrentRole.value = newRoleId;
      currentRole.value = roles.value.find(r => r.id === newRoleId) || null;
      
      return currentRole.value;
      
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error desconocido';
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Obtener todos los roles
  const getAllRoles = () => {
    return roles.value;
  };

  // Obtener un rol por ID
  const getRoleById = (id: number) => {
    return roles.value.find(r => r.id === id) || null;
  };

  // Calcular el progreso hacia el siguiente rol
  const progressToNextRole = computed(() => {
    if (!currentRole.value || !userCurrentRole.value) return 0;
    
    // Si ya es élite, el progreso está completo
    if (userCurrentRole.value === 7) return 100;
    
    const rutinasStore = useRutinasCompletadasStore();
    if (!rutinasStore.resumen) return 0;
    
    const entrenasPorSemana = rutinasStore.resumen.rutinasUltimaSemana || 0;
    const currentRoleObj = getRoleById(userCurrentRole.value);
    
    if (!currentRoleObj) return 0;
    
    // Si está en el límite superior de su rol actual, está al 100% de progreso
    if (entrenasPorSemana >= currentRoleObj.diasPorSemanaMaximo) return 100;
    
    // Calcular el progreso dentro del rango del rol actual
    const rangoRol = currentRoleObj.diasPorSemanaMaximo - currentRoleObj.diasPorSemanaMinimo;
    if (rangoRol === 0) return 100; // Si el rango es 0, está completo
    
    const progresoActual = entrenasPorSemana - currentRoleObj.diasPorSemanaMinimo;
    return Math.min(100, Math.max(0, (progresoActual / rangoRol) * 100));
  });

  // Calcular cuántos días faltan para el siguiente rol
  const daysToNextRole = computed(() => {
    if (!currentRole.value || !userCurrentRole.value) return 0;
    
    // Si ya es élite, no hay siguiente rol
    if (userCurrentRole.value === 7) return 0;
    
    const rutinasStore = useRutinasCompletadasStore();
    if (!rutinasStore.resumen) return 0;
    
    const entrenasPorSemana = rutinasStore.resumen.rutinasUltimaSemana || 0;
    const nextRoleId = userCurrentRole.value + 1;
    const nextRoleObj = getRoleById(nextRoleId);
    
    if (!nextRoleObj) return 0;
    
    return Math.max(0, nextRoleObj.diasPorSemanaMinimo - entrenasPorSemana);
  });

  return {
    roles,
    currentRole,
    userCurrentRole,
    loading,
    error,
    getUserRole,
    getAllRoles,
    getRoleById,
    progressToNextRole,
    daysToNextRole
  };
});