<template>
  <v-container fluid class="admin-workouts">
    <!-- Header -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h1 class="text-h4 font-weight-bold">Gestión de Entrenamientos</h1>
            <p class="text-subtitle-1 text-medium-emphasis">
              Administra todos los entrenamientos de la plataforma
            </p>
          </div>
          <v-btn
            color="primary"
            size="large"
            @click="openCreateDialog"
            prepend-icon="mdi-plus"
          >
            Crear Entrenamiento
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="search"
          label="Buscar entrenamientos"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          clearable
          hide-details
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="difficultyFilter"
          :items="difficulties"
          label="Dificultad"
          variant="outlined"
          clearable
          hide-details
        ></v-select>
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="publicFilter"
          :items="publicOptions"
          label="Visibilidad"
          variant="outlined"
          clearable
          hide-details
        ></v-select>
      </v-col>
      <v-col cols="12" md="2">
        <v-btn @click="clearFilters" variant="outlined" block>
          Limpiar
        </v-btn>
      </v-col>
    </v-row>

    <!-- Workouts Grid -->
    <v-row v-if="!adminStore.workoutLoading && filteredWorkouts.length > 0">
      <v-col
        v-for="workout in filteredWorkouts"
        :key="workout.entrenamientoID"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card class="workout-card" elevation="2">
          <v-img
            :src="workout.imagenURL || '/api/placeholder/400/200'"
            height="180"
            cover
            class="workout-image"
          >
            <template v-slot:placeholder>
              <v-row class="fill-height ma-0" align="center" justify="center">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </v-row>
            </template>
          </v-img>

          <v-card-title class="workout-title">
            <div class="text-truncate">{{ workout.titulo }}</div>
          </v-card-title>

          <v-card-subtitle class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-chip 
                :color="getDifficultyColor(workout.dificultad)" 
                size="small" 
                class="mr-2"
              >
                {{ workout.dificultad }}
              </v-chip>
              <span>{{ workout.duracionMinutos }} min</span>
            </div>
            <v-chip
              :color="workout.publico ? 'success' : 'warning'"
              size="small"
              variant="flat"
            >
              {{ workout.publico ? 'Público' : 'Privado' }}
            </v-chip>
          </v-card-subtitle>

          <v-card-text>
            <p class="text-truncate-2">{{ workout.descripcion || 'Sin descripción' }}</p>
            <div class="text-caption text-medium-emphasis mt-2">
              Creado: {{ formatDate(workout.fechaCreacion) }}
            </div>
          </v-card-text>

          <v-card-actions>
            <v-btn
              size="small"
              color="primary"
              variant="text"
              @click="editWorkout(workout)"
              prepend-icon="mdi-pencil"
            >
              Editar
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              size="small"
              color="error"
              variant="text"
              @click="deleteWorkout(workout)"
              icon="mdi-delete"
            ></v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <v-row v-else-if="adminStore.workoutLoading" justify="center">
      <v-col cols="12" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="mt-4 text-h6">Cargando entrenamientos...</p>
      </v-col>
    </v-row>

    <!-- Empty State -->
    <v-row v-else justify="center">
      <v-col cols="12" class="text-center py-8">
        <v-icon size="64" color="grey-lighten-1">mdi-dumbbell-off</v-icon>
        <h3 class="text-h5 mt-4 mb-2">No hay entrenamientos</h3>
        <p class="text-subtitle-1 text-medium-emphasis mb-4">
          Comienza creando el primer entrenamiento
        </p>
        <v-btn color="primary" @click="openCreateDialog" prepend-icon="mdi-plus">
          Crear Entrenamiento
        </v-btn>
      </v-col>
    </v-row>

    <!-- Create/Edit Workout Dialog -->
    <v-dialog v-model="showDialog" max-width="700">
      <v-card>
        <v-card-title>
          {{ editingWorkout ? 'Editar Entrenamiento' : 'Crear Entrenamiento' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="workoutForm" v-model="formValid">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="workoutFormData.titulo"
                  label="Título"
                  :rules="[v => !!v || 'El título es requerido']"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="workoutFormData.descripcion"
                  label="Descripción"
                  variant="outlined"
                  rows="3"
                ></v-textarea>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="workoutFormData.dificultad"
                  :items="difficulties"
                  label="Dificultad"
                  :rules="[v => !!v || 'La dificultad es requerida']"
                  variant="outlined"
                  required
                ></v-select>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="workoutFormData.duracionMinutos"
                  label="Duración (minutos)"
                  type="number"
                  min="1"
                  max="300"
                  :rules="[
                    v => !!v || 'La duración es requerida',
                    v => v > 0 || 'La duración debe ser mayor a 0',
                    v => v <= 300 || 'La duración debe ser menor a 300 minutos'
                  ]"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="workoutFormData.imagenURL"
                  label="URL de imagen (opcional)"
                  variant="outlined"
                  hint="URL de la imagen del entrenamiento"
                  persistent-hint
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="workoutFormData.autorID"
                  label="ID del autor (opcional)"
                  type="number"
                  min="1"
                  variant="outlined"
                  hint="ID del usuario autor del entrenamiento"
                  persistent-hint
                ></v-text-field>
              </v-col>
              <v-col cols="6" class="d-flex align-center">
                <v-checkbox
                  v-model="workoutFormData.publico"
                  label="Entrenamiento público"
                  color="success"
                ></v-checkbox>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="closeDialog" variant="text">Cancelar</v-btn>
          <v-btn
            @click="saveWorkout"
            color="primary"
            :loading="adminStore.loading"
            :disabled="!formValid"
          >
            {{ editingWorkout ? 'Actualizar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title>Confirmar Eliminación</v-card-title>
        <v-card-text>
          ¿Estás seguro de que deseas eliminar el entrenamiento <strong>{{ workoutToDelete?.titulo }}</strong>?
          Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showDeleteDialog = false" variant="text">Cancelar</v-btn>
          <v-btn
            @click="confirmDelete"
            color="error"
            :loading="adminStore.loading"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for notifications -->
    <v-snackbar v-model="showSnackbar" :color="snackbarColor" :timeout="3000">
      {{ snackbarMessage }}
      <template v-slot:actions>
        <v-btn variant="text" @click="showSnackbar = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminStore, type AdminWorkout } from '@/stores/admin'

const adminStore = useAdminStore()

// Reactive data
const search = ref('')
const difficultyFilter = ref(null)
const publicFilter = ref(null)
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const editingWorkout = ref<AdminWorkout | null>(null)
const workoutToDelete = ref<AdminWorkout | null>(null)
const formValid = ref(false)
const workoutForm = ref()

// Snackbar
const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

// Form data
const workoutFormData = ref({
  titulo: '',
  descripcion: '',
  dificultad: '',
  duracionMinutos: 30,
  imagenURL: '',
  publico: true,
  autorID: null as number | null,
})

// Filter options
const difficulties = ['Fácil', 'Media', 'Difícil']

const publicOptions = [
  { title: 'Públicos', value: true },
  { title: 'Privados', value: false }
]

// Computed
const filteredWorkouts = computed(() => {
  let workouts = adminStore.workouts

  if (search.value) {
    workouts = workouts.filter(workout =>
      workout.titulo.toLowerCase().includes(search.value.toLowerCase()) ||
      workout.descripcion.toLowerCase().includes(search.value.toLowerCase())
    )
  }

  if (difficultyFilter.value) {
    workouts = workouts.filter(workout => workout.dificultad === difficultyFilter.value)
  }

  if (publicFilter.value !== null) {
    workouts = workouts.filter(workout => workout.publico === publicFilter.value)
  }

  return workouts
})

// Methods
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Fácil': return 'success'
    case 'Media': return 'warning'
    case 'Difícil': return 'error'
    default: return 'primary'
  }
}

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('es-ES')
}

const clearFilters = () => {
  search.value = ''
  difficultyFilter.value = null
  publicFilter.value = null
}

const openCreateDialog = () => {
  editingWorkout.value = null
  workoutFormData.value = {
    titulo: '',
    descripcion: '',
    dificultad: '',
    duracionMinutos: 30,
    imagenURL: '',
    publico: true,
    autorID: null,
  }
  showDialog.value = true
}

const editWorkout = (workout: AdminWorkout) => {
  editingWorkout.value = workout
  workoutFormData.value = {
    titulo: workout.titulo,
    descripcion: workout.descripcion,
    dificultad: workout.dificultad,
    duracionMinutos: workout.duracionMinutos,
    imagenURL: workout.imagenURL || '',
    publico: workout.publico,
    autorID: workout.autorID || null,
  }
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  editingWorkout.value = null
  workoutForm.value?.reset()
}

const saveWorkout = async () => {
  if (!workoutForm.value?.validate()) return

  try {
    if (editingWorkout.value) {
      await adminStore.updateWorkout(editingWorkout.value.entrenamientoID, workoutFormData.value)
      showNotification('Entrenamiento actualizado correctamente', 'success')
    } else {
      await adminStore.createWorkout(workoutFormData.value)
      showNotification('Entrenamiento creado correctamente', 'success')
    }
    closeDialog()
  } catch (error) {
    showNotification(adminStore.error || 'Error al guardar entrenamiento', 'error')
  }
}

const deleteWorkout = (workout: AdminWorkout) => {
  workoutToDelete.value = workout
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!workoutToDelete.value) return

  try {
    await adminStore.deleteWorkout(workoutToDelete.value.entrenamientoID)
    showNotification('Entrenamiento eliminado correctamente', 'success')
    showDeleteDialog.value = false
    workoutToDelete.value = null
  } catch (error) {
    showNotification(adminStore.error || 'Error al eliminar entrenamiento', 'error')
  }
}

const showNotification = (message: string, color: string) => {
  snackbarMessage.value = message
  snackbarColor.value = color
  showSnackbar.value = true
}

// Lifecycle
onMounted(() => {
  adminStore.fetchWorkouts()
})
</script>

<style scoped>
.admin-workouts {
  padding: 16px;
}

.workout-card {
  height: 100%;
  transition: transform 0.2s ease-in-out;
}

.workout-card:hover {
  transform: translateY(-4px);
}

.workout-image {
  border-radius: 4px 4px 0 0;
}

.workout-title {
  background-color: #1976D2;
  color: white;
  padding: 12px 16px;
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  max-height: calc(1.4em * 2);
}

@media (max-width: 600px) {
  .admin-workouts {
    padding: 8px;
  }
  
  .text-h4 {
    font-size: 1.5rem !important;
  }
}
</style>