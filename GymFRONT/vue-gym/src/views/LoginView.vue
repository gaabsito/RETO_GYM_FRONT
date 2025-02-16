<!-- src/views/LoginView.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import type { VForm } from 'vuetify/components'

const authStore = useAuthStore()
const router = useRouter()

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

    router.push('/')
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
              <v-text-field class="login-form" v-model="form.email" :rules="rules.email" label="Email" prepend-inner-icon="mdi-email"
                type="email" variant="outlined" required></v-text-field>

              <v-text-field v-model="form.password" :rules="rules.password" :type="showPassword ? 'text' : 'password'"
                label="Contraseña" prepend-inner-icon="mdi-lock" variant="outlined" required
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"></v-text-field>

              <div class="d-flex align-center justify-space-between mb-4">
                <v-checkbox v-model="rememberMe" label="Recuérdame" color="primary" hide-details></v-checkbox>
                <router-link to="/recuperar-password" class="text-decoration-none">
                  ¿Olvidaste tu contraseña?
                </router-link>
              </div>

              <v-btn type="submit" color="primary" size="large" block :loading="loading">
                Iniciar Sesión
              </v-btn>
            </v-form>
          </v-card-text>

          <v-divider class="my-3"></v-divider>

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