<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import type { VForm } from 'vuetify/components'

const authStore = useAuthStore()
const router = useRouter()

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
let googleAuth = null

onMounted(() => {
  // Cargar la API de Google
  const script = document.createElement('script')
  script.src = 'https://accounts.google.com/gsi/client'
  script.async = true
  script.defer = true
  document.head.appendChild(script)

  script.onload = () => {
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleGoogleLogin
    })
    window.google.accounts.id.renderButton(
      document.getElementById('googleBtn'),
      { theme: 'outline', size: 'large', width: '100%' }
    )
  }
})

const handleGoogleLogin = async (response) => {
  try {
    loading.value = true
    error.value = ''

    const result = await authStore.googleLogin(response.credential)
    router.push('/profile')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al iniciar sesión con Google'
  } finally {
    loading.value = false
  }
}

const form = ref({
  email: '',
  password: ''
})

const formRef = ref<VForm | null>(null)
const rememberMe = ref(false)

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

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

const handleSubmit = async () => {
  if (!formRef.value) return

  const { valid } = await formRef.value.validate()

  if (!valid) return

  try {
    loading.value = true
    error.value = ''

    await authStore.login({
      email: form.value.email,
      password: form.value.password,
      remember: rememberMe.value
    })

    router.push('/profile')
  } catch (err: any) {
    // Manejar errores específicos
    if (err.message === "Email o contraseña incorrectos") {
      error.value = "Email o contraseña incorrectos"
    } else if (err.message === "La cuenta está desactivada") {
      error.value = "Tu cuenta está desactivada"
    } else {
      error.value = err instanceof Error ? err.message : 'Error al iniciar sesión'
    }
  } finally {
    loading.value = false
  }
}
</script>

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

            <v-form ref="formRef" @submit.prevent="handleSubmit">
              <v-text-field class="login-form" v-model="form.email" :rules="rules.email" label="Email"
                prepend-inner-icon="mdi-email" type="email" variant="outlined" required></v-text-field>

              <v-text-field v-model="form.password" :rules="rules.password" :type="showPassword ? 'text' : 'password'"
                label="Contraseña" prepend-inner-icon="mdi-lock" variant="outlined" required
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"></v-text-field>

              <div class="d-flex align-center justify-space-between mb-4">
                <v-checkbox v-model="rememberMe" label="Recuérdame" color="primary" hide-details></v-checkbox>
                <router-link to="/reset-password" class="text-decoration-none">
                  ¿Olvidaste tu contraseña?
                </router-link>
              </div>

              <div class="btn-wrapper">
                <v-btn type="submit" color="primary" size="large" block :loading="loading">
                  Iniciar Sesión
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
  </v-container>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.v-divider__wrapper {
  padding-top: 4% !important;
  padding-bottom: 4% !important;
}

.login-container {
  min-height: calc(100vh - var(--v-layout-top)) !important;
  display: flex;
  align-items: center;
}

.login-card {
  border-radius: $border-radius;

  .login-title {
    background-color: $primary-color;
    color: white;
  }
}

.login-form {
  padding-top: 5% !important;
  padding-bottom: 4% !important;
}

:deep(.v-field) {
  border-radius: $border-radius !important;
}

.mb-4 {
  margin: 0px !important;
}

.btn-wrapper {
  padding-top: 4% !important;
}

.v-btn {
  font-family: $font-family-base;
  border-radius: $border-radius;
}

a {
  color: $primary-color;

  &:hover {
    color: darken($primary-color, 10%);
  }
}

.v-checkbox {
  font-family: $font-family-text;
}
</style>