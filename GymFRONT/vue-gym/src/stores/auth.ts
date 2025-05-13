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
        
        // Eliminar la verificación basada en características del email
        // Esta parte causaba problemas con cuentas normales que usaban correos de Gmail
    })
    
    const isAuthenticated = computed(() => !!token.value)
    
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
    
            user.value = data.user
            token.value = data.token
            
            // Si remember está activo, guardar en localStorage, si no en sessionStorage
            if (credentials.remember) {
                localStorage.setItem('token', data.token)
                localStorage.setItem('user', JSON.stringify(data.user))
                // Guardar el método de autenticación como 'credentials'
                localStorage.setItem('authMethod', 'credentials')
            } else {
                sessionStorage.setItem('token', data.token)
                sessionStorage.setItem('user', JSON.stringify(data.user))
                // Guardar el método de autenticación como 'credentials'
                sessionStorage.setItem('authMethod', 'credentials')
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
            // Guardar el método de autenticación como 'credentials'
            sessionStorage.setItem('authMethod', 'credentials')
    
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
            // Verificar si es una cuenta de Google
            if (isGoogleAccount.value) {
                // No permitir cambios de email ni contraseña para cuentas de Google
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
    
            // Actualizar el usuario en el store
            if (updateData.nombre) user.value!.nombre = updateData.nombre;
            if (updateData.apellido) user.value!.apellido = updateData.apellido;
            // Solo actualizar el email si no es una cuenta de Google
            if (updateData.email && !isGoogleAccount.value) {
                user.value!.email = updateData.email;
            }
            
            // Actualizar el usuario en el almacenamiento
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

            // Crear un FormData para enviar el archivo
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_URL}/usuario/${user.value.usuarioID}/foto`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token.value}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || 'Error al actualizar la foto de perfil');
            }

            const data = await response.json();
            
            // Actualizar el URL de la foto en el usuario
            if (user.value) {
                user.value.fotoPerfilURL = data.data; // Asumiendo que data.data contiene el URL
                
                // Actualizar el usuario en el almacenamiento
                if (localStorage.getItem('user')) {
                    localStorage.setItem('user', JSON.stringify(user.value));
                } else if (sessionStorage.getItem('user')) {
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

            // Actualizar el URL de la foto en el usuario
            if (user.value) {
                user.value.fotoPerfilURL = null;
                
                // Actualizar el usuario en el almacenamiento
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
            
            // Actualizar el usuario en el almacenamiento
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
        // Limpiar el estado
        user.value = null
        token.value = null
        error.value = null
        
        // Limpiar el almacenamiento
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('authMethod')
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('user')
        sessionStorage.removeItem('authMethod')
    }
    
    async function googleLogin(idToken: string) {
        loading.value = true
        error.value = null
        try {
            const response = await fetch(`${API_URL}/auth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idToken }),
            })
    
            const data = await response.json()
    
            if (!response.ok) {
                throw new Error(data.message || 'Error en la autenticación con Google')
            }
    
            user.value = data.user
            token.value = data.token
            
            // Guardar en sessionStorage y marcar como autenticación de Google
            sessionStorage.setItem('token', data.token)
            sessionStorage.setItem('user', JSON.stringify(data.user))
            sessionStorage.setItem('authMethod', 'google')
            
            // Registrar para debug
            console.log('Inicio de sesión con Google exitoso')
            console.log('AuthMethod guardado:', sessionStorage.getItem('authMethod'))
            
            return data.user
        } catch (e) {
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
    
    return {
        user,
        token,
        loading,
        error,
        isAuthenticated,
        isGoogleAccount,
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
        removeProfilePhoto
    }
})