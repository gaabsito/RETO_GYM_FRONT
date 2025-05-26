// src/stores/logros.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Logro, UsuarioLogro } from '@/types/Logro';
import type { ApiResponse } from '@/types/ApiResponse';
import { useAuthStore } from './auth';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7087/api';

export const useLogrosStore = defineStore('logros', () => {
  const logrosDisponibles = ref<Logro[]>([]);
  const logrosUsuario = ref<UsuarioLogro[]>([]);
  const logrosRecientes = ref<UsuarioLogro[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Obtener todos los logros disponibles
  async function fetchLogrosDisponibles() {
    loading.value = true;
    error.value = null;
    try {
      const authStore = useAuthStore();
      if (!authStore.token) {
        throw new Error('No autorizado');
      }

      const response = await fetch(`${API_URL}/Logro/disponibles`, {
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar logros disponibles');
      }

      const data: ApiResponse<Logro[]> = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error al cargar logros disponibles');
      }

      logrosDisponibles.value = data.data;
      return logrosDisponibles.value;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error desconocido';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  // Obtener logros del usuario
  async function fetchLogrosUsuario() {
    loading.value = true;
    error.value = null;
    try {
      const authStore = useAuthStore();
      if (!authStore.token) {
        throw new Error('No autorizado');
      }

      const response = await fetch(`${API_URL}/Logro`, {
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar logros del usuario');
      }

      const data: ApiResponse<UsuarioLogro[]> = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error al cargar logros del usuario');
      }

      // Formatear fechas
      logrosUsuario.value = data.data.map(logro => ({
        ...logro,
        fechaDesbloqueo: logro.fechaDesbloqueo ? new Date(logro.fechaDesbloqueo) : undefined
      }));
      
      return logrosUsuario.value;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error desconocido';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  // Obtener logros recientes
  async function fetchLogrosRecientes(cantidad = 5) {
    loading.value = true;
    error.value = null;
    try {
      const authStore = useAuthStore();
      if (!authStore.token) {
        throw new Error('No autorizado');
      }

      const response = await fetch(`${API_URL}/Logro/recientes?cantidad=${cantidad}`, {
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar logros recientes');
      }

      const data: ApiResponse<UsuarioLogro[]> = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error al cargar logros recientes');
      }

      // Formatear fechas
      logrosRecientes.value = data.data.map(logro => ({
        ...logro,
        fechaDesbloqueo: logro.fechaDesbloqueo ? new Date(logro.fechaDesbloqueo) : undefined
      }));
      
      return logrosRecientes.value;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error desconocido';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  // Verificar logros
  async function verificarLogros() {
    loading.value = true;
    error.value = null;
    try {
      const authStore = useAuthStore();
      if (!authStore.token) {
        throw new Error('No autorizado');
      }

      const response = await fetch(`${API_URL}/Logro/verificar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al verificar logros');
      }

      const data: ApiResponse<boolean> = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error al verificar logros');
      }

      // Actualizar los logros del usuario después de verificar
      await fetchLogrosUsuario();
      await fetchLogrosRecientes();
      
      return true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error desconocido';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  // Obtener experiencia total (suma de todos los logros desbloqueados)
  const experienciaTotal = computed(() => {
    return logrosUsuario.value
      .filter(logro => logro.desbloqueado)
      .reduce((total, logro) => total + logro.experiencia, 0);
  });

  // Obtener logros por categoría
  const logrosUsuarioPorCategoria = computed(() => {
    const categorias = {} as Record<string, UsuarioLogro[]>;
    
    logrosUsuario.value.forEach(logro => {
      if (!categorias[logro.categoria]) {
        categorias[logro.categoria] = [];
      }
      categorias[logro.categoria].push(logro);
    });
    
    return categorias;
  });

  // Obtener porcentaje de logros completados
  const porcentajeLogrosCompletados = computed(() => {
    if (logrosUsuario.value.length === 0) return 0;
    
    const completados = logrosUsuario.value.filter(logro => logro.desbloqueado).length;
    return Math.round((completados / logrosUsuario.value.length) * 100);
  });

  return {
    logrosDisponibles,
    logrosUsuario,
    logrosRecientes,
    loading,
    error,
    experienciaTotal,
    logrosUsuarioPorCategoria,
    porcentajeLogrosCompletados,
    fetchLogrosDisponibles,
    fetchLogrosUsuario,
    fetchLogrosRecientes,
    verificarLogros
  };
});