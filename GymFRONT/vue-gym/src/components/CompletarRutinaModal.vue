<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
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

// Función para obtener el lunes de una semana específica
const getMondayOfWeek = (date: Date): Date => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Ajustar para que lunes sea el primer día
  return new Date(d.setDate(diff))
}

// Función para obtener el domingo de una semana específica
const getSundayOfWeek = (date: Date): Date => {
  const monday = getMondayOfWeek(date)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return sunday
}

// Calcular fechas permitidas: desde el lunes de la semana anterior hasta el domingo de la semana siguiente
const today = new Date()
const currentMonday = getMondayOfWeek(today)

// Lunes de la semana anterior
const previousWeekMonday = new Date(currentMonday)
previousWeekMonday.setDate(currentMonday.getDate() - 7)

// Domingo de la semana siguiente
const nextWeekSunday = new Date(currentMonday)
nextWeekSunday.setDate(currentMonday.getDate() + 13) // +6 para llegar al domingo actual, +7 para la siguiente semana

// Formatear fechas para el input
const formatDateForInput = (date: Date): string => {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

const minDate = formatDateForInput(previousWeekMonday)
const maxDate = formatDateForInput(nextWeekSunday)
const formattedToday = formatDateForInput(today)

// Fecha directamente como string en formato YYYY-MM-DD
const fechaSeleccionada = ref(formattedToday)

// Formulario para la rutina completada
const form = ref<RutinaCompletadaCreate>({
  entrenamientoID: props.entrenamientoID,
  fechaCompletada: today,
  duracionMinutos: props.duracionRecomendada || undefined,
  caloriasEstimadas: undefined,
  nivelEsfuerzoPercibido: 5,
  notas: ''
})

// Estados de UI
const loading = ref(false)
const error = ref('')
const success = ref(false)

// Observar cambios en el prop show
watch(() => props.show, (newVal) => {
  if (newVal) {
    // Si se abre el diálogo, resetear el estado y el formulario
    resetForm()
    success.value = false
    error.value = ''
  }
})

// Verificar si la fecha seleccionada es válida
const fechaInvalida = computed(() => {
  try {
    const selectedDate = new Date(fechaSeleccionada.value)
    const minDateObj = new Date(minDate)
    const maxDateObj = new Date(maxDate)
    
    // Resetear las horas para comparar solo las fechas
    selectedDate.setHours(0, 0, 0, 0)
    minDateObj.setHours(0, 0, 0, 0)
    maxDateObj.setHours(0, 0, 0, 0)
    
    // Verificar si es una fecha válida
    if (isNaN(selectedDate.getTime())) {
      return 'Fecha inválida'
    }
    
    // Verificar si la fecha está fuera del rango permitido
    if (selectedDate < minDateObj || selectedDate > maxDateObj) {
      return 'Solo puedes seleccionar fechas de la semana anterior, actual o siguiente'
    }
    
    return null
  } catch (e) {
    return 'Formato de fecha inválido'
  }
})

// Función para obtener el nombre del día de la semana
const getDayName = (dateString: string): string => {
  try {
    const date = new Date(dateString + 'T12:00:00')
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    return days[date.getDay()]
  } catch {
    return ''
  }
}

// Función para determinar qué semana es
const getWeekDescription = (dateString: string): string => {
  try {
    const selectedDate = new Date(dateString + 'T12:00:00')
    const selectedMonday = getMondayOfWeek(selectedDate)
    const todayMonday = getMondayOfWeek(today)
    
    const diffDays = Math.round((selectedMonday.getTime() - todayMonday.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Esta semana'
    if (diffDays === -7) return 'Semana anterior'
    if (diffDays === 7) return 'Semana siguiente'
    
    return ''
  } catch {
    return ''
  }
}

// Cada vez que se abre el modal, restablecer los valores
const resetForm = () => {
  const today = new Date()
  fechaSeleccionada.value = formatDateForInput(today)
  
  form.value = {
    entrenamientoID: props.entrenamientoID,
    fechaCompletada: today,
    duracionMinutos: props.duracionRecomendada || undefined,
    caloriasEstimadas: undefined,
    nivelEsfuerzoPercibido: 5,
    notas: ''
  }

  // Resetear estados
  loading.value = false
  error.value = ''
  success.value = false
}

// Actualizar la fecha en el formulario cuando cambia fechaSeleccionada
const updateFormDate = () => {
  try {
    console.log('Actualizando fecha desde:', fechaSeleccionada.value)
    const date = new Date(fechaSeleccionada.value + 'T12:00:00') // Añadimos la hora para evitar problemas de zona horaria
    if (!isNaN(date.getTime())) {
      form.value.fechaCompletada = date
      console.log('Fecha actualizada en el formulario:', form.value.fechaCompletada)
    } else {
      console.error('La fecha seleccionada no es válida:', fechaSeleccionada.value)
    }
  } catch (e) {
    console.error('Error al actualizar la fecha en el formulario:', e)
  }
}

// Actualizar fechaSeleccionada cuando cambia el valor en el input
const handleDateInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input && input.value) {
    fechaSeleccionada.value = input.value
    updateFormDate()
  }
}

// Enviar el formulario
const handleSubmit = async () => {
  if (!form.value.entrenamientoID) {
    error.value = 'Error en la selección del entrenamiento'
    return
  }

  // Validar la fecha
  if (fechaInvalida.value) {
    error.value = fechaInvalida.value
    return
  }

  try {
    loading.value = true
    error.value = ''
    
    // Actualizar la fecha en el formulario
    updateFormDate()
    
    console.log('Enviando formulario con fecha:', form.value.fechaCompletada)
    console.log('String de fecha seleccionada:', fechaSeleccionada.value)
    
    // Completar la rutina
    const resultado = await rutinasCompletadasStore.completarRutina(form.value)
    
    // Importante: Forzar actualización del rol del usuario después de completar entrenamiento
    try {
      // Usamos un pequeño timeout para asegurar que el backend haya procesado el nuevo entrenamiento
      setTimeout(async () => {
        // Actualizar las estadísticas
        await rutinasCompletadasStore.fetchResumen()
        
        // Importación dinámica para evitar importación circular
        const { useRolesStore } = await import('@/stores/roles')
        const rolesStore = useRolesStore()
        await rolesStore.getUserRole()
        
        console.log('Rol de usuario actualizado después de completar entrenamiento')
      }, 500)
    } catch (roleError) {
      console.error('Error al actualizar el rol después de completar entrenamiento:', roleError)
    }
    
    // Mostrar mensaje de éxito
    success.value = true
    
    // Emitir evento completado
    emit('completada', resultado)
    
    // Cerrar el diálogo después de un breve tiempo y resetear estado
    setTimeout(() => {
      // Cerrar el diálogo
      emit('update:show', false)
      
      // IMPORTANTE: Resetear success a false después de cerrar para que el próximo diálogo muestre el formulario
      setTimeout(() => {
        success.value = false
      }, 100)
    }, 1200)
    
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error al registrar la rutina'
  } finally {
    loading.value = false
  }
}

// Cerrar el diálogo
const closeDialog = () => {
  emit('update:show', false)
  
  // IMPORTANTE: Resetear success a false después de cerrar para el próximo diálogo
  setTimeout(() => {
    success.value = false
  }, 100)
}

// Al montar el componente, asegurarnos que la fecha esté en el formato correcto
onMounted(() => {
  resetForm()
})
</script>

<template>
  <v-dialog 
    v-model="props.show" 
    max-width="500" 
    persistent
    transition="dialog-bottom-transition"
    @update:model-value="(val) => !val && closeDialog()"
  >
    <v-card class="rutina-completada-dialog">
      <v-card-title class="dialog-title">
        {{ success ? 'Entrenamiento Registrado' : 'Marcar como completado' }}
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

        <v-alert v-if="success" type="success" class="mb-4 success-alert" density="compact" variant="tonal">
          <v-icon start color="success" class="mr-2">mdi-check-circle</v-icon>
          ¡Genial! Entrenamiento registrado correctamente.
        </v-alert>

        <v-form v-if="!success" @submit.prevent="handleSubmit">
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
              <div class="text-subtitle-2 mb-2">¿Qué día completaste/completarás este entrenamiento?</div>
              
              <!-- Input de fecha con enfoque directo -->
              <div class="date-input-container">
                <label class="text-subtitle-2 mb-2">Fecha del entrenamiento</label>
                <input 
                  type="date" 
                  v-model="fechaSeleccionada"
                  class="date-native-input"
                  :min="minDate"
                  :max="maxDate"
                  @input="handleDateInput"
                />
                
                <!-- Información adicional sobre la fecha seleccionada -->
                <div v-if="fechaSeleccionada && !fechaInvalida" class="date-info mt-2">
                  <div class="text-caption">
                    <strong>{{ getDayName(fechaSeleccionada) }}</strong> - {{ getWeekDescription(fechaSeleccionada) }}
                  </div>
                </div>
                
                <div class="text-caption mt-1">
                  Puedes seleccionar fechas de la semana anterior, actual o siguiente (lunes a domingo)
                </div>
                
                <v-alert 
                  v-if="fechaInvalida" 
                  type="warning" 
                  class="mt-2 mb-0" 
                  density="compact" 
                  variant="tonal"
                >
                  {{ fechaInvalida }}
                </v-alert>
              </div>
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
              :disabled="loading || !!fechaInvalida"
            >
              Guardar
            </v-btn>
          </v-card-actions>
        </v-form>
        
        <!-- Mensaje de éxito centrado cuando success es true -->
        <div v-if="success" class="text-center py-4">
          <v-icon color="success" size="64" class="mb-4 success-icon">mdi-check-circle</v-icon>
          <h3 class="text-h5 success-title mb-2">¡Entrenamiento Registrado!</h3>
          <p class="text-body-1">El entrenamiento ha sido guardado correctamente.</p>
          <v-btn color="primary" @click="closeDialog" class="mt-4">
            Cerrar
          </v-btn>
        </div>
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

.date-input-container {
  margin-bottom: 1.5rem;
}

.date-native-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: $border-radius;
  font-family: $font-family-base;
  font-size: 1rem;
  color: #333;
  background-color: #fff;
  transition: border-color 0.2s;
  
  &:focus {
    border-color: $primary-color;
    outline: none;
    box-shadow: 0 0 0 2px rgba($primary-color, 0.25);
  }
}

.date-info {
  background-color: rgba(226, 84, 1, 0.1);
  padding: 8px 12px;
  border-radius: $border-radius;
  border-left: 4px solid $primary-color;
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

.success-icon {
  animation: pulse 1.5s infinite;
  animation-iteration-count: 1;
}

.success-title {
  color: $primary-color;
  font-weight: 600;
}

.success-alert {
  background-color: #e8f5e9 !important;
  border-left: 4px solid #4caf50 !important;
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
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