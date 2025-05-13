<script setup lang="ts">
import { ref } from 'vue'
import { useRutinasCompletadasStore } from '@/stores/rutinasCompletadas'
import type { RutinaCompletadaCreate } from '@/types/RutinaCompletada'

const props = defineProps<{
  entrenamientoID: number;
  entrenamientoNombre: string;
  duracionRecomendada?: number;
  show: boolean;
}>()

const emit = defineEmits(['update:show', 'completada'])

const rutinaCompletadaStore = useRutinasCompletadasStore()

// Formulario para la rutina completada
const form = ref<RutinaCompletadaCreate>({
  entrenamientoID: props.entrenamientoID,
  fechaCompletada: new Date(),
  duracionMinutos: props.duracionRecomendada || undefined,
  caloriasEstimadas: undefined,
  nivelEsfuerzoPercibido: 5,
  notas: ''
})

// Estados de UI
const loading = ref(false)
const error = ref('')
const success = ref(false)

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
    
    // Completar la rutina
    const resultado = await rutinaCompletadaStore.completarRutina(form.value)
    
    success.value = true
    
    // Cerrar el diálogo después de un breve tiempo
    setTimeout(() => {
      emit('update:show', false)
      emit('completada', resultado)
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
</script>

<template>
  <v-dialog v-model="props.show" max-width="500" persistent>
    <v-card class="rutina-completada-dialog">
      <v-card-title class="dialog-title">
        Marcar Entrenamiento como Completado
        <v-btn icon @click="closeDialog" class="ml-auto">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-4">
        <v-alert v-if="error" type="error" class="mb-4">
          {{ error }}
        </v-alert>

        <v-alert v-if="success" type="success" class="mb-4">
          ¡Entrenamiento registrado exitosamente!
        </v-alert>

        <v-form @submit.prevent="handleSubmit" v-if="!success">
          <div class="text-body-1 mb-4">
            Vas a marcar como completado: <strong>{{ entrenamientoNombre }}</strong>
          </div>

          <v-row>
            <v-col cols="12">
              <v-menu
                ref="menu"
                v-model="menu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ props }">
                  <v-text-field
                    v-model="formattedDate"
                    label="Fecha"
                    prepend-inner-icon="mdi-calendar"
                    readonly
                    v-bind="props"
                    variant="outlined"
                    density="comfortable"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="form.fechaCompletada"
                  @update:model-value="menu = false"
                ></v-date-picker>
              </v-menu>
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
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <label class="text-subtitle-2 mb-2 d-block">Nivel de esfuerzo</label>
              <v-slider
                v-model="form.nivelEsfuerzoPercibido"
                :max="10"
                :min="1"
                :step="1"
                :ticks="true"
                color="primary"
                track-color="grey-lighten-3"
                show-ticks="always"
                thumb-label="always"
              >
                <template v-slot:prepend>
                  <v-icon icon="mdi-emoticon-outline" color="blue"></v-icon>
                </template>
                <template v-slot:append>
                  <v-icon icon="mdi-emoticon-dead-outline" color="red"></v-icon>
                </template>
              </v-slider>
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="form.notas"
                label="Notas adicionales"
                hint="Escribe observaciones, sensaciones o cualquier detalle relevante del entrenamiento"
                prepend-inner-icon="mdi-note-text-outline"
                variant="outlined"
                rows="3"
                auto-grow
                counter
                maxlength="500"
              ></v-textarea>
            </v-col>
          </v-row>

          <v-card-actions class="mt-4 d-flex justify-center">
            <v-btn
              color="grey-lighten-3"
              variant="flat"
              @click="closeDialog"
              :disabled="loading"
              class="mr-2"
            >
              Cancelar
            </v-btn>
            <v-btn
              color="primary"
              type="submit"
              :loading="loading"
              :disabled="loading"
            >
              Completar Entrenamiento
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
export default {
  data() {
    return {
      menu: false,
      
      get formattedDate() {
        return this.form.fechaCompletada 
          ? new Date(this.form.fechaCompletada).toLocaleDateString() 
          : '';
      }
    }
  }
}
</script>

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

.v-text-field {
  margin-bottom: 0.5rem;
}

:deep(.v-field) {
  border-radius: $border-radius !important;
}

.v-btn {
  font-family: $font-family-base;
  border-radius: $border-radius;
}

// Responsive adjustments
@media (max-width: 600px) {
  .dialog-title {
    font-size: 1.1rem;
  }
}
</style>