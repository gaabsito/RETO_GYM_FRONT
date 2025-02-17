import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { User, LoginCredentials, RegisterData, AuthResponseDTO, ChangePasswordDTO } from '@/types/User'
import type { ApiResponse } from '@/types/ApiResponse'

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7087'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null)
    const token = ref<string | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    const router = useRouter()

    const isAuthenticated = computed(() => !!token.value)

    async function login(credentials: LoginCredentials & { remember?: boolean }) {
        loading.value = true
        error.value = null
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            })
    
            const data = await response.json()
    
            if (!response.ok) throw new Error(data.message || 'Error en la autenticación')
    
            user.value = data.user
            token.value = data.token
            
            // Guardar token y usuario en localStorage o sessionStorage
            if (credentials.remember) {
                localStorage.setItem('token', data.token)
                localStorage.setItem('user', JSON.stringify(data.user))
            } else {
                sessionStorage.setItem('token', data.token)
                sessionStorage.setItem('user', JSON.stringify(data.user))
            }

            // 🔹 Redirección después del login
            router.push('/perfil')

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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            })
    
            const data = await response.json()
    
            if (!response.ok) throw new Error(data.message || 'Error en el registro')
    
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

    async function fetchProfile() {
        loading.value = true
        error.value = null
        try {
            const response = await fetch(`${API_URL}/api/usuario/profile`, {
                headers: { 'Authorization': `Bearer ${token.value}` }
            })

            const data: ApiResponse<User> = await response.json()

            if (!response.ok) throw new Error(data.message || 'Error al obtener el perfil')

            user.value = data.data
            return data.data
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido'
            throw e
        } finally {
            loading.value = false
        }
    }

    async function updateProfile(profileData: Partial<User>) {
        loading.value = true
        error.value = null
        try {
            const response = await fetch(`${API_URL}/api/usuario/profile`, { // 🔹 Corregida la URL
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token.value}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData),
            });
    
            const data: ApiResponse<User> = await response.json();
    
            if (!response.ok) throw new Error(data.message || 'Error al actualizar el perfil');
    
            // 🔹 Aplicamos la solución para evitar errores con `undefined`
            if (user.value) {
                if (profileData.nombre !== undefined) user.value.nombre = profileData.nombre;
                if (profileData.apellido !== undefined) user.value.apellido = profileData.apellido;
                if (profileData.email !== undefined) user.value.email = profileData.email;
            }
            
            
    
            return data.data;
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Error desconocido';
            throw e;
        } finally {
            loading.value = false;
        }
    }
    
    async function changePassword(passwordData: ChangePasswordDTO) {
        loading.value = true
        error.value = null
        try {
            const response = await fetch(`${API_URL}/api/usuario/change-password`, { // 🔹 Verifica la ruta en el backend
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token.value}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(passwordData),
            })

            const data: ApiResponse<void> = await response.json()

            if (!response.ok) throw new Error(data.message || 'Error al cambiar la contraseña')

            return true
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
        localStorage.removeItem('user')
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('user')
        router.push('/login') // 🔹 Redirige al login tras cerrar sesión
    }

    async function checkAuth() {
        const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token')
        if (!storedToken) return

        try {
            const response = await fetch(`${API_URL}/auth/verify`, {
                headers: { 'Authorization': `Bearer ${storedToken}` }
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
        fetchProfile,
        updateProfile,
        changePassword
    }
})
