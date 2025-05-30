<template>
  <v-container fluid class="admin-exercises">
    <!-- Header -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h1 class="text-h4 font-weight-bold">Gestión de Ejercicios</h1>
            <p class="text-subtitle-1 text-medium-emphasis">
              Administra todos los ejercicios de la plataforma
            </p>
          </div>
          <v-btn
            color="primary"
            size="large"
            @click="openCreateDialog"
            prepend-icon="mdi-plus"
          >
            Crear Ejercicio
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="search"
          label="Buscar ejercicios"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          clearable
          hide-details
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="muscleGroupFilter"
          :items="muscleGroups"
          label="Grupo muscular"
          variant="outlined"
          clearable
          hide-details
        ></v-select>
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="equipmentFilter"
          :items="equipmentOptions"
          label="Equipamiento"
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

    <!-- Exercises Grid -->
    <v-row v-if="!adminStore.exerciseLoading && filteredExercises.length > 0">
      <v-col
        v-for="exercise in filteredExercises"
        :key="exercise.ejercicioID"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card class="exercise-card" elevation="2">
          <v-img
            :src="exercise.imagenURL || '/api/placeholder/400/200'"
            height="180"
            cover
            class="exercise-image"
          >
            <template v-slot:placeholder>
              <v-row class="fill-height ma-0" align="center" justify="center">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </v-row>
            </template>
            
            <!-- Equipment badge -->
            <v-chip
              v-if="exercise.equipamientoNecesario"
              class="equipment-badge"
              color="warning"
              size="small"
            >
              <v-icon start size="small">mdi-dumbbell</v-icon>
              Equipamiento
            </v-chip>
          </v-img>

          <v-card-title class="exercise-title">
            <div class="text-truncate">{{ exercise.nombre }}</div>
          </v-card-title>

          <v-card-subtitle>
            <v-chip
              :color="getMuscleGroupColor(exercise.grupoMuscular)"
              size="small"
              variant="flat"
            >
              {{ exercise.grupoMuscular || 'Sin grupo' }}
            </v-chip>
          </v-card-subtitle>

          <v-card-text>
            <p class="text-truncate-2">{{ exercise.descripcion || 'Sin descripción' }}</p>
            
            <div class="mt-2 d-flex align-center">
              <v-btn
                v-if="exercise.videoURL"
                size="x-small"
                color="red"
                variant="outlined"
                :href="exercise.videoURL"
                target="_blank"
                prepend-icon="mdi-youtube"
                class="mr-2"
              >
                Video
              </v-btn>
              <v-chip
                :color="exercise.equipamientoNecesario ? 'warning' : 'success'"
                size="x-small"
                variant="flat"
              >
                {{ exercise.equipamientoNecesario ? 'Con equipo' : 'Sin equipo' }}
              </v-chip>
            </div>
          </v-card-text>

          <v-card-actions>
            <v-btn
              size="small"
              color="primary"
              variant="text"
              @click="editExercise(exercise)"
              prepend-icon="mdi-pencil"
            >
              Editar
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              size="small"
              color="error"
              variant="text"
              @click="deleteExercise(exercise)"
              icon="mdi-delete"
            ></v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <v-row v-else-if="adminStore.exerciseLoading" justify="center">
      <v-col cols="12" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="mt-4 text-h6">Cargando ejercicios...</p>
      </v-col>
    </v-row>

    <!-- Empty State -->
    <v-row v-else justify="center">
      <v-col cols="12" class="text-center py-8">
        <v-icon size="64" color="grey-lighten-1">mdi-arm-flex-outline</v-icon>
        <h3 class="text-h5 mt-4 mb-2">No hay ejercicios</h3>
        <p class="text-subtitle-1 text-medium-emphasis mb-4">
          Comienza creando el primer ejercicio
        </p>
        <v-btn color="primary" @click="openCreateDialog" prepend-icon="mdi-plus">
          Crear Ejercicio
        </v-btn>
      </v-col>
    </v-row>

    <!-- Create/Edit Exercise Dialog -->
    <v-dialog v-model="showDialog" max-width="700">
      <v-card>
        <v-card-title>
          {{ editingExercise ? 'Editar Ejercicio' : 'Crear Ejercicio' }}
        </v-card-title>
        <v-card-text class="pb-0">
          <v-form ref="exerciseForm" v-model="formValid">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="exerciseFormData.nombre"
                  label="Nombre del ejercicio"
                  :rules="[v => !!v || 'El nombre es requerido']"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="exerciseFormData.descripcion"
                  label="Descripción"
                  variant="outlined"
                  rows="3"
                  hint="Describe cómo realizar el ejercicio"
                  persistent-hint
                ></v-textarea>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="exerciseFormData.grupoMuscular"
                  :items="muscleGroups"
                  label="Grupo muscular"
                  variant="outlined"
                  hint="Selecciona el grupo muscular principal"
                  persistent-hint
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="exerciseFormData.imagenURL"
                  label="URL de imagen (obligatorio)"
                  variant="outlined"
                  hint="URL de la imagen del ejercicio"
                  persistent-hint
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="exerciseFormData.videoURL"
                  label="URL de video (obligatorio)"
                  variant="outlined"
                  hint="URL del video demostrativo (YouTube, etc.)"
                  persistent-hint
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-checkbox
                  v-model="exerciseFormData.equipamientoNecesario"
                  label="Requiere equipamiento"
                  color="warning"
                  hint="Marca si el ejercicio necesita equipamiento específico"
                  persistent-hint
                ></v-checkbox>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="closeDialog" variant="text">Cancelar</v-btn>
          <v-btn
            @click="saveExercise"
            color="primary"
            :loading="adminStore.loading"
            :disabled="!formValid"
          >
            {{ editingExercise ? 'Actualizar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title>Confirmar Eliminación</v-card-title>
        <v-card-text>
          ¿Estás seguro de que deseas eliminar el ejercicio <strong>{{ exerciseToDelete?.nombre }}</strong>?
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
import { useAdminStore, type AdminExercise } from '@/stores/admin'

const adminStore = useAdminStore()

// Reactive data
const search = ref('')
const muscleGroupFilter = ref(null)
const equipmentFilter = ref(null)
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const editingExercise = ref<AdminExercise | null>(null)
const exerciseToDelete = ref<AdminExercise | null>(null)
const formValid = ref(false)
const exerciseForm = ref()

// Snackbar
const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

// Form data
const exerciseFormData = ref({
  nombre: '',
  descripcion: '',
  grupoMuscular: '',
  imagenURL: '',
  videoURL: '',
  equipamientoNecesario: false,
})

// Filter options
const muscleGroups = [
  'Pecho', 'Espalda', 'Hombros', 'Brazos', 'Bíceps', 'Tríceps', 
  'Piernas', 'Cuádriceps', 'Isquiotibiales', 'Glúteos', 
  'Abdominales', 'Core', 'Cardio'
]

const equipmentOptions = [
  { title: 'Con equipamiento', value: true },
  { title: 'Sin equipamiento', value: false }
]

// Computed
const filteredExercises = computed(() => {
  let exercises = adminStore.exercises

  if (search.value) {
    exercises = exercises.filter(exercise =>
      exercise.nombre.toLowerCase().includes(search.value.toLowerCase()) ||
      (exercise.descripcion && exercise.descripcion.toLowerCase().includes(search.value.toLowerCase()))
    )
  }

  if (muscleGroupFilter.value) {
    exercises = exercises.filter(exercise => exercise.grupoMuscular === muscleGroupFilter.value)
  }

  if (equipmentFilter.value !== null) {
    exercises = exercises.filter(exercise => exercise.equipamientoNecesario === equipmentFilter.value)
  }

  return exercises
})

// Methods
const getMuscleGroupColor = (group: string | undefined) => {
  const colors: Record<string, string> = {
    'Pecho': 'red',
    'Espalda': 'blue',
    'Hombros': 'orange',
    'Brazos': 'purple',
    'Bíceps': 'purple',
    'Tríceps': 'purple',
    'Piernas': 'green',
    'Cuádriceps': 'green',
    'Isquiotibiales': 'green',
    'Glúteos': 'teal',
    'Abdominales': 'amber',
    'Core': 'amber',
    'Cardio': 'pink'
  }
  return colors[group || ''] || 'grey'
}

const clearFilters = () => {
  search.value = ''
  muscleGroupFilter.value = null
  equipmentFilter.value = null
}

const openCreateDialog = () => {
  editingExercise.value = null
  exerciseFormData.value = {
    nombre: '',
    descripcion: '',
    grupoMuscular: '',
    imagenURL: '',
    videoURL: '',
    equipamientoNecesario: false,
  }
  showDialog.value = true
}

const editExercise = (exercise: AdminExercise) => {
  editingExercise.value = exercise
  exerciseFormData.value = {
    nombre: exercise.nombre,
    descripcion: exercise.descripcion || '',
    grupoMuscular: exercise.grupoMuscular || '',
    imagenURL: exercise.imagenURL || '',
    videoURL: exercise.videoURL || '',
    equipamientoNecesario: exercise.equipamientoNecesario,
  }
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  editingExercise.value = null
  exerciseForm.value?.reset()
}

const saveExercise = async () => {
  if (!exerciseForm.value?.validate()) return

  try {
    if (editingExercise.value) {
      await adminStore.updateExercise(editingExercise.value.ejercicioID, exerciseFormData.value)
      showNotification('Ejercicio actualizado correctamente', 'success')
    } else {
      await adminStore.createExercise(exerciseFormData.value)
      showNotification('Ejercicio creado correctamente', 'success')
    }
    closeDialog()
  } catch (error) {
    showNotification(adminStore.error || 'Error al guardar ejercicio', 'error')
  }
}

const deleteExercise = (exercise: AdminExercise) => {
  exerciseToDelete.value = exercise
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!exerciseToDelete.value) return

  try {
    await adminStore.deleteExercise(exerciseToDelete.value.ejercicioID)
    showNotification('Ejercicio eliminado correctamente', 'success')
    showDeleteDialog.value = false
    exerciseToDelete.value = null
  } catch (error) {
    showNotification(adminStore.error || 'Error al eliminar ejercicio', 'error')
  }
}

const showNotification = (message: string, color: string) => {
  snackbarMessage.value = message
  snackbarColor.value = color
  showSnackbar.value = true
}

// Lifecycle
onMounted(() => {
  adminStore.fetchExercises()
})
</script>

<style scoped>
.admin-exercises {
  padding: 16px;
}

.exercise-card {
  height: 100%;
  transition: transform 0.2s ease-in-out;
}

.exercise-card:hover {
  transform: translateY(-4px);
}

.exercise-image {
  border-radius: 4px 4px 0 0;
  position: relative;
}

.equipment-badge {
  position: absolute;
  top: 8px;
  right: 8px;
}

.exercise-title {
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
  .admin-exercises {
    padding: 8px;
  }
  
  .text-h4 {
    font-size: 1.5rem !important;
  }
}
</style>