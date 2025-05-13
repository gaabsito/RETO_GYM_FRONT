<script setup lang="ts">
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue'
import { useRutinasCompletadasStore } from '@/stores/rutinasCompletadas'
import { useMedicionStore } from '@/stores/medicion'
import type { ResumenRutinas } from '@/types/RutinaCompletada'
import type { Medicion } from '@/types/Medicion'

// Props con valores por defecto
const props = withDefaults(defineProps<{
  showCalendarHeatmap?: boolean;
  showWeeklyChart?: boolean;
  showMonthlyChart?: boolean;
  showProgress?: boolean;
  limitChartData?: number;
}>(), {
  showCalendarHeatmap: false,
  showWeeklyChart: false,
  showMonthlyChart: false,
  showProgress: false,
  limitChartData: 12
})

// Stores
const rutinasCompletadasStore = useRutinasCompletadasStore()
const medicionStore = useMedicionStore()

// Estado local
const loading = ref(false)
const error = ref('')
const resumen = ref<ResumenRutinas | null>(null)
const mediciones = ref<Medicion[]>([])
const showFullDetails = ref(false)
const activeTab = ref(0)

// Referencias para los charts
const charts = ref<{[key: string]: any}>({
  peso: null,
  imc: null,
  grasa: null
})

// Cargar datos
const cargarDatos = async () => {
  try {
    loading.value = true
    error.value = ''
    
    // Cargar resumen de rutinas completadas
    resumen.value = await rutinasCompletadasStore.fetchResumen()
    
    // Cargar mediciones para gráficos de progreso si es necesario
    if (props.showProgress) {
      try {
        mediciones.value = await medicionStore.getMediciones()
      } catch (medError) {
        console.error('Error al cargar mediciones:', medError)
      }
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error al cargar datos de progreso'
  } finally {
    loading.value = false
  }
}

// Calcular datos para gráficos
const chartData = computed(() => {
  // Filtrar y ordenar las mediciones por fecha
  const sortedMediciones = [...mediciones.value]
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .slice(-props.limitChartData)
  
  // Función para crear dataset
  const createDataset = (label: string, data: any[], color: string) => ({
    label,
    data,
    borderColor: color,
    backgroundColor: `${color}20`,
    tension: 0.4,
    fill: true,
    pointBackgroundColor: color,
    pointBorderColor: '#fff',
    pointBorderWidth: 1,
    pointRadius: 4
  })
  
  const commonLabels = sortedMediciones.map(m => {
    const date = new Date(m.fecha)
    return date.toLocaleDateString(undefined, { 
      day: '2-digit', 
      month: 'short' 
    })
  })
  
  return {
    peso: {
      labels: commonLabels,
      datasets: [createDataset('Peso (kg)', 
        sortedMediciones.map(m => m.peso), 
        '#e25401')]
    },
    imc: {
      labels: commonLabels,
      datasets: [createDataset('IMC', 
        sortedMediciones.map(m => m.imc), 
        '#2f7d32')]
    },
    grasa: {
      labels: commonLabels,
      datasets: [createDataset('Grasa corporal (%)', 
        sortedMediciones.map(m => m.porcentajeGrasa), 
        '#1976d2')]
    }
  }
})

// Configuración común para todos los gráficos
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        boxWidth: 10,
        usePointStyle: true
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: 10,
      cornerRadius: 6,
      boxPadding: 3
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      }
    },
    y: {
      beginAtZero: false,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      }
    }
  },
  elements: {
    line: {
      borderWidth: 2
    }
  },
  interaction: {
    mode: 'index',
    intersect: false
  }
}

// Inicializar gráficos
const initCharts = () => {
  if (typeof window === 'undefined' || !window.Chart) {
    console.error('Chart.js no está disponible')
    return
  }

  const chartTypes = ['peso', 'imc', 'grasa']
  const titles = ['Evolución del peso', 'Evolución del IMC', 'Porcentaje de grasa corporal']
  
  chartTypes.forEach((type, index) => {
    const canvas = document.getElementById(`${type}Chart`) as HTMLCanvasElement
    if (canvas) {
      // Destruir el gráfico existente si existe
      if (charts.value[type]) {
        charts.value[type].destroy()
      }
      
      if (chartData.value[type].datasets[0].data.some(d => d !== null && d !== undefined)) {
        const options = {
          ...chartOptions,
          plugins: {
            ...chartOptions.plugins,
            title: {
              display: true,
              text: titles[index],
              font: {
                size: 16,
                weight: 'normal'
              }
            }
          }
        }
        
        charts.value[type] = new window.Chart(canvas, {
          type: 'line',
          data: chartData.value[type],
          options: options
        })
      }
    }
  })
}

// Limpiar charts al desmontar el componente
const cleanupCharts = () => {
  Object.values(charts.value).forEach(chart => {
    if (chart) {
      chart.destroy()
    }
  })
}

// Formato para números
const formatNumber = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '-'
  return value.toLocaleString()
}

// Obtener nivel de esfuerzo con color
const esfuerzoColor = computed(() => {
  if (!resumen.value || !resumen.value.promedioEsfuerzo) return 'grey'
  
  const esfuerzo = resumen.value.promedioEsfuerzo
  if (esfuerzo < 3) return 'success'
  if (esfuerzo < 6) return 'amber-darken-1'
  if (esfuerzo < 8) return 'orange-darken-1'
  return 'error'
})

// Al montar el componente
onMounted(() => {
  cargarDatos()
  // Damos tiempo a que se renderice el DOM
  setTimeout(initCharts, 300)
})

// Antes de desmontar el componente
onBeforeUnmount(() => {
  cleanupCharts()
})

// Observar cambios en las props
watch([
  () => props.showCalendarHeatmap,
  () => props.showWeeklyChart,
  () => props.showMonthlyChart,
  () => props.showProgress
], () => {
  cargarDatos()
})

// Observar cambios en las mediciones o en la pestaña activa
watch([() => mediciones.value, () => activeTab.value], () => {
  // Esperar a que se actualice el DOM
  setTimeout(initCharts, 200)
}, { deep: true })
</script>

<template>
  <div class="progreso-estadisticas">
    <!-- Alerta de error -->
    <v-alert v-if="error" type="error" class="mb-4" variant="tonal" density="compact">
      {{ error }}
    </v-alert>
    
    <!-- Estado de carga -->
    <div v-if="loading" class="d-flex justify-center align-center py-8">
      <v-progress-circular indeterminate color="primary" size="42"></v-progress-circular>
    </div>
    
    <!-- Sin datos -->
    <v-alert v-else-if="!resumen" type="info" class="mb-4" variant="tonal" density="compact">
      <div class="d-flex align-center">
        <v-icon start>mdi-information-outline</v-icon>
        <span>No hay suficientes datos para mostrar estadísticas.</span>
      </div>
      <div class="text-caption mt-2">Completa algunos entrenamientos para ver tu progreso.</div>
    </v-alert>
    
    <!-- Contenido principal -->
    <div v-else class="progreso-content">
      <!-- Tarjetas de resumen -->
      <div class="stats-grid mb-4">
        <v-row dense>
          <v-col cols="6" sm="3">
            <v-card class="stat-card">
              <v-card-text class="pa-3 d-flex flex-column align-center">
                <div class="stat-icon primary-bg">
                  <v-icon color="white" size="20">mdi-dumbbell</v-icon>
                </div>
                <div class="stat-value">{{ formatNumber(resumen.totalRutinasCompletadas) }}</div>
                <div class="stat-label">Total completadas</div>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="6" sm="3">
            <v-card class="stat-card">
              <v-card-text class="pa-3 d-flex flex-column align-center">
                <div class="stat-icon success-bg">
                  <v-icon color="white" size="20">mdi-calendar-week</v-icon>
                </div>
                <div class="stat-value">{{ formatNumber(resumen.rutinasUltimaSemana) }}</div>
                <div class="stat-label">Última semana</div>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="6" sm="3">
            <v-card class="stat-card">
              <v-card-text class="pa-3 d-flex flex-column align-center">
                <div class="stat-icon warning-bg">
                  <v-icon color="white" size="20">mdi-fire</v-icon>
                </div>
                <div class="stat-value">{{ formatNumber(resumen.caloriasTotales) }}</div>
                <div class="stat-label">Calorías totales</div>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="6" sm="3">
            <v-card class="stat-card">
              <v-card-text class="pa-3 d-flex flex-column align-center">
                <div class="stat-icon info-bg">
                  <v-icon color="white" size="20">mdi-clock-outline</v-icon>
                </div>
                <div class="stat-value">{{ formatNumber(resumen.minutosTotales) }} min</div>
                <div class="stat-label">Tiempo total</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>
      
      <!-- Entrenamiento favorito -->
      <v-card v-if="resumen.nombreEntrenamientoMasRepetido" class="mb-4 favorite-workout-card" elevation="1">
        <v-card-text class="pa-4">
          <div class="d-flex align-center">
            <div class="favorite-icon">
              <v-icon size="24" color="amber-darken-2">mdi-star</v-icon>
            </div>
            <div class="ms-3">
              <div class="text-caption text-uppercase font-weight-medium">Tu entrenamiento favorito</div>
              <div class="text-subtitle-1 font-weight-bold primary--text">
                {{ resumen.nombreEntrenamientoMasRepetido }}
              </div>
              <div class="text-caption">
                Has completado este entrenamiento {{ resumen.vecesCompletado }} veces
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
      
      <!-- Nivel de esfuerzo promedio -->
      <v-card v-if="resumen.promedioEsfuerzo" class="mb-4" elevation="1">
        <v-card-title class="text-subtitle-1 pa-4 pb-0">Esfuerzo promedio</v-card-title>
        <v-card-text class="pb-4">
          <div class="d-flex flex-column align-center">
            <div class="py-3">
              <v-progress-circular
                :model-value="resumen.promedioEsfuerzo * 10"
                :size="100"
                :width="12"
                :color="esfuerzoColor"
                class="mb-2"
              >
                <span class="text-h6">{{ resumen.promedioEsfuerzo.toFixed(1) }}</span>
              </v-progress-circular>
            </div>
            <div class="esfuerzo-scale d-flex justify-space-between width-100">
              <div class="text-caption">Suave</div>
              <div class="text-caption">Moderado</div>
              <div class="text-caption">Intenso</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
      
      <!-- Gráficos para visualización de progreso -->
      <div v-if="props.showProgress && mediciones.length > 0" class="charts-section">
        <h3 class="text-subtitle-1 font-weight-medium mb-3">Tu progreso físico</h3>
        
        <v-card elevation="1">
          <v-card-text class="pa-2">
            <v-tabs v-model="activeTab" bg-color="transparent" color="primary" density="comfortable">
              <v-tab value="0">
                <v-icon start size="small">mdi-weight</v-icon>
                Peso
              </v-tab>
              <v-tab value="1">
                <v-icon start size="small">mdi-human</v-icon>
                IMC
              </v-tab>
              <v-tab value="2">
                <v-icon start size="small">mdi-percent</v-icon>
                % Grasa
              </v-tab>
            </v-tabs>
            
            <v-window v-model="activeTab">
              <!-- Gráfico de Peso -->
              <v-window-item value="0">
                <div class="chart-container">
                  <canvas id="pesoChart" height="280"></canvas>
                </div>
              </v-window-item>
              
              <!-- Gráfico de IMC -->
              <v-window-item value="1">
                <div class="chart-container">
                  <canvas id="imcChart" height="280"></canvas>
                </div>
              </v-window-item>
              
              <!-- Gráfico de % Grasa -->
              <v-window-item value="2">
                <div class="chart-container">
                  <canvas id="grasaChart" height="280"></canvas>
                </div>
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </div>
      
      <!-- Botón para ver más detalles (opcional) -->
      <div v-if="showFullDetails === false" class="text-center mt-6">
        <v-btn
          color="primary"
          variant="outlined"
          size="small"
          rounded
          @click="showFullDetails = true"
        >
          <span class="text-capitalize">Ver más estadísticas</span>
          <v-icon end size="small">mdi-chevron-down</v-icon>
        </v-btn>
      </div>
      
      <!-- Estadísticas detalladas (mostradas solo si se expande) -->
      <v-expand-transition>
        <div v-if="showFullDetails" class="mt-6">
          <h3 class="text-subtitle-1 font-weight-medium mb-3">Estadísticas mensuales</h3>
          <v-card>
            <v-card-text>
              <!-- Aquí podrías añadir gráficos más avanzados -->
              <p class="text-body-1">
                Estos son más detalles sobre tu actividad física y progreso.
              </p>
            </v-card-text>
          </v-card>
        </div>
      </v-expand-transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.progreso-estadisticas {
  width: 100%;
}

.progreso-content {
  animation: fade-in 0.3s ease-in-out;
}

.stats-grid {
  .stat-card {
    border-radius: $border-radius;
    height: 100%;
    transition: transform 0.2s ease-in-out;
    
    &:hover {
      transform: translateY(-2px);
    }
    
    .stat-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.5rem;
    }
    
    .primary-bg { background-color: $primary-color; }
    .success-bg { background-color: #2e7d32; }
    .warning-bg { background-color: #ed6c02; }
    .info-bg { background-color: #0288d1; }
    
    .stat-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: $secondary-color;
      margin-bottom: 0.25rem;
    }
    
    .stat-label {
      font-size: 0.8rem;
      color: rgba(0, 0, 0, 0.6);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 500;
    }
  }
}

.favorite-workout-card {
  border-radius: $border-radius;
  
  .favorite-icon {
    background-color: rgba(255, 193, 7, 0.1);
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.esfuerzo-scale {
  width: 80%;
  margin-top: 0.5rem;
  color: rgba(0, 0, 0, 0.6);
}

.charts-section {
  margin-top: 1.5rem;
  
  .chart-container {
    height: 280px;
    margin: 1rem 0;
    position: relative;
  }
}

// Animaciones
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Responsive adjustments
@media (max-width: 600px) {
  .stats-grid {
    .stat-card {
      .stat-value {
        font-size: 1.1rem;
      }
      .stat-label {
        font-size: 0.7rem;
      }
      .stat-icon {
        width: 36px;
        height: 36px;
      }
    }
  }
  
  .v-tabs {
    .v-tab {
      min-width: 0 !important;
      padding: 0 8px !important;
      font-size: 0.85rem;
    }
  }
  
  .charts-section {
    .chart-container {
      height: 250px;
    }
  }
  
  .favorite-workout-card {
    .favorite-icon {
      width: 40px;
      height: 40px;
    }
  }
}
</style>