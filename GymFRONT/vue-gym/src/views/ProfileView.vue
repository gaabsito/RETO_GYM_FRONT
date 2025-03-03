<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useWorkoutStore } from '@/stores/workouts'
import type { VForm } from 'vuetify/components'
import type { User } from '@/types/User'
import type { Workout } from '@/types/Workout'
import WorkoutCard from '@/components/WorkoutCard.vue'

// Store Initialization
const authStore = useAuthStore()
const workoutStore = useWorkoutStore()

// Form References and State
const formRef = ref<VForm | null>(null)
const loading = ref({
  profile: false,
  workouts: false
})
const error = ref({
  profile: '',
  workouts: ''
})

// Personal Information Form
const personalForm = ref({
  nombre: '',
  apellido: '',
  email: ''
})

// Password Change State
const passwordState = ref({
  isChanging: false,
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Workouts Filtering
const workoutsFilter = ref({
  searchQuery: '',
  selectedDifficulty: null as string | null,
  userWorkouts: [] as Workout[]
})

const difficulties = ['Fácil', 'Media', 'Difícil']

// Validation Rules
const rules = {
  required: (v: string) => !!v || 'Este campo es requerido',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Debe ser un email válido',
  password: (v: string) => v.length >= 6 || 'La contraseña debe tener al menos 6 caracteres',
  passwordMatch: (v: string) => v === passwordState.value.newPassword || 'Las contraseñas no coinciden'
}

// Lifecycle Hook: Load User Data and Workouts
onMounted(async () => {
  try {
    loading.value.profile = true
    loading.value.workouts = true

    // Fetch User Profile
    const userData = await authStore.fetchUser()
    if (userData) {
      personalForm.value = {
        nombre: userData.nombre,
        apellido: userData.apellido,
        email: userData.email
      }
    }

    // Fetch Workouts
    await workoutStore.fetchWorkouts()
    workoutsFilter.value.userWorkouts = workoutStore.workouts.filter(
      workout => workout.autorID === userData?.usuarioID
    )
  } catch (err) {
    error.value.profile = err instanceof Error 
      ? err.message 
      : 'Error al cargar el perfil'
  } finally {
    loading.value.profile = false
    loading.value.workouts = false
  }
})

// Computed: Filtered Workouts
const filteredWorkouts = computed(() => 
  workoutsFilter.value.userWorkouts.filter(workout => {
    const matchesSearch = 
      workout.titulo.toLowerCase().includes(workoutsFilter.value.searchQuery.toLowerCase()) ||
      (workout.descripcion?.toLowerCase().includes(workoutsFilter.value.searchQuery.toLowerCase()) ?? false)

    const matchesDifficulty = !workoutsFilter.value.selectedDifficulty || 
      workout.dificultad === workoutsFilter.value.selectedDifficulty

    return matchesSearch && matchesDifficulty
  })
)

// Method: Update Profile
const updateProfile = async () => {
  if (!formRef.value) return

  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    loading.value.profile = true
    error.value.profile = ''

    const updateData: Partial<User> & { 
      currentPassword?: string, 
      newPassword?: string 
    } = {
      nombre: personalForm.value.nombre,
      apellido: personalForm.value.apellido,
      email: personalForm.value.email
    }

    // Handle Password Change
    if (passwordState.value.isChanging) {
      updateData.currentPassword = passwordState.value.currentPassword
      updateData.newPassword = passwordState.value.newPassword
    }

    await authStore.updateProfile(updateData)

    // Reset Password Change State
    passwordState.value = {
      isChanging: false,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (err: any) {
    error.value.profile = err.message || 'Error al actualizar el perfil'
  } finally {
    loading.value.profile = false
  }
}

// Method: Delete Workout
const deleteWorkout = async (workoutId: number) => {
  try {
    // Extensive logging for debugging
    console.log('Workout Store:', workoutStore)
    console.log('Attempting to delete workout:', workoutId)
    console.log('Workout Store Methods:', Object.keys(workoutStore))
    
    // Explicit checks for deleteWorkout method
    if (!workoutStore.deleteWorkout) {
      console.error('deleteWorkout method is missing')
      throw new Error('deleteWorkout method is not available')
    }

    // Confirmation dialog
    const confirmDelete = confirm('¿Estás seguro de que deseas eliminar este entrenamiento?')
    
    if (confirmDelete) {
      // Attempt to delete the workout
      const result = await workoutStore.deleteWorkout(workoutId)
      console.log('Delete result:', result)
      
      // Update local workouts list
      workoutsFilter.value.userWorkouts = workoutsFilter.value.userWorkouts.filter(
        w => w.entrenamientoID !== workoutId
      )
    }
  } catch (err) {
    // Comprehensive error handling
    console.error('Detailed Delete Workout Error:', err)
    error.value.workouts = err instanceof Error 
      ? err.message 
      : 'Error al eliminar entrenamiento'
    
    // Optional: Show error to user
    alert(error.value.workouts)
  }
}

// Method: Clear Workout Filters
const clearWorkoutFilters = () => {
  workoutsFilter.value.searchQuery = ''
  workoutsFilter.value.selectedDifficulty = null
}
</script>

<template>
  <v-container fluid>
    <v-row>
      <!-- Personal Information Section -->
      <v-col cols="12" md="5">
        <v-card>
          <v-card-title class="bg-primary text-white">
            Información Personal
          </v-card-title>
          
          <v-card-text>
            <!-- Error Alert -->
            <v-alert 
              v-if="error.profile" 
              type="error" 
              class="mb-4"
            >
              {{ error.profile }}
            </v-alert>

            <v-form 
              ref="formRef" 
              @submit.prevent="updateProfile"
              :disabled="loading.profile"
            >
              <v-text-field
                v-model="personalForm.nombre"
                label="Nombre"
                prepend-inner-icon="mdi-account"
                :rules="[rules.required]"
                variant="outlined"
                required
              />

              <v-text-field
                v-model="personalForm.apellido"
                label="Apellido"
                prepend-inner-icon="mdi-account"
                :rules="[rules.required]"
                variant="outlined"
                required
              />

              <v-text-field
                v-model="personalForm.email"
                label="Email"
                prepend-inner-icon="mdi-email"
                :rules="[rules.required, rules.email]"
                type="email"
                variant="outlined"
                required
              />

              <!-- Password Change Section -->
              <v-expansion-panels v-model="passwordState.isChanging">
                <v-expansion-panel>
                  <v-expansion-panel-title>Cambiar Contraseña</v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-text-field
                      v-model="passwordState.currentPassword"
                      label="Contraseña Actual"
                      :rules="[rules.required, rules.password]"
                      type="password"
                      variant="outlined"
                    />
                    <v-text-field
                      v-model="passwordState.newPassword"
                      label="Nueva Contraseña"
                      :rules="[rules.required, rules.password]"
                      type="password"
                      variant="outlined"
                    />
                    <v-text-field
                      v-model="passwordState.confirmPassword"
                      label="Confirmar Contraseña"
                      :rules="[rules.required, rules.passwordMatch]"
                      type="password"
                      variant="outlined"
                    />
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>

              <v-btn
                type="submit"
                color="primary"
                block
                class="mt-4"
                :loading="loading.profile"
              >
                Guardar Cambios
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Workouts Section -->
      <v-col cols="12" md="7">
        <v-card>
          <v-card-title class="bg-primary text-white">
            Mis Entrenamientos
            <v-spacer />
            <v-btn 
              color="white" 
              variant="text"
              to="/crear-entrenamiento"
              prepend-icon="mdi-plus"
            >
              Crear Nuevo
            </v-btn>
          </v-card-title>
          
          <v-card-text>
            <!-- Workouts Filters -->
            <v-row class="mb-4">
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="workoutsFilter.searchQuery"
                  label="Buscar entrenamientos"
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  clearable
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="workoutsFilter.selectedDifficulty"
                  :items="difficulties"
                  label="Dificultad"
                  prepend-inner-icon="mdi-signal-cellular-outline"
                  variant="outlined"
                  clearable
                />
              </v-col>
              <v-col cols="12" md="2" class="d-flex align-center">
                <v-btn 
                  variant="text" 
                  @click="clearWorkoutFilters"
                  :disabled="!workoutsFilter.searchQuery && !workoutsFilter.selectedDifficulty"
                >
                  Limpiar
                </v-btn>
              </v-col>
            </v-row>

            <!-- Error Alert for Workouts -->
            <v-alert 
              v-if="error.workouts" 
              type="error" 
              class="mb-4"
            >
              {{ error.workouts }}
            </v-alert>

            <!-- Loading State -->
            <v-row v-if="loading.workouts" justify="center">
              <v-col cols="12" class="text-center">
                <v-progress-circular 
                  indeterminate 
                  color="primary" 
                  size="64" 
                />
              </v-col>
            </v-row>

            <!-- No Workouts State -->
            <v-row 
              v-else-if="filteredWorkouts.length === 0" 
              justify="center"
            >
              <v-col cols="12" class="text-center">
                <v-icon color="grey" size="x-large" class="mb-4">
                  mdi-dumbbell-off
                </v-icon>
                <p class="text-h6 grey--text">
                  Aún no has creado ningún entrenamiento
                </p>
                <v-btn 
                  color="primary" 
                  to="/crear-entrenamiento"
                  class="mt-4"
                >
                  Crear Primer Entrenamiento
                </v-btn>
              </v-col>
            </v-row>

            <!-- Workouts List -->
            <v-row v-else>
              <v-col 
                v-for="workout in filteredWorkouts" 
                :key="workout.entrenamientoID"
                cols="12" 
                sm="6"
              >
                <v-card class="mb-4">
                  <WorkoutCard :workout="workout" />
                  <v-card-actions>
                    <v-spacer />
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

<style scoped>
.v-card-title.bg-primary {
  background-color: #e25401 !important;
}
</style>