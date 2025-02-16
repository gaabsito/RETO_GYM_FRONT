import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginCredentials, RegisterData } from '@/types/User'
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
            localStorage.setItem('token', data.token)
    
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

    function logout() {
        user.value = null
        token.value = null
        localStorage.removeItem('token')
    }

    async function checkAuth() {
        const storedToken = localStorage.getItem('token')
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
        resetPassword
    }
})