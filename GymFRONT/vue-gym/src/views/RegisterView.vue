<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import type { VForm } from 'vuetify/components'

const authStore = useAuthStore()
const router = useRouter()

const form = ref({
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const formRef = ref<VForm | null>(null)

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const rules = {
  nombre: [
    (v: string) => !!v || 'El nombre es requerido',
    (v: string) => v.length >= 2 || 'El nombre debe tener al menos 2 caracteres'
  ],
  apellido: [
    (v: string) => !!v || 'El apellido es requerido',
    (v: string) => v.length >= 2 || 'El apellido debe tener al menos 2 caracteres'
  ],
  email: [
    (v: string) => !!v || 'El email es requerido',
    (v: string) => /.+@.+\..+/.test(v) || 'Debe ser un email válido'
  ],
  password: [
    (v: string) => !!v || 'La contraseña es requerida',
    (v: string) => v.length >= 6 || 'La contraseña debe tener al menos 6 caracteres'
  ],
  confirmPassword: [
    (v: string) => !!v || 'Debe confirmar la contraseña',
    (v: string) => v === form.value.password || 'Las contraseñas no coinciden'
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  const { valid } = await formRef.value.validate()
  
  if (!valid) return

  try {
    loading.value = true
    error.value = ''

    await authStore.register({
      nombre: form.value.nombre,
      apellido: form.value.apellido,
      email: form.value.email,
      password: form.value.password
    })

    router.push('/')
  } catch (err: any) {
    // Manejar el error de la API
    if (err.message === "El email ya está registrado") {
      error.value = "Este email ya está registrado"
    } else {
      error.value = err instanceof Error ? err.message : 'Error al registrarse'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-container class="register-container" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="register-card">
          <v-card-title class="register-title text-center py-6">
            <h1 class="text-h4">Crear Cuenta</h1>
          </v-card-title>

          <v-card-text>
            <v-alert v-if="error" type="error" class="mb-4">
              {{ error }}
            </v-alert>

            <v-form ref="formRef" @submit.prevent="handleSubmit">
              <v-row>
                <v-col class="nombre-col" cols="12" sm="6">
                  <v-text-field
                    v-model="form.nombre"
                    :rules="rules.nombre"
                    label="Nombre"
                    prepend-inner-icon="mdi-account"
                    variant="outlined"
                    required
                  ></v-text-field>
                </v-col>

                <v-col class="apellido-col" cols="12" sm="6">
                  <v-text-field
                    v-model="form.apellido"
                    :rules="rules.apellido"
                    label="Apellido"
                    prepend-inner-icon="mdi-account"
                    variant="outlined"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-text-field
                v-model="form.email"
                :rules="rules.email"
                label="Email"
                prepend-inner-icon="mdi-email"
                type="email"
                variant="outlined"
                required
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
              ></v-text-field>

              <v-text-field
                v-model="form.confirmPassword"
                :rules="rules.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                label="Confirmar Contraseña"
                prepend-inner-icon="mdi-lock-check"
                variant="outlined"
                required
                :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showConfirmPassword = !showConfirmPassword"
              ></v-text-field>

              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="loading"
                class="mt-4"
              >
                Registrarse
              </v-btn>
            </v-form>
          </v-card-text>

          <v-divider class="my-3"></v-divider>

          <v-card-text class="text-center">
            <p class="mb-0">
              ¿Ya tienes una cuenta?
              <router-link to="/iniciar-sesión" class="text-decoration-none">
                Inicia Sesión
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

.register-container {
  min-height: calc(100vh - var(--v-layout-top)) !important;
  display: flex;
  align-items: center;
}

.register-card {
  border-radius: $border-radius;

  .register-title {
    background-color: $primary-color;
    color: white;
  }
}

.v-text-field {
    padding-top: 2.5% !important;
    padding-bottom: 2.5% !important;
}

.nombre-col {
    @media (min-width: 600px) {
        padding-right: 2.5% !important;
    }
}

.apellido-col {
    @media (min-width: 600px) {
        padding-left: 2.5% !important;
    }
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