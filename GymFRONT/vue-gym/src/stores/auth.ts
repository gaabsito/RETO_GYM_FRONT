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

    const isAuthenticated = computed(() => !!token.value)

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
    
            user.value = data.user
            token.value = data.token
            
            // Si remember está activo, guardar en localStorage, si no en sessionStorage
            if (credentials.remember) {
                localStorage.setItem('token', data.token)
                localStorage.setItem('user', JSON.stringify(data.user))
            } else {
                sessionStorage.setItem('token', data.token)
                sessionStorage.setItem('user', JSON.stringify(data.user))
            }
    
            return data.user
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
    
            user.value = data.user
            token.value = data.token
            
            sessionStorage.setItem('token', data.token)
            sessionStorage.setItem('user', JSON.stringify(data.user))
    
            return data.user
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
    
            // Actualizar el usuario en el store
            if (updateData.nombre) user.value!.nombre = updateData.nombre;
            if (updateData.apellido) user.value!.apellido = updateData.apellido;
            if (updateData.email) user.value!.email = updateData.email;
    
            return user.value;
        } catch (e) {
            error.value = e instanceof Error ? e.message : "Error desconocido";
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
            return data.data;
        } catch (e) {
            error.value = e instanceof Error ? e.message : "Error desconocido";
            throw e;
        } finally {
            loading.value = false;
        }
    }

    function logout() {
        // Limpiar el estado
        user.value = null
        token.value = null
        error.value = null
        
        // Limpiar el almacenamiento
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('user')
    }

    async function checkAuth() {
        // Verificar en ambos almacenamientos
        const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token')
        if (!storedToken) return
    
        try {
            const response = await fetch(`${API_URL}/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${storedToken}`
                }
            })
    
            const data: ApiResponse<{ user: User }> = await response.json()
    
            if (response.ok) {
                user.value = data.data.user
                token.value = storedToken
            } else {
                logout()
            }
        } catch {
            logout()
        }
    }

    return {
        user,
        token,
        loading,
        error,
        isAuthenticated,
        login,
        register,
        logout,
        checkAuth,
        requestPasswordReset,
        resetPassword,
        updateProfile,
        fetchUser
    }
})