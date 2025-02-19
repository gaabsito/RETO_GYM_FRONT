<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { UsuarioUpdateDTO } from '@/types/User'
import type { VForm } from 'vuetify/components'
import type { User } from '@/types/User'

const authStore = useAuthStore()
const formRef = ref<VForm | null>(null)
const loading = ref(false)
const error = ref('')
const success = ref('')
const showChangePassword = ref(false)

const form = ref({
  nombre: '',
  apellido: '',
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Cargar datos del usuario
onMounted(async () => {
  try {
    loading.value = true
    const userData = await authStore.fetchUser()
    if (userData) {
      form.value.nombre = userData.nombre
      form.value.apellido = userData.apellido
      form.value.email = userData.email
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al cargar el perfil'
  } finally {
    loading.value = false
  }
})

const rules = {
  required: (v: string) => !!v || 'Este campo es requerido',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Debe ser un email válido',
  password: (v: string) => v.length >= 6 || 'La contraseña debe tener al menos 6 caracteres',
  passwordMatch: (v: string) => v === form.value.newPassword || 'Las contraseñas no coinciden'
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    loading.value = true
    error.value = ''
    success.value = ''

    // Preparar datos para actualización
    const updateData: Partial<User> & { currentPassword?: string, newPassword?: string } = {
      nombre: form.value.nombre,
      apellido: form.value.apellido,
      email: form.value.email
    }

    if (showChangePassword.value) {
      updateData.currentPassword = form.value.currentPassword
      updateData.newPassword = form.value.newPassword
    }

    // Llamar al API para actualizar
    await authStore.updateProfile(updateData)
    
    success.value = 'Perfil actualizado correctamente'
    if (showChangePassword.value) {
      form.value.currentPassword = ''
      form.value.newPassword = ''
      form.value.confirmPassword = ''
      showChangePassword.value = false
    }
  } catch (err: any) {
    error.value = err.message || 'Error al actualizar el perfil'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-container class="profile-container" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="profile-card">
          <v-card-title class="profile-title text-center py-6">
            <h1 class="text-h4">Mi Perfil</h1>
          </v-card-title>

          <v-card-text>
            <v-alert v-if="error" type="error" class="mb-4">
              {{ error }}
            </v-alert>

            <v-alert v-if="success" type="success" class="mb-4">
              {{ success }}
            </v-alert>

            <v-form ref="formRef" @submit.prevent="handleSubmit">
              <v-text-field
                v-model="form.nombre"
                :rules="[rules.required]"
                label="Nombre"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                required
              ></v-text-field>

              <v-text-field
                v-model="form.apellido"
                :rules="[rules.required]"
                label="Apellido"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                required
              ></v-text-field>

              <v-text-field
                v-model="form.email"
                :rules="[rules.required, rules.email]"
                label="Email"
                prepend-inner-icon="mdi-email"
                type="email"
                variant="outlined"
                required
              ></v-text-field>

              <v-divider class="my-4"></v-divider>

              <div class="d-flex align-center mb-4">
                <v-checkbox
                  v-model="showChangePassword"
                  label="Cambiar contraseña"
                  color="primary"
                  hide-details
                ></v-checkbox>
              </div>

              <template v-if="showChangePassword">
                <v-text-field
                  v-model="form.currentPassword"
                  :rules="[rules.required, rules.password]"
                  label="Contraseña actual"
                  prepend-inner-icon="mdi-lock"
                  type="password"
                  variant="outlined"
                  required
                ></v-text-field>

                <v-text-field
                  v-model="form.newPassword"
                  :rules="[rules.required, rules.password]"
                  label="Nueva contraseña"
                  prepend-inner-icon="mdi-lock"
                  type="password"
                  variant="outlined"
                  required
                ></v-text-field>

                <v-text-field
                  v-model="form.confirmPassword"
                  :rules="[rules.required, rules.passwordMatch]"
                  label="Confirmar nueva contraseña"
                  prepend-inner-icon="mdi-lock"
                  type="password"
                  variant="outlined"
                  required
                ></v-text-field>
              </template>

              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="loading"
                class="mt-4"
              >
                Guardar Cambios
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.profile-container {
  min-height: calc(100vh - var(--v-layout-top)) !important;
  display: flex;
  align-items: center;
}

.profile-card {
  border-radius: $border-radius;

  .profile-title {
    background-color: $primary-color;
    color: white;
  }
}

:deep(.v-field) {
  border-radius: $border-radius !important;
}

.v-input {
  padding-top: 5% !important;
  padding-bottom: 4% !important;
}

.v-btn {
  font-family: $font-family-base;
  border-radius: $border-radius;
}

.v-checkbox {
  font-family: $font-family-text;
}
</style>