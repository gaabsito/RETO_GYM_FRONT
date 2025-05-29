<template>
  <v-container class="login-container" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="login-card">
          <v-card-title class="login-title text-center py-6">
            <h1 class="text-h4">Iniciar Sesión</h1>
          </v-card-title>

          <v-card-text>
            <v-alert v-if="error" type="error" class="mb-4">
              {{ error }}
            </v-alert>

            <!-- Info sobre cuenta de admin -->
            

            <v-form ref="formRef" @submit.prevent="handleSubmit">
              <v-text-field 
                class="login-form" 
                v-model="form.email" 
                :rules="rules.email" 
                label="Email"
                prepend-inner-icon="mdi-email" 
                type="email" 
                variant="outlined" 
                required
                :disabled="loading"
              ></v-text-field>

              <v-text-field 
                v-model="form.password" 
                :rules="rules.password" 
                :type="showPassword ? 'text' : 'password'"
                label="Contraseña" 
                prepend-inner-icon="mdi-lock" 
                variant="outlined" 
                required
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                :disabled="loading"
              ></v-text-field>

              <div class="d-flex align-center justify-space-between mb-4">
                <v-checkbox 
                  v-model="rememberMe" 
                  label="Recuérdame" 
                  color="primary" 
                  hide-details
                  :disabled="loading"
                ></v-checkbox>
                <router-link to="/reset-password" class="text-decoration-none">
                  ¿Olvidaste tu contraseña?
                </router-link>
              </div>

              <div class="btn-wrapper">
                <v-btn 
                  type="submit" 
                  color="primary" 
                  size="large" 
                  block 
                  :loading="loading"
                  :disabled="loading"
                >
                  <template v-if="loading">
                    <v-progress-circular 
                      indeterminate 
                      size="20" 
                      class="mr-2"
                    ></v-progress-circular>
                    {{ loginButtonText }}
                  </template>
                  <template v-else>
                    Iniciar Sesión
                  </template>
                </v-btn>
              </div>
            </v-form>

            <v-divider class="my-4">
              <span class="px-3">o</span>
            </v-divider>

            <div id="googleBtn" class="d-flex justify-center mb-4"></div>

          </v-card-text>

          <v-card-text class="text-center">
            <p class="mb-0">
              ¿No tienes una cuenta?
              <router-link to="/register" class="text-decoration-none">
                Regístrate
              </router-link>
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar para notificaciones -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      :timeout="4000"
      location="top"
    >
      {{ snackbarMessage }}
      <template v-slot:actions>
        <v-btn variant="text" @click="showSnackbar = false">
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'
import type { VForm } from 'vuetify/components'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
let googleAuth = null

// Estado del componente
const form = ref({
  email: '',
  password: ''
})

const formRef = ref<VForm | null>(null)
const rememberMe = ref(false)
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
const showAdminInfo = ref(true)

// Snackbar
const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

// Computed para el texto del botón de login
const loginButtonText = computed(() => {
  if (loading.value) {
    return 'Verificando credenciales...'
  }
  return 'Iniciar Sesión'
})

// Reglas de validación
const rules = {
  email: [
    (v: string) => !!v || 'El email es requerido',
    (v: string) => /.+@.+\..+/.test(v) || 'Debe ser un email válido'
  ],
  password: [
    (v: string) => !!v || 'La contraseña es requerida',
    (v: string) => v.length >= 6 || 'La contraseña debe tener al menos 6 caracteres'
  ]
}

// Inicialización de Google
onMounted(() => {
  // Si ya está autenticado, redirigir
  if (authStore.isAuthenticated) {
    redirectUser()
    return
  }

  // Cargar la API de Google
  const script = document.createElement('script')
  script.src = 'https://accounts.google.com/gsi/client'
  script.async = true
  script.defer = true
  document.head.appendChild(script)

  script.onload = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleLogin
      })
      window.google.accounts.id.renderButton(
        document.getElementById('googleBtn'),
        { theme: 'outline', size: 'large', width: '100%' }
      )
    }
  }
})

// Manejar login con Google
const handleGoogleLogin = async (response: any) => {
  try {
    loading.value = true
    error.value = ''

    const result = await authStore.googleLogin(response.credential)
    
    showNotification(
      result.isAdmin 
        ? '¡Bienvenido Administrador! Redirigiendo al panel de control...' 
        : '¡Bienvenido! Iniciando sesión...',
      'success'
    )

    // Redirigir basado en el tipo de usuario
    setTimeout(() => {
      if (result.isAdmin) {
        router.push('/admin')
      } else {
        const redirectTo = route.query.redirect as string || '/profile'
        router.push(redirectTo)
      }
    }, 1500)

  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al iniciar sesión con Google'
    showNotification('Error al iniciar sesión con Google', 'error')
  } finally {
    loading.value = false
  }
}

// Manejar submit del formulario
const handleSubmit = async () => {
  if (!formRef.value) return

  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    loading.value = true
    error.value = ''

    // Intentar login
    const result = await authStore.login({
      email: form.value.email,
      password: form.value.password,
      remember: rememberMe.value
    })

    // Mostrar mensaje de bienvenida
    const welcomeMessage = result.isAdmin 
      ? '¡Bienvenido Administrador! Redirigiendo al panel de control...'
      : '¡Bienvenido! Iniciando sesión...'

    showNotification(welcomeMessage, 'success')

    // Pequeña pausa para mostrar el mensaje antes de redirigir
    setTimeout(() => {
      redirectUser(result.isAdmin)
    }, 1500)

  } catch (err: any) {
    // Manejar errores específicos
    if (err.message === "Email o contraseña incorrectos") {
      error.value = "Email o contraseña incorrectos"
    } else if (err.message === "La cuenta está desactivada") {
      error.value = "Tu cuenta está desactivada. Contacta al administrador."
    } else if (err.message?.includes("Credenciales inválidas")) {
      error.value = "Email o contraseña incorrectos"
    } else {
      error.value = err instanceof Error ? err.message : 'Error al iniciar sesión'
    }
    
    showNotification(error.value, 'error')
  } finally {
    loading.value = false
  }
}

// Función para redirigir usuario
const redirectUser = (isAdmin?: boolean) => {
  const userIsAdmin = isAdmin !== undefined ? isAdmin : authStore.isAdmin
  
  if (userIsAdmin) {
    // REDIRIGIR A PANEL DE ADMIN
    router.push('/admin')
  } else {
    // Redirigir a la página solicitada o al perfil
    const redirectTo = route.query.redirect as string || '/profile'
    router.push(redirectTo)
  }
}

// Función para mostrar notificaciones
const showNotification = (message: string, color: string) => {
  snackbarMessage.value = message
  snackbarColor.value = color
  showSnackbar.value = true
}

// Limpiar error cuando el usuario empieza a escribir
const clearError = () => {
  if (error.value) {
    error.value = ''
  }
}

// Watchers para limpiar error
import { watch } from 'vue'
watch([() => form.value.email, () => form.value.password], clearError)
</script>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.v-divider__wrapper {
  padding-top: 4% !important;
  padding-bottom: 4% !important;
}

.text-center {
  padding-top: 4% !important;
  padding-bottom: 4% !important;
}

.text-decoration-none {
  padding: 12px !important;
}

.v-card-title {
  margin-bottom: 1rem !important;
}

.v-input {
  padding: 12px !important;
}

.login-container {
  min-height: calc(100vh - var(--v-layout-top)) !important;
  display: flex;
  align-items: center;
  background: #ffffff; /* Fondo blanco sólido */
}

.login-card {
  border-radius: $border-radius;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);

  /* CAMBIO: Título sin degradado, con fondo simple */
  .login-title {
    background: #f5f5f5; /* Fondo gris claro sólido */
    color: #333333; /* Texto oscuro */
    position: relative;
    
    /* Eliminar el ::after que creaba la línea de degradado */
    &::after {
      display: none;
    }
  }
}

:deep(.v-field) {
  border-radius: $border-radius !important;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &.v-field--focused {
    box-shadow: 0 4px 16px rgba($primary-color, 0.2);
  }
}

.mb-4 {
  margin: 0px !important;
}

.btn-wrapper {
  padding: 12px;
}

.v-alert {
  margin: 12px !important;
  border-radius: $border-radius !important;
}

.v-btn {
  font-family: $font-family-base;
  border-radius: $border-radius;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba($primary-color, 0.3);
  }
  
  &:disabled {
    transform: none;
  }
}

a {
  color: $primary-color;
  transition: color 0.2s ease;

  &:hover {
    color: darken($primary-color, 10%);
  }
}

.v-checkbox {
  font-family: $font-family-text;
}

// Animaciones para los elementos del formulario
.login-form {
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
  }
}

// Estilos para el botón de Google
#googleBtn {
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
}

// Media queries para mobile
@media (max-width: 600px) {
  .login-container {
    padding: 16px;
  }
  
  .login-card {
    margin: 0;
  }
  
  .v-card-title {
    padding: 20px 16px !important;
    
    h1 {
      font-size: 1.5rem !important;
    }
  }
  
  .v-input {
    padding: 8px !important;
  }
  
  .btn-wrapper {
    padding: 8px;
  }
  
  .text-decoration-none {
    padding: 8px !important;
  }
}

// Animación de carga
@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

.v-btn--loading {
  animation: pulse 1.5s ease-in-out infinite;
}
</style>