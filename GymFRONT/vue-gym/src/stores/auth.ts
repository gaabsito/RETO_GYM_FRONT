// src/stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginCredentials, RegisterData, UsuarioDTO} from '@/types/User'
import type { ApiResponse } from '@/types/ApiResponse'

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7087'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Verificar si la cuenta es de Google basado ÚNICAMENTE en el método de autenticación guardado
  const isGoogleAccount = computed(() => {
    // Verificar solamente si hay un método de autenticación 'google' guardado
    const authMethod = localStorage.getItem('authMethod') || sessionStorage.getItem('authMethod')
    return authMethod === 'google';
  })

  const isAuthenticated = computed(() => !!token.value)
  
  // Computed para verificar si es administrador
  const isAdmin = computed(() => user.value?.esAdmin === true)

  async function init() {
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token')
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user')
    
    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
      
      // Verificar que el token sea válido con el backend
      try {
        await checkAuth()
      } catch (error) {
        // Si hay error, limpiar el storage
        logout()
      }
    }
  }

  async function login(credentials: LoginCredentials & { remember?: boolean }) {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error en la autenticación')
      }

      user.value = data.data?.user || data.user
      token.value = data.data?.token || data.token

      // Si remember está activo, guardar en localStorage, si no en sessionStorage
      if (credentials.remember) {
        localStorage.setItem('token', data.data?.token || data.token)
        localStorage.setItem('user', JSON.stringify(data.data?.user || data.user))
        localStorage.setItem('authMethod', 'credentials')
      } else {
        sessionStorage.setItem('token', data.data?.token || data.token)
        sessionStorage.setItem('user', JSON.stringify(data.data?.user || data.user))
        sessionStorage.setItem('authMethod', 'credentials')
      }

      return {
        user: data.data?.user || data.user,
        isAdmin: data.data?.esAdmin || data.data?.user?.esAdmin || data.user?.esAdmin || false
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error desconocido'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function register(userData: RegisterData) {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error en el registro')
      }

      user.value = data.data?.user || data.user
      token.value = data.data?.token || data.token

      sessionStorage.setItem('token', data.data?.token || data.token)
      sessionStorage.setItem('user', JSON.stringify(data.data?.user || data.user))
      sessionStorage.setItem('authMethod', 'credentials')

      return data.data?.user || data.user
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error desconocido'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function requestPasswordReset(email: string) {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_URL}/auth/request-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al solicitar recuperación de contraseña')
      }

      return data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error desconocido'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function resetPassword(resetData: { token: string; password: string; confirmPassword: string }) {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resetData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al restablecer la contraseña')
      }

      return data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error desconocido'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(updateData: Partial<User> & { currentPassword?: string, newPassword?: string }) {
    loading.value = true;
    error.value = null;
    
    try {
      if (isGoogleAccount.value) {
        if (updateData.email) {
          throw new Error("Las cuentas vinculadas a Google no pueden cambiar su correo electrónico directamente");
        }
        if (updateData.currentPassword || updateData.newPassword) {
          throw new Error("Las cuentas vinculadas a Google no pueden cambiar su contraseña directamente");
        }
      }

      const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!storedToken) throw new Error("No hay token disponible");

      const response = await fetch(`${API_URL}/usuario/${user.value?.usuarioID}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${storedToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al actualizar el perfil");
      }

      if (updateData.nombre) user.value!.nombre = updateData.nombre;
      if (updateData.apellido) user.value!.apellido = updateData.apellido;
      if (updateData.email && !isGoogleAccount.value) {
        user.value!.email = updateData.email;
      }

      if (localStorage.getItem('user')) {
        localStorage.setItem('user', JSON.stringify(user.value));
      } else if (sessionStorage.getItem('user')) {
        sessionStorage.setItem('user', JSON.stringify(user.value));
      }

      return user.value;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Error desconocido";
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function updateProfilePhoto(file: File) {
    loading.value = true;
    error.value = null;

    try {
      if (!token.value || !user.value) {
        throw new Error('No autorizado');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('La imagen no debe exceder 5MB');
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Formato no soportado. Use JPG, PNG, GIF o WEBP');
      }

      const formData = new FormData();
      formData.append('file', file);

      const url = `${API_URL}/usuario/${user.value.usuarioID}/foto`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.value}`
        },
        body: formData
      });

      if (response.status === 404) {
        throw new Error('Ruta no encontrada en el servidor (404)');
      }

      const responseText = await response.text();

      if (!responseText || responseText.trim() === '') {
        throw new Error('El servidor devolvió una respuesta vacía');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        throw new Error('Respuesta inválida del servidor: ' + responseText);
      }

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar la foto de perfil');
      }

      if (!data.data || typeof data.data !== 'string') {
        throw new Error('La respuesta del servidor no incluye una URL de imagen');
      }

      if (user.value) {
        user.value.fotoPerfilURL = data.data;

        if (localStorage.getItem('user')) {
          localStorage.setItem('user', JSON.stringify(user.value));
        }
        if (sessionStorage.getItem('user')) {
          sessionStorage.setItem('user', JSON.stringify(user.value));
        }
      }

      return data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error desconocido';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function removeProfilePhoto() {
    loading.value = true;
    error.value = null;

    try {
      if (!token.value || !user.value) {
        throw new Error('No autorizado');
      }

      const response = await fetch(`${API_URL}/usuario/${user.value.usuarioID}/foto`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Error al eliminar la foto de perfil');
      }

      const data = await response.json();

      if (user.value) {
        user.value.fotoPerfilURL = null;

        if (localStorage.getItem('user')) {
          localStorage.setItem('user', JSON.stringify(user.value));
        } else if (sessionStorage.getItem('user')) {
          sessionStorage.setItem('user', JSON.stringify(user.value));
        }
      }

      return true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error desconocido';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchUser() {
    loading.value = true;
    error.value = null;

    try {
      const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!storedToken) throw new Error("No hay token disponible");

      const response = await fetch(`${API_URL}/Usuario/profile`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Error al obtener el perfil');
      }

      const data: ApiResponse<UsuarioDTO> = await response.json();
      user.value = data.data;

      if (localStorage.getItem('user')) {
        localStorage.setItem('user', JSON.stringify(user.value));
      } else if (sessionStorage.getItem('user')) {
        sessionStorage.setItem('user', JSON.stringify(user.value));
      }

      return data.data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Error desconocido";
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    user.value = null
    token.value = null
    error.value = null

    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('authMethod')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('authMethod')
  }

  // FUNCIÓN GOOGLE LOGIN CORREGIDA
  async function googleLogin(idToken: string) {
    loading.value = true
    error.value = null

    try {
      console.log('Intentando login con Google...')

      const response = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('Token de Google inválido o expirado. Intenta nuevamente.')
        } else if (response.status === 401) {
          throw new Error('Error de autenticación con Google. Verifica tu configuración.')
        } else {
          throw new Error(data.message || 'Error en la autenticación con Google')
        }
      }

      user.value = data.data?.user || data.user
      token.value = data.data?.token || data.token

      sessionStorage.setItem('token', data.data?.token || data.token)
      sessionStorage.setItem('user', JSON.stringify(data.data?.user || data.user))
      sessionStorage.setItem('authMethod', 'google')

      console.log('Inicio de sesión con Google exitoso')

      return {
        user: data.data?.user || data.user,
        isAdmin: data.data?.esAdmin || data.data?.user?.esAdmin || data.user?.esAdmin || false
      }
    } catch (e) {
      console.error('Error en googleLogin:', e)
      error.value = e instanceof Error ? e.message : 'Error desconocido'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function checkAuth() {
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (!storedToken) return

    try {
      const response = await fetch(`${API_URL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      })

      const data: ApiResponse<UsuarioDTO> = await response.json()
      
      if (response.ok && data.success) {
        user.value = data.data
        token.value = storedToken
      } else {
        logout()
      }
    } catch {
      logout()
    }
  }

  function hasAdminPermissions(): boolean {
    return isAdmin.value && isAuthenticated.value
  }

  async function adminRequest(url: string, options: RequestInit = {}) {
    if (!hasAdminPermissions()) {
      throw new Error('No tienes permisos de administrador')
    }

    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (!storedToken) {
      throw new Error('No hay token disponible')
    }

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${storedToken}`,
        ...options.headers
      }
    }

    return fetch(url, { ...options, ...defaultOptions })
  }

  function getAuthHeaders() {
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${storedToken}`
    }
  }

  function needsReauth(): boolean {
    return !token.value || !user.value
  }

  async function refreshUserData() {
    if (needsReauth()) return false
    
    try {
      await fetchUser()
      return true
    } catch (error) {
      console.error('Error refreshing user data:', error)
      return false
    }
  }

  return {
    // Estado
    user,
    token,
    loading,
    error,
    
    // Computed
    isAuthenticated,
    isGoogleAccount,
    isAdmin,
    
    // Funciones principales
    init,
    login,
    register,
    logout,
    checkAuth,
    requestPasswordReset,
    resetPassword,
    updateProfile,
    fetchUser,
    googleLogin,
    updateProfilePhoto,
    removeProfilePhoto,
    
    // Funciones de utilidad para admin
    hasAdminPermissions,
    adminRequest,
    getAuthHeaders,
    needsReauth,
    refreshUserData
  }
})