<!-- src/views/ProfileView.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useWorkoutStore } from '@/stores/workouts'
import type { VForm } from 'vuetify/components'
import type { User } from '@/types/User'
import WorkoutCard from '@/components/WorkoutCard.vue'

const authStore = useAuthStore()
const workoutStore = useWorkoutStore()
const formRef = ref<VForm | null>(null)
const loading = ref(false)
const error = ref('')
const success = ref('')
const showChangePassword = ref(false)

// Workouts filtering
const searchQuery = ref('')
const selectedDifficulty = ref<string | null>(null)
const difficulties = ['Fácil', 'Media', 'Difícil']
const userWorkouts = ref<any[]>([])

const form = ref({
  nombre: '',
  apellido: '',
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Cargar datos del usuario y entrenamientos
onMounted(async () => {
  try {
    loading.value = true
    const userData = await authStore.fetchUser()
    
    // Cargar entrenamientos
    await workoutStore.fetchWorkouts()
    
    if (userData) {
      form.value.nombre = userData.nombre
      form.value.apellido = userData.apellido
      form.value.email = userData.email

      // Filtrar entrenamientos del usuario actual
      userWorkouts.value = workoutStore.workouts.filter(workout => 
        workout.autorID === userData.usuarioID
      )
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

// Filtrar entrenamientos
const filteredWorkouts = computed(() => {
  return userWorkouts.value.filter(workout => {
    // Filtrar por búsqueda
    const matchesSearch = 
      workout.titulo.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (workout.descripcion?.toLowerCase().includes(searchQuery.value.toLowerCase()) ?? false)

    // Filtrar por dificultad
    const matchesDifficulty = !selectedDifficulty.value || 
      workout.dificultad === selectedDifficulty.value

    return matchesSearch && matchesDifficulty
  })
})

// Eliminar entrenamiento
const deleteWorkout = async (workoutId: number) => {
  try {
    if (confirm('¿Estás seguro de que deseas eliminar este entrenamiento?')) {
      await workoutStore.deleteWorkout(workoutId)
      
      // Actualizar la lista de entrenamientos local
      userWorkouts.value = userWorkouts.value.filter(w => w.entrenamientoID !== workoutId)
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al eliminar entrenamiento'
  }
}

// Limpiar filtros
const clearFilters = () => {
  searchQuery.value = ''
  selectedDifficulty.value = null
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
  <v-container fluid>
    <v-row>
      <!-- Información Personal -->
      <v-col cols="12" md="5">
        <v-card class="profile-card">
          <v-card-title class="profile-title">
            Información Personal
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

              <div class="d-flex align-center">
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

              <div class="btn-wrapper">
                <v-btn 
                  type="submit" 
                  color="primary" 
                  size="large" 
                  block 
                  :loading="loading"
                >
                  Guardar Cambios
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Mis Entrenamientos -->
      <v-col cols="12" md="7">
        <v-card class="profile-card">
          <v-card-title class="profile-title">
            Mis Entrenamientos
            <v-btn 
              color="primary" 
              size="small" 
              to="/crear-entrenamiento" 
              prepend-icon="mdi-plus"
              class="ml-2"
            >
              Crear Nuevo
            </v-btn>
          </v-card-title>

          <v-card-text>
            <!-- Filtros -->
            <v-row class="filters-container mb-4">
              <v-col cols="12" md="5">
                <v-text-field
                  v-model="searchQuery"
                  label="Buscar entrenamientos"
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  clearable
                  hide-details
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="5">
                <v-select
                  v-model="selectedDifficulty"
                  :items="difficulties"
                  label="Dificultad"
                  prepend-inner-icon="mdi-signal-cellular-outline"
                  variant="outlined"
                  clearable
                  hide-details
                ></v-select>
              </v-col>

              <v-col cols="12" md="2" class="d-flex justify-center align-center">
                <v-btn
                  variant="text"
                  @click="clearFilters"
                  :disabled="!searchQuery && !selectedDifficulty"
                >
                  Limpiar
                </v-btn>
              </v-col>
            </v-row>

            <!-- Loading State -->
            <v-row v-if="loading" class="mt-4">
              <v-col cols="12" class="text-center">
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="64"
                ></v-progress-circular>
              </v-col>
            </v-row>

            <!-- No Workouts State -->
            <v-row v-else-if="filteredWorkouts.length === 0" class="mt-4">
              <v-col cols="12" class="text-center">
                <v-alert type="info" class="mb-4">
                  Aún no has creado ningún entrenamiento
                </v-alert>
                <v-btn 
                  color="primary" 
                  to="/crear-entrenamiento"
                  prepend-icon="mdi-plus"
                >
                  Crear Primer Entrenamiento
                </v-btn>
              </v-col>
            </v-row>

            <!-- Workouts List -->
            <v-row v-else class="mt-4">
              <v-col
                v-for="workout in filteredWorkouts"
                :key="workout.entrenamientoID"
                cols="12"
                sm="6"
              >
                <v-card class="workout-card">
                  <WorkoutCard :workout="workout" />
                  
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn 
                      color="error" 
                      variant="text" 
                      @click="deleteWorkout(workout.entrenamientoID)"
                    >
                      Eliminar
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.profile-card {
  border-radius: $border-radius;
}

.profile-title {
  background-color: $primary-color;
  color: white;
  font-family: $font-family-base;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.filters-container {
  background-color: $light-gray;
  border-radius: $border-radius;
  padding: 1rem;
}

.v-input {
  padding: 12px !important;
}

.btn-wrapper {
  padding: 12px;
}

.workout-card {
  margin-bottom: 1rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
  }
}

:deep(.v-field) {
  border-radius: $border-radius !important;
}

.v-btn {
  font-family: $font-family-base;
  border-radius: $border-radius;
}
</style>