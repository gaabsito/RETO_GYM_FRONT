import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginCredentials, RegisterData } from '@/types/User'
import type { ApiResponse } from '@/types/ApiResponse'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5288'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null)
    const token = ref<string | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    const isAuthenticated = computed(() => !!token.value)

    async function login(credentials: LoginCredentials) {
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

            const data: ApiResponse<{ user: User; token: string }> = await response.json()

            if (!response.ok) throw new Error(data.message || 'Error en la autenticación')

            user.value = data.data.user
            token.value = data.data.token
            localStorage.setItem('token', data.data.token)

            return data.data.user
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

            const data: ApiResponse<{ user: User; token: string }> = await response.json()

            if (!response.ok) throw new Error(data.message || 'Error en el registro')

            user.value = data.data.user
            token.value = data.data.token
            localStorage.setItem('token', data.data.token)

            return data.data.user
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
        checkAuth
    }
})