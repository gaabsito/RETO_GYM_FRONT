<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { VForm } from 'vuetify/components'

const authStore = useAuthStore()
const formRef = ref<VForm | null>(null)
const loading = ref(false)
const error = ref('')
const success = ref(false)
const email = ref('')

const rules = {
  email: [
    (v: string) => !!v || 'El email es requerido',
    (v: string) => /.+@.+\..+/.test(v) || 'Debe ser un email válido'
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  const { valid } = await formRef.value.validate()
  
  if (!valid) return

  try {
    loading.value = true
    error.value = ''
    
    await authStore.requestPasswordReset(email.value)
    success.value = true
  } catch (err: any) {
    error.value = err instanceof Error ? err.message : 'Error al enviar el correo'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-container class="recuperar-password-container" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="recuperar-password-card">
          <v-card-title class="recuperar-password-title text-center py-6">
            <h1 class="text-h4">Recuperar Contraseña</h1>
          </v-card-title>

          <v-card-text>
            <v-alert v-if="error" type="error" class="mb-4">
              {{ error }}
            </v-alert>

            <v-alert v-if="success" type="success" class="mb-4">
              Se ha enviado un correo con las instrucciones para recuperar tu contraseña
            </v-alert>

            <v-form v-if="!success" ref="formRef" @submit.prevent="handleSubmit">
              <v-text-field
                v-model="email"
                :rules="rules.email"
                label="Email"
                prepend-inner-icon="mdi-email"
                type="email"
                variant="outlined"
                required
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
                Enviar instrucciones
              </v-btn>
            </v-form>
          </v-card-text>

          <v-divider class="my-3"></v-divider>

          <v-card-text class="text-center">
            <p class="mb-0">
              <router-link to="/iniciar-sesión" class="text-decoration-none">
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

.recuperar-password-container {
  min-height: calc(100vh - var(--v-layout-top)) !important;
  display: flex;
  align-items: center;
}

.recuperar-password-card {
  border-radius: $border-radius;

  .recuperar-password-title {
    background-color: $primary-color;
    color: white;
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
</style>