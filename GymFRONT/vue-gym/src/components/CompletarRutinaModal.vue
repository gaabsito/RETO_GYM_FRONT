<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRutinasCompletadasStore } from '@/stores/rutinasCompletadas'
import type { RutinaCompletadaCreate } from '@/types/RutinaCompletada'

const props = defineProps<{
  entrenamientoID: number;
  entrenamientoNombre: string;
  duracionRecomendada?: number;
  show: boolean;
}>()

const emit = defineEmits(['update:show', 'completada'])

const rutinasCompletadasStore = useRutinasCompletadasStore()

// Fecha actual por defecto, pero ahora puede modificarse
const fechaSeleccionada = ref(new Date())
// Formateo para el datepicker de Vuetify
const fechaFormateada = computed(() => {
  return fechaSeleccionada.value.toISOString().split('T')[0]
})

// Formulario para la rutina completada
const form = ref<RutinaCompletadaCreate>({
  entrenamientoID: props.entrenamientoID,
  fechaCompletada: fechaSeleccionada.value,
  duracionMinutos: props.duracionRecomendada || undefined,
  caloriasEstimadas: undefined,
  nivelEsfuerzoPercibido: 5,
  notas: ''
})

// Estado del datepicker
const dateMenu = ref(false)

// Estados de UI
const loading = ref(false)
const error = ref('')
const success = ref(false)

// Formatear fecha para mostrar
const formattedDate = computed(() => {
  if (!fechaSeleccionada.value) return ''
  
  return new Intl.DateTimeFormat('es-ES', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  }).format(fechaSeleccionada.value)
})

// Actualizar la fecha en el formulario cuando cambia la fecha seleccionada
const updateFormDate = () => {
  form.value.fechaCompletada = fechaSeleccionada.value
}

// Enviar el formulario
const handleSubmit = async () => {
  if (!form.value.entrenamientoID) {
    error.value = 'Error en la selección del entrenamiento'
    return
  }

  try {
    loading.value = true
    error.value = ''
    success.value = false
    
    // Asegurar que la fecha está actualizada
    form.value.fechaCompletada = fechaSeleccionada.value
    
    // Completar la rutina
    const resultado = await rutinasCompletadasStore.completarRutina(form.value)
    
    success.value = true
    
    // Emitir evento completado
    emit('completada', resultado)
    
    // Cerrar el diálogo después de un breve tiempo
    setTimeout(() => {
      emit('update:show', false)
    }, 1500)
    
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error al registrar la rutina'
  } finally {
    loading.value = false
  }
}

// Cerrar el diálogo
const closeDialog = () => {
  emit('update:show', false)
}

// Verificar si la fecha seleccionada es futura
const isFutureDate = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const selectedDate = new Date(fechaSeleccionada.value)
  selectedDate.setHours(0, 0, 0, 0)
  return selectedDate > today
})
</script>

<template>
  <v-dialog 
    v-model="props.show" 
    max-width="500" 
    persistent
    transition="dialog-bottom-transition"
  >
    <v-card class="rutina-completada-dialog">
      <v-card-title class="dialog-title">
        Marcar como completado
        <v-btn 
          icon 
          @click="closeDialog" 
          class="ml-auto" 
          variant="text"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-4">
        <v-alert v-if="error" type="error" class="mb-4" density="compact" variant="tonal">
          {{ error }}
        </v-alert>

        <v-alert v-if="success" type="success" class="mb-4" density="compact" variant="tonal">
          ¡Genial! Entrenamiento registrado como completado.
        </v-alert>

        <v-form @submit.prevent="handleSubmit" v-if="!success">
          <div class="text-subtitle-1 font-weight-medium mb-4">
            Estás marcando como completado:
          </div>
          
          <v-card flat border class="mb-4 pa-3 workout-title-card">
            <div class="d-flex align-center">
              <v-icon 
                color="primary" 
                class="mr-3" 
                size="large"
              >
                mdi-dumbbell
              </v-icon>
              <div>
                <div class="text-h6">{{ entrenamientoNombre }}</div>
                <div class="text-caption" v-if="duracionRecomendada">
                  Duración recomendada: {{ duracionRecomendada }} minutos
                </div>
              </div>
            </div>
          </v-card>

          <v-row dense>
            <v-col cols="12">
              <div class="text-subtitle-2 mb-2">¿Qué día completaste este entrenamiento?</div>
              <v-menu
                v-model="dateMenu"
                :close-on-content-click="false"
                transition="scale-transition"
                min-width="auto"
              >
                <template v-slot:activator="{ props }">
                  <v-text-field
                    v-model="formattedDate"
                    label="Fecha de completado"
                    prepend-inner-icon="mdi-calendar"
                    readonly
                    v-bind="props"
                    variant="outlined"
                    density="comfortable"
                    hint="Selecciona la fecha en que realizaste este entrenamiento"
                    persistent-hint
                    class="date-field"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="fechaFormateada"
                  @update:model-value="fechaSeleccionada = new Date($event); updateFormDate()"
                  :max="new Date().toISOString().split('T')[0]"
                ></v-date-picker>
              </v-menu>
              
              <v-alert 
                v-if="isFutureDate" 
                type="warning" 
                class="mt-2" 
                density="compact" 
                variant="tonal"
              >
                No puedes seleccionar una fecha futura
              </v-alert>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.duracionMinutos"
                label="Duración (minutos)"
                prepend-inner-icon="mdi-clock-outline"
                type="number"
                min="1"
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.caloriasEstimadas"
                label="Calorías quemadas"
                prepend-inner-icon="mdi-fire"
                type="number"
                min="1"
                variant="outlined"
                density="comfortable"
                hint="Opcional"
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <div class="text-body-2 mb-2">Nivel de esfuerzo percibido</div>
              <v-slider
                v-model="form.nivelEsfuerzoPercibido"
                :max="10"
                :min="1"
                :step="1"
                color="primary"
                track-color="grey-lighten-3"
                thumb-label="always"
              >
                <template v-slot:prepend>
                  <v-icon color="success">mdi-emoticon</v-icon>
                </template>
                <template v-slot:append>
                  <v-icon color="error">mdi-emoticon-dead</v-icon>
                </template>
              </v-slider>
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="form.notas"
                label="Notas adicionales"
                hint="Escribe observaciones, sensaciones o cualquier detalle relevante (opcional)"
                prepend-inner-icon="mdi-note-text-outline"
                variant="outlined"
                rows="3"
                auto-grow
                counter
                maxlength="500"
                density="comfortable"
              ></v-textarea>
            </v-col>
          </v-row>

          <v-card-actions class="mt-4 pt-2 d-flex justify-space-between">
            <v-btn
              color="grey-lighten-3"
              variant="flat"
              @click="closeDialog"
              :disabled="loading"
            >
              Cancelar
            </v-btn>
            <v-btn
              color="success"
              type="submit"
              :loading="loading"
              :disabled="loading || isFutureDate"
            >
              Completar
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.rutina-completada-dialog {
  border-radius: $border-radius;
  overflow: hidden;
}

.dialog-title {
  background-color: $primary-color;
  color: white;
  padding: 1rem;
  font-family: $font-family-base;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.workout-title-card {
  border-radius: $border-radius;
  background-color: rgba(226, 84, 1, 0.05);
  border-color: rgba(226, 84, 1, 0.2) !important;
}

.date-field {
  margin-bottom: 8px;
}

:deep(.v-field) {
  border-radius: $border-radius !important;
}

.v-btn {
  font-family: $font-family-base;
  border-radius: $border-radius;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
}

// Responsive adjustments
@media (max-width: 600px) {
  .dialog-title {
    font-size: 1.1rem;
  }
  
  .v-dialog {
    margin: 0.5rem;
  }
  
  .v-card-actions {
    flex-direction: column-reverse;
    gap: 0.5rem;
    
    .v-btn {
      width: 100%;
    }
  }
}
</style>