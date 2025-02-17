<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { VForm } from 'vuetify/components'
import type { UserProfile } from '@/types/User'

const authStore = useAuthStore()
const formRef = ref<VForm | null>(null)
const loading = ref(false)
const error = ref('')
const success = ref(false)
const showPassword = ref(false)
const showNewPassword = ref(false)
const isEditing = ref(false)

const form = ref({
  nombre: '',
  apellido: '',
  email: '',
  passwordActual: '',
  passwordNueva: '',
  edad: '',
  peso: '',
  altura: '',
  objetivo: '',
  nivelExperiencia: ''
})

const objetivos = [
  { value: 'perdida-peso', text: 'Pérdida de peso' },
  { value: 'ganancia-muscular', text: 'Ganancia muscular' },
  { value: 'mantenimiento', text: 'Mantenimiento' },
  { value: 'fitness', text: 'Fitness general' }
]

const nivelesExperiencia = [
  { value: 'principiante', text: 'Principiante' },
  { value: 'intermedio', text: 'Intermedio' },
  { value: 'avanzado', text: 'Avanzado' }
]

onMounted(async () => {
  try {
    loading.value = true
    const profile = await authStore.fetchProfile()
    
    // Asegurarnos de mantener los campos obligatorios de User
    form.value = {
      ...form.value,
      usuarioID: profile.usuarioID,
      nombre: profile.nombre,
      apellido: profile.apellido,
      email: profile.email,
      fechaRegistro: profile.fechaRegistro,
      estaActivo: profile.estaActivo,
      // Campos opcionales del perfil
      edad: profile.edad?.toString() || '',
      peso: profile.peso?.toString() || '',
      altura: profile.altura?.toString() || '',
      objetivo: profile.objetivo || '',
      nivelExperiencia: profile.nivelExperiencia || '',
      // Campos de contraseña siempre vacíos inicialmente
      passwordActual: '',
      passwordNueva: ''
    }
  } catch (err: any) {
    error.value = 'Error al cargar el perfil'
  } finally {
    loading.value = false
  }
})

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
  passwordActual: [
    (v: string) => !v || v.length >= 6 || 'La contraseña debe tener al menos 6 caracteres'
  ],
  passwordNueva: [
    (v: string) => !v || v.length >= 6 || 'La contraseña debe tener al menos 6 caracteres'
  ],
  edad: [
    (v: string) => !v || /^\d+$/.test(v) || 'Debe ser un número',
    (v: string) => !v || (parseInt(v) >= 14 && parseInt(v) <= 100) || 'La edad debe estar entre 14 y 100 años'
  ],
  peso: [
    (v: string) => !v || /^\d+$/.test(v) || 'Debe ser un número',
    (v: string) => !v || (parseInt(v) >= 30 && parseInt(v) <= 300) || 'El peso debe estar entre 30 y 300 kg'
  ],
  altura: [
    (v: string) => !v || /^\d+$/.test(v) || 'Debe ser un número',
    (v: string) => !v || (parseInt(v) >= 100 && parseInt(v) <= 250) || 'La altura debe estar entre 100 y 250 cm'
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  const { valid } = await formRef.value.validate()
  
  if (!valid) return

  try {
    loading.value = true
    error.value = ''
    success.value = false

    // Actualizar perfil
    const profileData: Partial<UserProfile> = {
      nombre: form.value.nombre,
      apellido: form.value.apellido,
      email: form.value.email,
      edad: form.value.edad ? parseInt(form.value.edad) : undefined,
      peso: form.value.peso ? parseInt(form.value.peso) : undefined,
      altura: form.value.altura ? parseInt(form.value.altura) : undefined,
      objetivo: form.value.objetivo || undefined,
      nivelExperiencia: form.value.nivelExperiencia || undefined
    }

    await authStore.updateProfile(profileData)

    // Si hay nueva contraseña, actualizarla
    if (form.value.passwordActual && form.value.passwordNueva) {
      await authStore.changePassword({
        passwordActual: form.value.passwordActual,
        passwordNueva: form.value.passwordNueva
      })
    }
    
    success.value = true
    isEditing.value = false
    form.value.passwordActual = ''
    form.value.passwordNueva = ''
  } catch (err: any) {
    if (err.response?.status === 401) {
      error.value = 'Contraseña actual incorrecta'
    } else {
      error.value = err.response?.data?.message || 'Error al actualizar el perfil'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-container class="profile-container">
    <v-row justify="center">
      <v-col cols="12" sm="10" md="8" lg="6">
        <v-card class="profile-card">
          <v-card-title class="profile-title text-center py-6">
            <h1 class="text-h4">Mi Perfil</h1>
          </v-card-title>

          <v-card-text>
            <v-alert v-if="error" type="error" class="mb-4">
              {{ error }}
            </v-alert>

            <v-alert v-if="success" type="success" class="mb-4">
              Perfil actualizado correctamente
            </v-alert>

            <v-form ref="formRef" @submit.prevent="handleSubmit">
              <v-row>
                <!-- Información Personal -->
                <v-col cols="12">
                  <h2 class="text-h6 mb-4">Información Personal</h2>
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="form.nombre"
                        :rules="rules.nombre"
                        label="Nombre"
                        :readonly="!isEditing"
                        variant="outlined"
                        prepend-inner-icon="mdi-account"
                        required
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="form.apellido"
                        :rules="rules.apellido"
                        label="Apellido"
                        :readonly="!isEditing"
                        variant="outlined"
                        prepend-inner-icon="mdi-account"
                        required
                      ></v-text-field>
                    </v-col>
                  </v-row>

                  <v-text-field
                    v-model="form.email"
                    :rules="rules.email"
                    label="Email"
                    type="email"
                    :readonly="!isEditing"
                    variant="outlined"
                    prepend-inner-icon="mdi-email"
                    required
                  ></v-text-field>
                </v-col>

                <!-- Información Física -->
                <v-col cols="12">
                  <h2 class="text-h6 mb-4">Información Física</h2>
                  <v-row>
                    <v-col cols="12" sm="4">
                      <v-text-field
                        v-model="form.edad"
                        :rules="rules.edad"
                        label="Edad"
                        :readonly="!isEditing"
                        variant="outlined"
                        prepend-inner-icon="mdi-calendar"
                        suffix="años"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" sm="4">
                      <v-text-field
                        v-model="form.peso"
                        :rules="rules.peso"
                        label="Peso"
                        :readonly="!isEditing"
                        variant="outlined"
                        prepend-inner-icon="mdi-scale"
                        suffix="kg"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" sm="4">
                      <v-text-field
                        v-model="form.altura"
                        :rules="rules.altura"
                        label="Altura"
                        :readonly="!isEditing"
                        variant="outlined"
                        prepend-inner-icon="mdi-human-male-height"
                        suffix="cm"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-col>

                <!-- Preferencias de Entrenamiento -->
                <v-col cols="12">
                  <h2 class="text-h6 mb-4">Preferencias de Entrenamiento</h2>
                  <v-select
                    v-model="form.objetivo"
                    :items="objetivos"
                    label="Objetivo"
                    :readonly="!isEditing"
                    variant="outlined"
                    prepend-inner-icon="mdi-target"
                  ></v-select>

                  <v-select
                    v-model="form.nivelExperiencia"
                    :items="nivelesExperiencia"
                    label="Nivel de Experiencia"
                    :readonly="!isEditing"
                    variant="outlined"
                    prepend-inner-icon="mdi-arm-flex"
                  ></v-select>
                </v-col>

                <!-- Cambio de Contraseña -->
                <v-col v-if="isEditing" cols="12">
                  <h2 class="text-h6 mb-4">Cambiar Contraseña</h2>
                  <v-text-field
                    v-model="form.passwordActual"
                    :rules="rules.passwordActual"
                    :type="showPassword ? 'text' : 'password'"
                    label="Contraseña Actual"
                    variant="outlined"
                    prepend-inner-icon="mdi-lock"
                    :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append-inner="showPassword = !showPassword"
                  ></v-text-field>

                  <v-text-field
                    v-model="form.passwordNueva"
                    :rules="rules.passwordNueva"
                    :type="showNewPassword ? 'text' : 'password'"
                    label="Nueva Contraseña"
                    variant="outlined"
                    prepend-inner-icon="mdi-lock-reset"
                    :append-inner-icon="showNewPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append-inner="showNewPassword = !showNewPassword"
                  ></v-text-field>
                </v-col>
              </v-row>

              <!-- Botones de acción -->
              <v-row class="mt-4">
                <v-col cols="12" class="d-flex justify-end gap-4">
                  <v-btn
                    v-if="!isEditing"
                    color="primary"
                    @click="isEditing = true"
                  >
                    Editar Perfil
                  </v-btn>
                  <template v-else>
                    <v-btn
                      color="error"
                      variant="outlined"
                      @click="isEditing = false"
                    >
                      Cancelar
                    </v-btn>
                    <v-btn
                      color="primary"
                      type="submit"
                      :loading="loading"
                    >
                      Guardar Cambios
                    </v-btn>
                  </template>
                </v-col>
              </v-row>
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
  padding-top: 2rem;
  padding-bottom: 2rem;
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

.v-btn {
  font-family: $font-family-base;
  border-radius: $border-radius;
}

.text-h6 {
  color: $primary-color;
  font-family: $font-family-base;
}
</style>