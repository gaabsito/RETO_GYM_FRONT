// src/stores/roles.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Role, UsuarioRol } from '@/types/Role';
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

  const currentRole = ref<UsuarioRol | null>(null);
  const userCurrentRole = ref<number | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Obtener el rol actual del usuario - con reintento
  const getUserRole = async (retryOnFailure = true) => {
    try {
      loading.value = true;
      error.value = null;
      
      const authStore = useAuthStore();
      
      if (!authStore.isAuthenticated) {
        return null;
      }
      
      // Corregimos la URL para evitar la duplicación de 'api'
      const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7087';
      const baseUrl = API_URL.endsWith('/api') ? API_URL : `${API_URL}`;
      const token = authStore.token;
      
      console.log('Obteniendo rol de usuario actual...');
      console.log('URL de la API:', `${baseUrl}/Rol/usuario`);
      
      // Realizar petición al backend para obtener el rol actual
      const response = await fetch(`${baseUrl}/Rol/usuario`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        // Añadimos cache: 'no-cache' para forzar una petición fresca cada vez
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        console.error('Error en la respuesta:', response.status, response.statusText);
        
        if (response.status === 404 && retryOnFailure) {
          // Si es 404, puede ser porque el usuario es nuevo o porque el rol aún no se ha calculado
          console.log('Rol no encontrado, esperando 1 segundo y reintentando...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          return getUserRole(false); // Reintentar una vez más sin más reintentos
        }
        throw new Error(`Error al obtener información del rol: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error al obtener información del rol');
      }
      
      const usuarioRol: UsuarioRol = data.data;
      
      console.log('Rol obtenido:', usuarioRol);
      
      // Guardar en el estado
      currentRole.value = usuarioRol;
      userCurrentRole.value = usuarioRol.rolID;
      
      return currentRole.value;
      
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error desconocido';
      console.error('Error al obtener rol:', e);
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

  return {
    roles,
    currentRole,
    userCurrentRole,
    loading,
    error,
    getUserRole,
    getAllRoles,
    getRoleById
  };
});