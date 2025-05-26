<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRutinasCompletadasStore } from '@/stores/rutinasCompletadas'
import type { RutinaCompletada } from '@/types/RutinaCompletada'

const props = defineProps<{
  entrenamientoId?: number
}>()

const rutinasCompletadasStore = useRutinasCompletadasStore()

// Estados locales
const loading = ref(false)
const error = ref('')
const rutinasCompletadas = ref<RutinaCompletada[]>([])
const searchQuery = ref('')
const showEditModal = ref(false)
const rutinaSeleccionada = ref<RutinaCompletada | null>(null)
const confirmDeleteDialog = ref(false)
const sortBy = ref('fechaCompletada')
const sortDesc = ref(true)

// Cargar historial
const cargarHistorial = async () => {
  try {
    loading.value = true
    error.value = ''
    
    if (props.entrenamientoId) {
      // Obtener solo las rutinas completadas para este entrenamiento
      rutinasCompletadas.value = await rutinasCompletadasStore.getRutinasCompletadasByEntrenamiento(props.entrenamientoId)
    } else {
      // Obtener todas las rutinas completadas del usuario
      rutinasCompletadas.value = await rutinasCompletadasStore.fetchRutinasCompletadas()
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error al cargar el historial'
  } finally {
    loading.value = false
  }
}

// Función para formatear fechas
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Filtrar y ordenar las rutinas
const filteredRutinas = computed(() => {
  // Primero filtramos por el término de búsqueda
  let filtered = rutinasCompletadas.value.filter(rutina => {
    const searchLower = searchQuery.value.toLowerCase()
    return (
      (rutina.nombreEntrenamiento?.toLowerCase().includes(searchLower) || false) ||
      (rutina.notas?.toLowerCase().includes(searchLower) || false) ||
      formatDate(rutina.fechaCompletada).toLowerCase().includes(searchLower)
    )
  })
  
  // Luego ordenamos según el criterio seleccionado
  return filtered.sort((a, b) => {
    let valueA: any
    let valueB: any
    
    // Determinar qué valores comparar según la columna seleccionada
    switch (sortBy.value) {
      case 'fechaCompletada':
        valueA = a.fechaCompletada.getTime()
        valueB = b.fechaCompletada.getTime()
        break
      case 'nombreEntrenamiento':
        valueA = a.nombreEntrenamiento || ''
        valueB = b.nombreEntrenamiento || ''
        break
      case 'duracionMinutos':
        valueA = a.duracionMinutos || 0
        valueB = b.duracionMinutos || 0
        break
      case 'caloriasEstimadas':
        valueA = a.caloriasEstimadas || 0
        valueB = b.caloriasEstimadas || 0
        break
      case 'nivelEsfuerzoPercibido':
        valueA = a.nivelEsfuerzoPercibido || 0
        valueB = b.nivelEsfuerzoPercibido || 0
        break
      default:
        valueA = a.fechaCompletada.getTime()
        valueB = b.fechaCompletada.getTime()
    }
    
    // Aplicar dirección del ordenamiento
    const direction = sortDesc.value ? -1 : 1
    
    // Comparar valores
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return direction * valueA.localeCompare(valueB)
    } else {
      return direction * (valueA - valueB)
    }
  })
})

// Reiniciar el estado
const resetState = () => {
  rutinasCompletadas.value = []
  error.value = ''
  loading.value = false
}

// Abrir modal de edición
const openEditModal = (rutina: RutinaCompletada) => {
  rutinaSeleccionada.value = rutina
  showEditModal.value = true
}

// Confirmar eliminación de una rutina
const confirmDelete = (rutina: RutinaCompletada) => {
  rutinaSeleccionada.value = rutina
  confirmDeleteDialog.value = true
}

// Eliminar una rutina
const handleDelete = async () => {
  if (!rutinaSeleccionada.value) return
  
  try {
    loading.value = true
    await rutinasCompletadasStore.deleteRutinaCompletada(rutinaSeleccionada.value.rutinaCompletadaID)
    confirmDeleteDialog.value = false
    rutinaSeleccionada.value = null
    
    // Actualizar la lista de rutinas
    cargarHistorial()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error al eliminar la rutina'
  } finally {
    loading.value = false
  }
}

// Actualizar ordenamiento
const updateSort = (column: string) => {
  if (sortBy.value === column) {
    // Si ya estamos ordenando por esta columna, cambiamos la dirección
    sortDesc.value = !sortDesc.value
  } else {
    // Si es una nueva columna, la seleccionamos y ordenamos descendente por defecto
    sortBy.value = column
    sortDesc.value = true
  }
}

// Observar cambios en la prop entrenamientoId
watch(() => props.entrenamientoId, () => {
  resetState()
  cargarHistorial()
})

// Al montar el componente
onMounted(() => {
  cargarHistorial()
})
</script>

<template>
  <div class="rutinas-historial-container">
    <!-- Alerta de error -->
    <v-alert v-if="error" type="error" class="mb-4">
      {{ error }}
    </v-alert>
    
    <!-- Barra de búsqueda -->
    <div class="search-container">
      <v-text-field
        v-model="searchQuery"
        label="Buscar en mi historial"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        hide-details
        density="comfortable"
        class="mb-4"
        clearable
      ></v-text-field>
    </div>
    
    <!-- Estado de carga -->
    <div v-if="loading" class="d-flex justify-center my-6">
      <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
    </div>
    
    <!-- Sin resultados -->
    <v-alert v-else-if="rutinasCompletadas.length === 0" type="info" class="mb-4">
      No hay entrenamientos completados en tu historial.
    </v-alert>
    
    <!-- Tabla de historial -->
    <div v-else class="historial-table-container">
      <table class="historial-table">
        <thead>
          <tr>
            <th @click="updateSort('fechaCompletada')" class="sortable-header">
              Fecha
              <v-icon size="small" v-if="sortBy === 'fechaCompletada'">
                {{ sortDesc ? 'mdi-arrow-down' : 'mdi-arrow-up' }}
              </v-icon>
            </th>
            <th @click="updateSort('nombreEntrenamiento')" class="sortable-header">
              Entrenamiento
              <v-icon size="small" v-if="sortBy === 'nombreEntrenamiento'">
                {{ sortDesc ? 'mdi-arrow-down' : 'mdi-arrow-up' }}
              </v-icon>
            </th>
            <th @click="updateSort('duracionMinutos')" class="sortable-header hide-sm">
              Duración
              <v-icon size="small" v-if="sortBy === 'duracionMinutos'">
                {{ sortDesc ? 'mdi-arrow-down' : 'mdi-arrow-up' }}
              </v-icon>
            </th>
            <th @click="updateSort('caloriasEstimadas')" class="sortable-header hide-sm">
              Calorías
              <v-icon size="small" v-if="sortBy === 'caloriasEstimadas'">
                {{ sortDesc ? 'mdi-arrow-down' : 'mdi-arrow-up' }}
              </v-icon>
            </th>
            <th @click="updateSort('nivelEsfuerzoPercibido')" class="sortable-header hide-sm">
              Esfuerzo
              <v-icon size="small" v-if="sortBy === 'nivelEsfuerzoPercibido'">
                {{ sortDesc ? 'mdi-arrow-down' : 'mdi-arrow-up' }}
              </v-icon>
            </th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rutina in filteredRutinas" :key="rutina.rutinaCompletadaID">
            <td class="fecha-col">{{ formatDate(rutina.fechaCompletada) }}</td>
            <td>
              <div class="workout-info">
                <span class="workout-name">{{ rutina.nombreEntrenamiento }}</span>
                <v-tooltip v-if="rutina.notas" location="bottom">
                  <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="ml-2" size="small" color="grey">mdi-note-text-outline</v-icon>
                  </template>
                  <span>{{ rutina.notas }}</span>
                </v-tooltip>
              </div>
            </td>
            <td class="hide-sm">{{ rutina.duracionMinutos || '-' }} min</td>
            <td class="hide-sm">{{ rutina.caloriasEstimadas || '-' }} kcal</td>
            <td class="hide-sm">
              <v-rating
                v-if="rutina.nivelEsfuerzoPercibido"
                :model-value="rutina.nivelEsfuerzoPercibido"
                density="compact"
                size="x-small"
                :length="10"
                readonly
                color="amber-darken-3"
              ></v-rating>
              <span v-else>-</span>
            </td>
            <td class="actions-col">
              <v-btn
                icon
                variant="text"
                size="small"
                color="primary"
                @click="openEditModal(rutina)"
                class="action-btn"
              >
                <v-icon size="small">mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                icon
                variant="text"
                size="small"
                color="error"
                @click="confirmDelete(rutina)"
                class="action-btn"
              >
                <v-icon size="small">mdi-delete</v-icon>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Vista móvil: tarjetas en lugar de tabla -->
    <div v-if="!loading && rutinasCompletadas.length > 0" class="rutinas-cards-mobile">
      <v-card
        v-for="rutina in filteredRutinas"
        :key="rutina.rutinaCompletadaID"
        class="mb-3 rutina-card"
        variant="outlined"
      >
        <v-card-title class="text-h6">
          {{ rutina.nombreEntrenamiento }}
        </v-card-title>
        
        <v-card-subtitle>
          {{ formatDate(rutina.fechaCompletada) }}
        </v-card-subtitle>
        
        <v-card-text>
          <div class="d-flex flex-column">
            <div class="d-flex justify-space-between mb-2">
              <div class="text-subtitle-2">Duración:</div>
              <div>{{ rutina.duracionMinutos || '-' }} min</div>
            </div>
            
            <div class="d-flex justify-space-between mb-2">
              <div class="text-subtitle-2">Calorías:</div>
              <div>{{ rutina.caloriasEstimadas || '-' }} kcal</div>
            </div>
            
            <div class="d-flex justify-space-between mb-2">
              <div class="text-subtitle-2">Nivel de esfuerzo:</div>
              <v-rating
                v-if="rutina.nivelEsfuerzoPercibido"
                :model-value="rutina.nivelEsfuerzoPercibido"
                density="compact"
                size="x-small"
                :length="10"
                readonly
                color="amber-darken-3"
              ></v-rating>
              <div v-else>-</div>
            </div>
            
            <div v-if="rutina.notas" class="mt-2">
              <div class="text-subtitle-2">Notas:</div>
              <div class="notas-text">{{ rutina.notas }}</div>
            </div>
          </div>
        </v-card-text>
        
        <v-divider></v-divider>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            color="primary"
            @click="openEditModal(rutina)"
          >
            <v-icon start>mdi-pencil</v-icon>
            Editar
          </v-btn>
          <v-btn
            variant="text"
            color="error"
            @click="confirmDelete(rutina)"
          >
            <v-icon start>mdi-delete</v-icon>
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>
    
    <!-- Modal de confirmación para eliminar -->
    <v-dialog v-model="confirmDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5">
          Confirmar eliminación
        </v-card-title>
        
        <v-card-text>
          ¿Estás seguro de que quieres eliminar este registro de entrenamiento? Esta acción no se puede deshacer.
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="confirmDeleteDialog = false">
            Cancelar
          </v-btn>
          <v-btn color="error" variant="text" @click="handleDelete" :loading="loading">
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Modal de edición -->
    <v-dialog v-model="showEditModal" max-width="500">
      <v-card v-if="rutinaSeleccionada">
        <v-card-title class="dialog-title">
          Editar Registro
          <v-btn icon @click="showEditModal = false" class="ml-auto">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-divider></v-divider>
        
        <v-card-text class="pa-4">
          <v-form>
            <div class="text-body-1 mb-4">
              <strong>{{ rutinaSeleccionada.nombreEntrenamiento }}</strong> -
              {{ formatDate(rutinaSeleccionada.fechaCompletada) }}
            </div>
            
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="rutinaSeleccionada.duracionMinutos"
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
                  v-model.number="rutinaSeleccionada.caloriasEstimadas"
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
                  v-model="rutinaSeleccionada.nivelEsfuerzoPercibido"
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
                  v-model="rutinaSeleccionada.notas"
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
          </v-form>
        </v-card-text>
        
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn
            color="grey-lighten-1"
            variant="text"
            @click="showEditModal = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="editRutina"
            :loading="loading"
          >
            Guardar Cambios
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.rutinas-historial-container {
  width: 100%;
}

.search-container {
  margin-bottom: 1rem;
}

.historial-table-container {
  overflow-x: auto;
  display: none; // Ocultar en dispositivos móviles
  
  @media (min-width: 768px) {
    display: block; // Mostrar en tablets y desktop
  }
}

.rutinas-cards-mobile {
  @media (min-width: 768px) {
    display: none; // Ocultar en tablets y desktop
  }
}

.historial-table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  
  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    white-space: nowrap;
  }
  
  th {
    font-weight: 600;
    color: rgba(0, 0, 0, 0.7);
    background-color: $light-gray;
    position: sticky;
    top: 0;
    z-index: 1;
  }
  
  .sortable-header {
    cursor: pointer;
    user-select: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    &:hover {
      background-color: darken($light-gray, 5%);
    }
  }
  
  .fecha-col {
    min-width: 180px;
  }
  
  .workout-info {
    display: flex;
    align-items: center;
    max-width: 200px;
    
    .workout-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  
  .actions-col {
    width: 100px;
    text-align: right;
    
    .action-btn {
      margin-left: 0.5rem;
    }
  }
  
  // Responsive
  @media (max-width: 767px) {
    .hide-sm {
      display: none;
    }
  }
}

.rutina-card {
  .notas-text {
    font-size: 0.9rem;
    opacity: 0.8;
    margin-top: 0.25rem;
    white-space: pre-line;
    max-height: 100px;
    overflow-y: auto;
  }
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

// Responsive adjustments
@media (max-width: 600px) {
  .search-container {
    padding: 0 0.5rem;
  }
  
  .dialog-title {
    font-size: 1.1rem;
  }
}
</style>