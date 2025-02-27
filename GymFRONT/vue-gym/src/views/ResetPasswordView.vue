<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'
import type { VForm } from 'vuetify/components'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const formRef = ref<VForm | null>(null)

const form = ref({
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const success = ref(false)

const rules = {
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
    
    await authStore.resetPassword({
      token: route.params.token as string,
      password: form.value.password,
      confirmPassword: form.value.confirmPassword
    })
    
    success.value = true
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  } catch (err: any) {
    error.value = err instanceof Error ? err.message : 'Error al restablecer la contraseña'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-container class="reset-password-container" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="reset-password-card">
          <v-card-title class="reset-password-title text-center py-6">
            <h1 class="text-h4">Restablecer Contraseña</h1>
          </v-card-title>

          <v-card-text>
            <v-alert v-if="error" type="error" class="mb-4">
              {{ error }}
            </v-alert>

            <v-alert v-if="success" type="success" class="mb-4">
              Contraseña actualizada correctamente. Serás redirigido al login...
            </v-alert>

            <v-form v-if="!success" ref="formRef" @submit.prevent="handleSubmit">
              <v-text-field
                v-model="form.password"
                :rules="rules.password"
                :type="showPassword ? 'text' : 'password'"
                label="Nueva Contraseña"
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
                :disabled="loading"
                class="mt-4"
              >
                Restablecer Contraseña
              </v-btn>
            </v-form>
          </v-card-text>

          <v-divider class="my-3"></v-divider>

          <v-card-text class="text-center">
            <p class="mb-0">
              <router-link to="/login" class="text-decoration-none">
                Volver al inicio de sesión
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

.reset-password-container {
  min-height: calc(100vh - var(--v-layout-top)) !important;
  display: flex;
  align-items: center;
}

.reset-password-card {
  border-radius: $border-radius;

  .reset-password-title {
    background-color: $primary-color;
    color: white;
  }
}

:deep(.v-field) {
  border-radius: $border-radius !important;
}

.v-card-title {
  margin-bottom: 1rem !important;
}

.v-card-text {
  padding: 12px !important;
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
</style>