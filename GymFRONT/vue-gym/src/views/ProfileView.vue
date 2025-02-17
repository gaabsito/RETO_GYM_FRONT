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
const isEditing = ref(false)

const form = ref({
  nombre: '',
  apellido: '',
  email: ''
})

// Cargar datos del usuario al montar la vista
onMounted(async () => {
  try {
    loading.value = true
    if (authStore.user) {
      console.log("Cargando datos del usuario desde Pinia:", authStore.user)
      form.value = {
        nombre: authStore.user.nombre || '',
        apellido: authStore.user.apellido || '',
        email: authStore.user.email || ''
      }
    } else {
      console.warn("El usuario no está cargado en el store, obteniendo desde la API.")
      const profile = await authStore.fetchProfile()
      form.value = {
        nombre: profile.nombre,
        apellido: profile.apellido,
        email: profile.email
      }
    }
  } catch (err) {
    console.error("Error al obtener el perfil:", err)
    error.value = 'Error al cargar el perfil'
  } finally {
    loading.value = false
  }
})

// Reglas de validación
const rules = {
  nombre: [(v: string) => !!v || 'El nombre es requerido'],
  apellido: [(v: string) => !!v || 'El apellido es requerido']
}

// Guardar cambios en el perfil
const handleSubmit = async () => {
  if (!formRef.value) return
  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    loading.value = true
    error.value = ''
    success.value = false

    const profileData: Partial<UserProfile> = {
      nombre: form.value.nombre,
      apellido: form.value.apellido
    }

    await authStore.updateProfile(profileData)

    success.value = true
    isEditing.value = false
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al actualizar el perfil'
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
            <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
            <v-alert v-if="success" type="success" class="mb-4">Perfil actualizado correctamente</v-alert>

            <v-form ref="formRef" @submit.prevent="handleSubmit">
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field 
                    v-model="form.nombre" 
                    :rules="rules.nombre" 
                    label="Nombre" 
                    :readonly="!isEditing" 
                    variant="outlined" 
                    required>
                  </v-text-field>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field 
                    v-model="form.apellido" 
                    :rules="rules.apellido" 
                    label="Apellido" 
                    :readonly="!isEditing" 
                    variant="outlined" 
                    required>
                  </v-text-field>
                </v-col>
              </v-row>

              <v-text-field 
                v-model="form.email" 
                label="Email" 
                type="email" 
                variant="outlined" 
                prepend-inner-icon="mdi-email" 
                readonly 
                required>
              </v-text-field>

              <v-row class="mt-4">
                <v-col cols="12" class="d-flex justify-end gap-4">
                  <v-btn v-if="!isEditing" color="primary" @click="isEditing = true">
                    Editar Perfil
                  </v-btn>

                  <template v-else>
                    <v-btn color="error" variant="outlined" @click="isEditing = false">
                      Cancelar
                    </v-btn>
                    <v-btn color="primary" type="submit" :loading="loading">
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
