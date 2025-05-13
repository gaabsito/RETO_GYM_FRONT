<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRutinasCompletadasStore } from '@/stores/rutinasCompletadas'
import { useMedicionesStore } from '@/stores/mediciones'
import type { ResumenRutinas } from '@/types/RutinaCompletada'
import type { Medicion } from '@/types/Medicion'

// Props
const props = defineProps<{
  showCalendarHeatmap?: boolean;
  showWeeklyChart?: boolean;
  showMonthlyChart?: boolean;
  showProgress?: boolean;
  limitChartData?: number;
}>()

// Stores
const rutinasCompletadasStore = useRutinasCompletadasStore()
const medicionesStore = useMedicionesStore()

// Estado local
const loading = ref(false)
const error = ref('')
const resumen = ref<ResumenRutinas | null>(null)
const mediciones = ref<Medicion[]>([])
const showFullDetails = ref(false)
const activeTab = ref(0)

// Cargar datos
const cargarDatos = async () => {
  try {
    loading.value = true
    error.value = ''
    
    // Cargar resumen de rutinas completadas
    resumen.value = await rutinasCompletadasStore.fetchResumen()
    
    // Cargar mediciones para gráficos de progreso
    if (props.showProgress) {
      try {
        mediciones.value = await medicionesStore.getMediciones()
      } catch (medError) {
        console.error('Error al cargar mediciones:', medError)
        // No establecemos error global aquí para no interrumpir toda la pantalla
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
  // Limitar datos para gráficos si se ha especificado
  const limit = props.limitChartData || 12
  
  // Filtrar y ordenar las mediciones primero por fecha
  const sortedMediciones = [...mediciones.value]
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .slice(-limit)
  
  // Datos para gráfico de peso si hay mediciones disponibles
  const pesoData = {
    labels: sortedMediciones.map(m => new Date(m.fecha).toLocaleDateString()),
    datasets: [{
      label: 'Peso (kg)',
      data: sortedMediciones.map(m => m.peso),
      borderColor: '#e25401',
      backgroundColor: 'rgba(226, 84, 1, 0.1)',
      tension: 0.4,
      fill: true
    }]
  }
  
  // Datos para gráfico de IMC si hay mediciones disponibles
  const imcData = {
    labels: sortedMediciones.map(m => new Date(m.fecha).toLocaleDateString()),
    datasets: [{
      label: 'IMC',
      data: sortedMediciones.map(m => m.imc),
      borderColor: '#2f7d32',
      backgroundColor: 'rgba(47, 125, 50, 0.1)',
      tension: 0.4,
      fill: true
    }]
  }
  
  // Datos para gráfico de porcentaje de grasa si hay mediciones disponibles
  const grasaData = {
    labels: sortedMediciones.map(m => new Date(m.fecha).toLocaleDateString()),
    datasets: [{
      label: 'Grasa corporal (%)',
      data: sortedMediciones.map(m => m.porcentajeGrasa),
      borderColor: '#1976d2',
      backgroundColor: 'rgba(25, 118, 210, 0.1)',
      tension: 0.4,
      fill: true
    }]
  }
  
  return {
    pesoData,
    imcData,
    grasaData
  }
})

// Formato para números
const formatNumber = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '-'
  return value.toLocaleString()
}

// Al montar el componente
onMounted(() => {
  cargarDatos()
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
</script>

<template>
  <div class="progreso-container">
    <!-- Alerta de error -->
    <v-alert v-if="error" type="error" class="mb-4">
      {{ error }}
    </v-alert>
    
    <!-- Estado de carga -->
    <div v-if="loading" class="d-flex justify-center my-6">
      <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
    </div>
    
    <!-- Sin datos -->
    <v-alert v-else-if="!resumen" type="info" class="mb-4">
      No hay suficientes datos para mostrar estadísticas. Completa algunos entrenamientos para ver tu progreso.
    </v-alert>
    
    <!-- Contenido principal -->
    <div v-else>
      <!-- Tarjetas de resumen -->
      <div class="stats-cards">
        <v-row>
          <v-col cols="6" sm="3">
            <v-card class="stat-card">
              <v-card-text class="d-flex flex-column align-center">
                <div class="stat-icon primary-bg">
                  <v-icon color="white" size="24">mdi-dumbbell</v-icon>
                </div>
                <div class="stat-label">Total completadas</div>
                <div class="stat-value">{{ formatNumber(resumen.totalRutinasCompletadas) }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="6" sm="3">
            <v-card class="stat-card">
              <v-card-text class="d-flex flex-column align-center">
                <div class="stat-icon success-bg">
                  <v-icon color="white" size="24">mdi-calendar-week</v-icon>
                </div>
                <div class="stat-label">Última semana</div>
                <div class="stat-value">{{ formatNumber(resumen.rutinasUltimaSemana) }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="6" sm="3">
            <v-card class="stat-card">
              <v-card-text class="d-flex flex-column align-center">
                <div class="stat-icon warning-bg">
                  <v-icon color="white" size="24">mdi-fire</v-icon>
                </div>
                <div class="stat-label">Calorías quemadas</div>
                <div class="stat-value">{{ formatNumber(resumen.caloriasTotales) }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="6" sm="3">
            <v-card class="stat-card">
              <v-card-text class="d-flex flex-column align-center">
                <div class="stat-icon info-bg">
                  <v-icon color="white" size="24">mdi-clock-outline</v-icon>
                </div>
                <div class="stat-label">Tiempo total</div>
                <div class="stat-value">{{ formatNumber(resumen.minutosTotales) }} min</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>
      
      <!-- Entrenamiento favorito -->
      <v-card v-if="resumen.nombreEntrenamientoMasRepetido" class="my-4 favorite-workout-card">
        <v-card-text>
          <div class="d-flex align-center">
            <div class="favorite-icon">
              <v-icon size="32" color="amber-darken-2">mdi-star</v-icon>
            </div>
            <div class="ms-4">
              <div class="text-subtitle-1 font-weight-bold">Tu entrenamiento favorito</div>
              <div class="text-h6 primary--text">{{ resumen.nombreEntrenamientoMasRepetido }}</div>
              <div class="text-caption">
                Has completado este entrenamiento {{ resumen.vecesCompletado }} veces
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
      
      <!-- Gráficos para visualización de progreso -->
      <div v-if="props.showProgress && mediciones.length > 0">
        <h3 class="text-h6 mt-6 mb-3">Progreso físico</h3>
        
        <v-tabs v-model="activeTab" bg-color="transparent" color="primary">
          <v-tab value="0">Peso</v-tab>
          <v-tab value="1">IMC</v-tab>
          <v-tab value="2">% Grasa</v-tab>
        </v-tabs>
        
        <v-window v-model="activeTab">
          <!-- Gráfico de Peso -->
          <v-window-item value="0">
            <v-card flat>
              <v-card-text class="py-4">
                <canvas
                  ref="weightChartCanvas"
                  id="weightChart"
                  height="250"
                >
                </canvas>
              </v-card-text>
            </v-card>
          </v-window-item>
          
          <!-- Gráfico de IMC -->
          <v-window-item value="1">
            <v-card flat>
              <v-card-text class="py-4">
                <canvas
                  ref="imcChartCanvas"
                  id="imcChart"
                  height="250"
                >
                </canvas>
              </v-card-text>
            </v-card>
          </v-window-item>
          
          <!-- Gráfico de % Grasa -->
          <v-window-item value="2">
            <v-card flat>
              <v-card-text class="py-4">
                <canvas
                  ref="grasaChartCanvas"
                  id="grasaChart"
                  height="250"
                >
                </canvas>
              </v-card-text>
            </v-card>
          </v-window-item>
        </v-window>
      </div>
      
      <!-- Nivel de esfuerzo promedio -->
      <v-card v-if="resumen.promedioEsfuerzo" class="my-4">
        <v-card-title>Nivel de esfuerzo promedio</v-card-title>
        <v-card-text>
          <div class="d-flex flex-column align-center">
            <div class="esfuerzo-gauge">
              <v-progress-circular
                :model-value="resumen.promedioEsfuerzo * 10"
                :size="120"
                :width="15"
                color="amber-darken-2"
                class="mb-3"
              >
                {{ resumen.promedioEsfuerzo.toFixed(1) }}
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
      
      <!-- Botón para ver más detalles o estadísticas adicionales -->
      <div class="text-center mt-6">
        <v-btn
          v-if="!showFullDetails"
          color="primary"
          variant="outlined"
          @click="showFullDetails = true"
        >
          Ver estadísticas detalladas
          <v-icon end>mdi-chevron-down</v-icon>
        </v-btn>
      </div>
      
      <!-- Estadísticas detalladas (mostradas solo si se expande) -->
      <v-expand-transition>
        <div v-if="showFullDetails">
          <h3 class="text-h6 mt-6 mb-3">Estadísticas mensuales</h3>
          
          <v-card>
            <v-card-text>
              <!-- Aquí puedes añadir gráficos más avanzados -->
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

<script>
// Script de ciclo de vida para inicializar Chart.js
import { onMounted, onUpdated, watch } from 'vue'
import Chart from 'chart.js/auto'

export default {
  setup() {
    let weightChart = null
    let imcChart = null 
    let grasaChart = null
    
    const initCharts = () => {
      // Inicializar gráfico de peso
      const weightChartEl = document.getElementById('weightChart')
      if (weightChartEl && this.chartData && this.chartData.pesoData) {
        if (weightChart) weightChart.destroy()
        weightChart = new Chart(weightChartEl, {
          type: 'line',
          data: this.chartData.pesoData,
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Evolución del peso'
              }
            }
          }
        })
      }
      
      // Inicializar gráfico de IMC
      const imcChartEl = document.getElementById('imcChart')
      if (imcChartEl && this.chartData && this.chartData.imcData) {
        if (imcChart) imcChart.destroy()
        imcChart = new Chart(imcChartEl, {
          type: 'line',
          data: this.chartData.imcData,
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Evolución del IMC'
              }
            }
          }
        })
      }
      
      // Inicializar gráfico de grasa
      const grasaChartEl = document.getElementById('grasaChart')
      if (grasaChartEl && this.chartData && this.chartData.grasaData) {
        if (grasaChart) grasaChart.destroy()
        grasaChart = new Chart(grasaChartEl, {
          type: 'line',
          data: this.chartData.grasaData,
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Porcentaje de grasa corporal'
              }
            }
          }
        })
      }
    }
    
    onMounted(() => {
      initCharts()
    })
    
    onUpdated(() => {
      initCharts()
    })
    
    watch(() => this.mediciones, () => {
      setTimeout(() => {
        initCharts()
      }, 100)
    }, { deep: true })
    
    watch(() => this.activeTab, () => {
      setTimeout(() => {
        initCharts()
      }, 100)
    })
    
    return {}
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.progreso-container {
  width: 100%;
}

.stats-cards {
  margin-bottom: 1rem;
  
  .stat-card {
    border-radius: $border-radius;
    height: 100%;
    
    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.5rem;
    }
    
    .primary-bg {
      background-color: $primary-color;
    }
    
    .success-bg {
      background-color: #2e7d32;
    }
    
    .warning-bg {
      background-color: #ed6c02;
    }
    
    .info-bg {
      background-color: #0288d1;
    }
    
    .stat-label {
      font-size: 0.9rem;
      color: rgba(0, 0, 0, 0.6);
      margin-bottom: 0.25rem;
      text-align: center;
    }
    
    .stat-value {
      font-size: 1.5rem;
      font-weight: 600;
      color: $secondary-color;
    }
  }
}

.favorite-workout-card {
  border-radius: $border-radius;
  
  .favorite-icon {
    background-color: rgba(255, 193, 7, 0.1);
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.esfuerzo-gauge {
  margin: 1rem 0;
}

.esfuerzo-scale {
  width: 80%;
  margin-top: 0.5rem;
}

// Responsive adjustments
@media (max-width: 600px) {
  .stats-cards {
    .stat-card {
      .stat-value {
        font-size: 1.25rem;
      }
    }
  }
  
  .v-tabs {
    .v-tab {
      min-width: 0 !important;
      padding: 0 10px !important;
    }
  }
}
</style>