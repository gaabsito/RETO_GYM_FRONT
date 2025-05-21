<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkoutStore } from '@/stores/workouts'
import { useExerciseStore } from '@/stores/exercises'
import { useAuthStore } from '@/stores/auth'
import SectionContainer from '@/components/SectionContainer.vue'
import type { VForm } from 'vuetify/components'
import type { CreateWorkoutDTO } from '@/types/Workout'
import type { Exercise } from '@/types/Exercise'

const router = useRouter()
const workoutStore = useWorkoutStore()
const exerciseStore = useExerciseStore()
const authStore = useAuthStore()

const formRef = ref<VForm | null>(null)
const loading = ref(false)
const error = ref('')
const success = ref(false)
const exercises = ref<Exercise[]>([])
const selectedExercises = ref<number[]>([])

// Variables para la imagen
const workoutImageFile = ref<File | null>(null)
const workoutImagePreview = ref<string | null>(null)
const imageLoading = ref(false)
const imageError = ref('')

// Formulario del entrenamiento
const form = ref({
  titulo: '',
  descripcion: '',
  duracionMinutos: 30,
  dificultad: 'Media',
  publico: true
})

// Definir los detalles de los ejercicios seleccionados
const exerciseDetails = ref<{[key: number]: {
  series: number, 
  repeticiones: number, 
  descansoSegundos: number, 
  notas: string
}}>({});  // Inicializar como un objeto vacío

// Reglas de validación
const rules = {
  required: (v: string) => !!v || 'Este campo es requerido',
  titulo: [
    (v: string) => !!v || 'El título es requerido',
    (v: string) => v.length <= 100 || 'El título no puede superar los 100 caracteres'
  ],
  descripcion: [
    (v: string) => v.length <= 500 || 'La descripción no puede superar los 500 caracteres'
  ],
  duracion: [
    (v: number) => v >= 5 || 'La duración mínima es de 5 minutos',
    (v: number) => v <= 300 || 'La duración máxima es de 300 minutos'
  ],
  dificultad: [
    (v: string) => ['Fácil', 'Media', 'Difícil'].includes(v) || 'Dificultad no válida'
  ],
  series: [
    (v: number) => v >= 1 || 'Mínimo 1 serie',
    (v: number) => v <= 10 || 'Máximo 10 series'
  ],
  repeticiones: [
    (v: number) => v >= 1 || 'Mínimo 1 repetición',
    (v: number) => v <= 50 || 'Máximo 50 repeticiones'
  ],
  descanso: [
    (v: number) => v >= 10 || 'Mínimo 10 segundos',
    (v: number) => v <= 300 || 'Máximo 300 segundos'
  ],
  notas: [
    (v: string) => v.length <= 100 || 'Las notas no pueden superar los 100 caracteres'
  ],
  // Reglas para la imagen
  imageSize: (v: File) => !v || v.size <= 5 * 1024 * 1024 || 'La imagen no debe exceder 5MB',
  imageType: (v: File) => !v || ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(v.type) || 'Formato no soportado. Use JPG, PNG, GIF o WEBP'
}

// Cargar ejercicios disponibles
onMounted(async () => {
  try {
    if (!authStore.isAuthenticated) {
      router.push('/login?redirect=/crear-entrenamiento')
      return
    }
    
    loading.value = true
    await exerciseStore.fetchExercises()
    exercises.value = exerciseStore.exercises
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al cargar los ejercicios'
  } finally {
    loading.value = false
  }
})

// Manejar la carga de imagen
const handleImageUpload = (file: File | null) => {
  workoutImageFile.value = file
  
  if (file) {
    // Validar el archivo
    if (file.size > 5 * 1024 * 1024) {
      imageError.value = 'La imagen no debe exceder 5MB'
      workoutImageFile.value = null
      return
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      imageError.value = 'Formato no soportado. Use JPG, PNG, GIF o WEBP'
      workoutImageFile.value = null
      return
    }
    
    // Crear preview de la imagen
    const reader = new FileReader()
    reader.onload = (e) => {
      workoutImagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
    
    imageError.value = ''
  } else {
    workoutImagePreview.value = null
  }
}

// Añadir ejercicio seleccionado a la lista
const addExercise = (ejercicioID: number) => {
  if (!selectedExercises.value.includes(ejercicioID)) {
    selectedExercises.value.push(ejercicioID)
    
    // Inicializar los detalles del ejercicio con valores por defecto
    exerciseDetails.value[ejercicioID] = {
      series: 3,
      repeticiones: 12,
      descansoSegundos: 60,
      notas: ''
    }
  }
}

// Eliminar ejercicio de la lista
const removeExercise = (ejercicioID: number) => {
  selectedExercises.value = selectedExercises.value.filter(id => id !== ejercicioID)
  if (exerciseDetails.value && ejercicioID in exerciseDetails.value) {
    delete exerciseDetails.value[ejercicioID]
  }
}

// Obtener el ejercicio por ID
const getExerciseById = (id: number): Exercise | undefined => {
  return exercises.value.find(exercise => exercise.ejercicioID === id)
}

// Manejar cambios en la selección de ejercicios
const handleExercisesChange = (value: number[]) => {
  // Asegurarse de que exerciseDetails.value existe
  if (!exerciseDetails.value) {
    exerciseDetails.value = {}
  }
  
  // Mantener solo los ejercicios que estén en la selección actual
  if (exerciseDetails.value) {
    Object.keys(exerciseDetails.value).forEach(key => {
      const numericKey = parseInt(key)
      if (!value.includes(numericKey)) {
        delete exerciseDetails.value[numericKey]
      }
    })
  }
  
  // Añadir nuevos ejercicios al detalle
  value.forEach(ejercicioID => {
    if (!exerciseDetails.value[ejercicioID]) {
      exerciseDetails.value[ejercicioID] = {
        series: 3,
        repeticiones: 12,
        descansoSegundos: 60,
        notas: ''
      }
    }
  })
}

// Enviar el formulario
const handleSubmit = async () => {
  if (!formRef.value) return
  
  const { valid } = await formRef.value.validate()
  
  if (!valid) return
  
  if (selectedExercises.value.length === 0) {
    error.value = 'Debes seleccionar al menos un ejercicio'
    return
  }

  try {
    loading.value = true
    error.value = ''
    
    // Crear FormData para enviar datos e imagen
    const formData = new FormData()
    
    // Agregar datos del entrenamiento
    formData.append('titulo', form.value.titulo)
    formData.append('descripcion', form.value.descripcion || '')
    formData.append('duracionMinutos', form.value.duracionMinutos.toString())
    formData.append('dificultad', form.value.dificultad)
    formData.append('publico', form.value.publico.toString())
    
    // Agregar imagen si existe
    if (workoutImageFile.value) {
      formData.append('imagen', workoutImageFile.value)
    }
    
    // Agregar ejercicios como JSON string en un campo de FormData
    const ejerciciosData = selectedExercises.value.map(ejercicioID => ({
      ejercicioID,
      series: exerciseDetails.value[ejercicioID].series,
      repeticiones: exerciseDetails.value[ejercicioID].repeticiones,
      descansoSegundos: exerciseDetails.value[ejercicioID].descansoSegundos,
      notas: exerciseDetails.value[ejercicioID].notas || undefined
    }))
    
    formData.append('ejercicios', JSON.stringify(ejerciciosData))
    
    // Usar el metodo directo de fetch en lugar del metodo del store
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/Entrenamiento`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      },
      body: formData
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Error al crear entrenamiento')
    }
    
    const data = await response.json()
    
    if (data.success) {
      // Actualizar la tienda después de crear
      await workoutStore.fetchWorkouts()
      success.value = true
      
      // Redirigir a "Mis Entrenamientos" después de unos segundos
      setTimeout(() => {
        router.push('/mis-entrenamientos')
      }, 2000)
    } else {
      throw new Error(data.message || 'Error al crear entrenamiento')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al crear el entrenamiento'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-container>
    <SectionContainer title="Crear Nuevo Entrenamiento">
      <v-alert v-if="error" type="error" class="mb-6">
        {{ error }}
      </v-alert>

      <v-alert v-if="success" type="success" class="mb-6">
        Entrenamiento creado correctamente. Redirigiendo...
      </v-alert>

      <v-form ref="formRef" @submit.prevent="handleSubmit" v-if="!success">
        <!-- Información básica del entrenamiento -->
        <v-card class="mb-6 workout-card">
          <v-card-title class="workout-title">
            Información básica
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="form.titulo"
                  :rules="rules.titulo"
                  label="Título del entrenamiento"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="form.descripcion"
                  :rules="rules.descripcion"
                  label="Descripción"
                  variant="outlined"
                  rows="3"
                ></v-textarea>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="form.dificultad"
                  :items="['Fácil', 'Media', 'Difícil']"
                  :rules="rules.dificultad"
                  label="Dificultad"
                  variant="outlined"
                  required
                ></v-select>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="form.duracionMinutos"
                  :rules="rules.duracion"
                  label="Duración (minutos)"
                  type="number"
                  min="5"
                  max="300"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-switch
                  v-model="form.publico"
                  color="primary"
                  label="Entrenamiento público"
                  hint="Los entrenamientos públicos pueden ser vistos por todos los usuarios"
                  persistent-hint
                ></v-switch>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Sección para subir imagen -->
        <v-card class="mb-6 workout-card">
          <v-card-title class="workout-title">
            Imagen del Entrenamiento
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6" class="preview-container">
                <div class="text-center">
                  <v-img
                    v-if="workoutImagePreview"
                    :src="workoutImagePreview"
                    max-height="300"
                    contain
                    class="mb-2 workout-preview"
                  ></v-img>
                  <div v-else class="empty-image-placeholder">
                    <v-icon size="64" class="mb-2">mdi-image-outline</v-icon>
                    <div>Imagen de Entrenamiento</div>
                  </div>
                </div>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-file-input
                  v-model="workoutImageFile"
                  accept="image/*"
                  label="Seleccionar imagen del entrenamiento"
                  prepend-icon="mdi-image"
                  show-size
                  variant="outlined"
                  @update:model-value="handleImageUpload"
                  :error-messages="imageError"
                  hint="La imagen ayudará a los usuarios a identificar tu entrenamiento. Máximo 5MB."
                  persistent-hint
                ></v-file-input>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Selección de ejercicios -->
        <v-card class="mb-6 workout-card">
          <v-card-title class="workout-title">
            Añadir ejercicios
          </v-card-title>
          <v-card-text>
            <v-autocomplete
              v-model="selectedExercises"
              :items="exercises"
              item-title="nombre"
              item-value="ejercicioID"
              label="Buscar y seleccionar ejercicios"
              variant="outlined"
              multiple
              chips
              closable-chips
              @update:model-value="handleExercisesChange"
            >
              <template v-slot:selection="{ item }">
                <v-chip>
                  {{ item.title }}
                </v-chip>
              </template>
              <template v-slot:item="{ item, props }">
                <v-list-item
                  v-bind="props"
                  :title="item.raw.nombre"
                  :subtitle="item.raw.grupoMuscular"
                >
                  <template v-slot:prepend>
                    <v-avatar
                      size="40"
                      color="grey-lighten-3"
                      class="me-3"
                    >
                      <v-img
                        v-if="item.raw.imagenURL"
                        :src="item.raw.imagenURL"
                        cover
                      ></v-img>
                      <v-icon v-else>mdi-dumbbell</v-icon>
                    </v-avatar>
                  </template>
                  <template v-slot:append>
                    <v-badge
                      v-if="item.raw.equipamientoNecesario"
                      dot
                      color="primary"
                      title="Requiere equipamiento"
                    ></v-badge>
                  </template>
                </v-list-item>
              </template>
            </v-autocomplete>
          </v-card-text>
        </v-card>

        <!-- Detalles de ejercicios seleccionados -->
        <v-card v-if="selectedExercises.length > 0" class="mb-6 workout-card">
          <v-card-title class="workout-title-custom">
            Configurar ejercicios
          </v-card-title>
          <v-card-text>
            <v-expansion-panels variant="accordion">
              <v-expansion-panel
                v-for="ejercicioID in selectedExercises"
                :key="ejercicioID"
              >
                <v-expansion-panel-title>
                  <div class="d-flex align-center">
                    <v-avatar
                      size="36"
                      color="grey-lighten-3"
                      class="me-3"
                    >
                      <v-img
                        v-if="getExerciseById(ejercicioID)?.imagenURL"
                        :src="getExerciseById(ejercicioID)?.imagenURL"
                        cover
                      ></v-img>
                      <v-icon v-else>mdi-dumbbell</v-icon>
                    </v-avatar>
                    {{ getExerciseById(ejercicioID)?.nombre }}
                  </div>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-row>
                    <v-col cols="12" sm="4">
                      <v-text-field
                        v-model.number="exerciseDetails[ejercicioID].series"
                        :rules="rules.series"
                        label="Series"
                        type="number"
                        min="1"
                        max="10"
                        variant="outlined"
                        required
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="4">
                      <v-text-field
                        v-model.number="exerciseDetails[ejercicioID].repeticiones"
                        :rules="rules.repeticiones"
                        label="Repeticiones"
                        type="number"
                        min="1"
                        max="50"
                        variant="outlined"
                        required
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="4">
                      <v-text-field
                        v-model.number="exerciseDetails[ejercicioID].descansoSegundos"
                        :rules="rules.descanso"
                        label="Descanso (seg)"
                        type="number"
                        min="10"
                        max="300"
                        variant="outlined"
                        required
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-text-field
                        v-model="exerciseDetails[ejercicioID].notas"
                        :rules="rules.notas"
                        label="Notas (opcional)"
                        variant="outlined"
                        hint="Añade indicaciones específicas para este ejercicio"
                        persistent-hint
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" class="text-right">
                      <v-btn
                        color="error"
                        variant="text"
                        @click="removeExercise(ejercicioID)"
                      >
                        Eliminar ejercicio
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-card>

        <!-- Botones de acción -->
        <div class="d-flex justify-space-between align-center mt-6">
          <v-btn
            color="red"
            size="large"
            variant="outlined"
            :to="'/workouts'"
            :disabled="loading"
          >
            Cancelar
          </v-btn>
          
          <v-btn
            type="submit"
            color="primary"
            size="large"
            :loading="loading"
            :disabled="loading"
          >
            Crear Entrenamiento
          </v-btn>
        </div>
      </v-form>
    </SectionContainer>
  </v-container>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.workout-card {
  border-radius: $border-radius;
  overflow: hidden;
}

.workout-title {
  background-color: $primary-color;
  color: white;
  font-family: $font-family-base;
  font-size: 1.25rem;
  font-weight: 500;
}

.workout-title-custom {
  background-color: $primary-color;
  color: white;
  font-family: $font-family-base;
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 0px !important;
}

.v-card-title {
  padding: 12px !important;
  margin-bottom: 1rem;
}

.v-input {
  padding: 12px !important;
}

.section-container {
  padding: 0px !important;
  margin-top: 2.5rem !important;
}

.v-expansion-panel {
  margin-bottom: 0px !important;
}

.v-btn {
  padding-right: 12px !important;
  padding-left: 12px !important;
  font-family: $font-family-base;
  border-radius: $border-radius;
}

:deep(.v-field) {
  border-radius: $border-radius !important;
}

:deep(.v-expansion-panel) {
  border-radius: $border-radius;
  margin-bottom: 8px;
}

:deep(.v-expansion-panel-title) {
  padding: 16px;
}

.preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.workout-preview {
  border-radius: $border-radius;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-image-placeholder {
  width: 100%;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: $border-radius;
  color: #757575;
}

// Responsive adjustments
@media (max-width: 600px) {
  .workout-title {
    font-size: 1.1rem;
    padding: 12px 16px;
  }
  
  .empty-image-placeholder {
    height: 150px;
  }
}
</style>