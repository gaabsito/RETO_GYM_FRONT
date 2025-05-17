<!-- src/views/MedicionView.vue -->
<script setup lang="ts">
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue';
import { useMedicionStore } from '@/stores/medicion';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import type { Medicion, MedicionCreateDTO } from '@/types/Medicion';
import PageHeader from '@/components/PageHeader.vue';
import SectionContainer from '@/components/SectionContainer.vue';
//import progressImage from '@/assets/images/progress.jpg';

// Stores
const medicionStore = useMedicionStore();
const authStore = useAuthStore();
const { mediciones, loading, error } = storeToRefs(medicionStore);

// UI states
const showForm = ref(false);
const formMode = ref<'create' | 'edit'>('create');
const editingMedicionId = ref<number | null>(null);
const showDeleteDialog = ref(false);
const medicionToDelete = ref<number | null>(null);
const formRef = ref<any>(null);
const successMessage = ref('');

// Referencias para los gráficos
const chartRef = ref(null);
const chart = ref(null);

// Estado para controlar qué series mostrar en la gráfica comparativa
const showWeight = ref(true);
const showBMI = ref(true);
const showBodyFat = ref(true);
const showWaist = ref(false);

// Table headers
const tableHeaders = ref([
  { title: 'Fecha', key: 'fecha', sortable: true },
  { title: 'Peso (kg)', key: 'peso', sortable: true },
  { title: 'IMC', key: 'imc', sortable: true },
  { title: '% Grasa', key: 'porcentajeGrasa', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false }
]);

// Form data
const medicionForm = ref<MedicionCreateDTO>({
  usuarioID: authStore.user?.usuarioID || 0,
  fecha: new Date(),
  peso: undefined,
  altura: undefined,
  porcentajeGrasa: undefined,
  circunferenciaBrazo: undefined,
  circunferenciaPecho: undefined,
  circunferenciaCintura: undefined,
  circunferenciaMuslo: undefined,
  notas: ''
});

// Load data on component mount
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    return;
  }

  try {
    await medicionStore.fetchMediciones();
    await medicionStore.fetchMedicionesResumen();
    
    // Inicializar el gráfico comparativo después de cargar los datos
    setTimeout(initComparisonChart, 300);
  } catch (err) {
    console.error('Error loading measurements:', err);
  }
});

// Computed properties for data visualization
const mostRecentMedicion = computed(() => {
  if (!mediciones.value || mediciones.value.length === 0) return null;
  return mediciones.value[0]; // Assuming the list is sorted by date (newest first)
});

const previousMedicion = computed(() => {
  if (!mediciones.value || mediciones.value.length < 2) return null;
  return mediciones.value[1]; // The second most recent measurement
});

// Calculate differences if both current and previous measurements exist
const calculateChange = (current?: number, previous?: number) => {
  if (current === undefined || previous === undefined) return null;
  return current - previous;
};

const weightChange = computed(() => {
  return calculateChange(mostRecentMedicion.value?.peso, previousMedicion.value?.peso);
});

const bodyFatChange = computed(() => {
  return calculateChange(
    mostRecentMedicion.value?.porcentajeGrasa, 
    previousMedicion.value?.porcentajeGrasa
  );
});

// Process weight history data for the Vuetify sparkline
const weightHistoryData = computed(() => {
  if (!mediciones.value || mediciones.value.length === 0) return [];
  
  return mediciones.value
    .slice(0, 10)  // Get the 10 most recent measurements
    .map(m => m.peso || 0)  // Extract weight values
    .reverse();  // Reverse to show oldest to newest
});

// Get dates for weight labels
const weightHistoryLabels = computed(() => {
  if (!mediciones.value || mediciones.value.length === 0) return [];
  
  return mediciones.value
    .slice(0, 10)
    .map(m => formatDate(m.fecha))
    .reverse();
});

// Datos para el gráfico comparativo
const comparisonChartData = computed(() => {
  if (!mediciones.value || mediciones.value.length === 0) return { labels: [], datasets: [] };
  
  // Usar hasta las últimas 10 mediciones ordenadas cronológicamente
  const chartData = [...mediciones.value]
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .slice(-10);
  
  // Preparar etiquetas de fechas
  const labels = chartData.map(m => new Date(m.fecha).toLocaleDateString(undefined, { 
    day: '2-digit', 
    month: 'short' 
  }));
  
  // Preparar datasets
  const datasets = [];
  
  // Dataset para peso
  if (showWeight.value) {
    datasets.push({
      label: 'Peso (kg)',
      data: chartData.map(m => m.peso),
      borderColor: '#e25401',
      backgroundColor: 'rgba(226, 84, 1, 0.1)',
      yAxisID: 'y',
      tension: 0.4,
      fill: true
    });
  }
  
  // Dataset para IMC
  if (showBMI.value) {
    datasets.push({
      label: 'IMC',
      data: chartData.map(m => m.imc),
      borderColor: '#2e7d32',
      backgroundColor: 'rgba(46, 125, 50, 0.1)',
      yAxisID: 'y1',
      tension: 0.4,
      fill: true
    });
  }
  
  // Dataset para % grasa
  if (showBodyFat.value) {
    datasets.push({
      label: '% Grasa',
      data: chartData.map(m => m.porcentajeGrasa),
      borderColor: '#1976d2',
      backgroundColor: 'rgba(25, 118, 210, 0.1)',
      yAxisID: 'y1',
      tension: 0.4,
      fill: true
    });
  }
  
  // Dataset para cintura
  if (showWaist.value) {
    datasets.push({
      label: 'Cintura (cm)',
      data: chartData.map(m => m.circunferenciaCintura),
      borderColor: '#ed6c02',
      backgroundColor: 'rgba(237, 108, 2, 0.1)',
      yAxisID: 'y2',
      tension: 0.4,
      fill: true
    });
  }
  
  return { labels, datasets };
});

// Función para inicializar el gráfico comparativo
const initComparisonChart = () => {
  if (!chartRef.value) return;
  
  const ctx = chartRef.value.getContext('2d');
  
  // Destruir gráfico existente si lo hay
  if (chart.value) {
    chart.value.destroy();
  }
  
  // Comprobar si hay datos para mostrar
  if (!mediciones.value || mediciones.value.length < 2) return;
  
  const data = comparisonChartData.value;
  
  // Configuración del gráfico
  chart.value = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 12,
            usePointStyle: true
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: 10,
          cornerRadius: 6
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Peso (kg)'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: {
            drawOnChartArea: false
          },
          title: {
            display: true,
            text: 'IMC / % Grasa'
          }
        },
        y2: {
          type: 'linear',
          display: showWaist.value,
          position: 'right',
          grid: {
            drawOnChartArea: false
          },
          title: {
            display: true,
            text: 'Medidas (cm)'
          }
        }
      }
    }
  });
};

// Form validation rules
const rules = {
  peso: [
    (v: any) => (v === undefined || v === null || v === '') || (v >= 20 && v <= 300) || 'El peso debe estar entre 20 y 300 kg'
  ],
  altura: [
    (v: any) => (v === undefined || v === null || v === '') || (v >= 0.5 && v <= 2.5) || 'La altura debe estar entre 0.5 y 2.5 metros'
  ],
  porcentajeGrasa: [
    (v: any) => (v === undefined || v === null || v === '') || (v >= 1 && v <= 80) || 'El porcentaje de grasa debe estar entre 1% y 80%'
  ],
  circunferencia: [
    (v: any) => (v === undefined || v === null || v === '') || (v >= 10 && v <= 200) || 'La medida debe estar entre 10 y 200 cm'
  ],
  notas: [
    (v: any) => (v === undefined || v === null || v === '') || v.length <= 500 || 'Las notas no pueden exceder los 500 caracteres'
  ]
};

// Form handling methods
const openCreateForm = () => {
  formMode.value = 'create';
  medicionForm.value = {
    usuarioID: authStore.user?.usuarioID || 0,
    fecha: new Date(),
    peso: undefined,
    altura: undefined,
    porcentajeGrasa: undefined,
    circunferenciaBrazo: undefined,
    circunferenciaPecho: undefined,
    circunferenciaCintura: undefined,
    circunferenciaMuslo: undefined,
    notas: ''
  };
  editingMedicionId.value = null;
  showForm.value = true;
};

const openEditForm = (medicion: Medicion) => {
  formMode.value = 'edit';
  medicionForm.value = {
    usuarioID: medicion.usuarioID,
    fecha: new Date(medicion.fecha),
    peso: medicion.peso,
    altura: medicion.altura,
    porcentajeGrasa: medicion.porcentajeGrasa,
    circunferenciaBrazo: medicion.circunferenciaBrazo,
    circunferenciaPecho: medicion.circunferenciaPecho,
    circunferenciaCintura: medicion.circunferenciaCintura,
    circunferenciaMuslo: medicion.circunferenciaMuslo,
    notas: medicion.notas
  };
  editingMedicionId.value = medicion.medicionID;
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
};

const handleSubmitForm = async () => {
  try {
    if (!formRef.value) return;
    
    const { valid } = await formRef.value.validate();
    if (!valid) return;

    if (formMode.value === 'create') {
      await medicionStore.createMedicion(medicionForm.value);
      successMessage.value = 'Medición registrada correctamente';
    } else {
      if (editingMedicionId.value) {
        await medicionStore.updateMedicion(editingMedicionId.value, medicionForm.value);
        successMessage.value = 'Medición actualizada correctamente';
      }
    }

    // Refresh data
    await medicionStore.fetchMediciones();
    await medicionStore.fetchMedicionesResumen();
    
    // Close form
    showForm.value = false;
    
    // Actualizar el gráfico comparativo
    setTimeout(initComparisonChart, 300);
    
    // Auto-hide success message after 3 seconds
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (err) {
    console.error('Error saving measurement:', err);
  }
};

const confirmDelete = (id: number) => {
  medicionToDelete.value = id;
  showDeleteDialog.value = true;
};

const handleDelete = async () => {
  if (!medicionToDelete.value) return;
  
  try {
    await medicionStore.deleteMedicion(medicionToDelete.value);
    showDeleteDialog.value = false;
    medicionToDelete.value = null;
    
    // Refresh data
    await medicionStore.fetchMediciones();
    await medicionStore.fetchMedicionesResumen();
    
    // Actualizar el gráfico comparativo
    setTimeout(initComparisonChart, 300);
    
    successMessage.value = 'Medición eliminada correctamente';
    
    // Auto-hide success message after 3 seconds
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (err) {
    console.error('Error deleting measurement:', err);
  }
};

// Format date for display
const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString();
};

// Monitorizar cambios en las preferencias de visualización
watch([showWeight, showBMI, showBodyFat, showWaist], () => {
  initComparisonChart();
});

// Monitorizar cambios en mediciones
watch(() => mediciones.value, () => {
  initComparisonChart();
}, { deep: true });

// Limpiar al desmontar
onBeforeUnmount(() => {
  if (chart.value) {
    chart.value.destroy();
  }
});
</script>

<template>
  <v-container fluid class="pa-0">
    <!-- Hero Section -->
    <PageHeader 
      title="Seguimiento de Medidas"
      subtitle="Registra y monitorea tus medidas corporales y progreso a lo largo del tiempo"
      :backgroundImage="progressImage"
    >
      <v-btn 
        color="primary" 
        size="x-large" 
        prepend-icon="mdi-plus"
        @click="openCreateForm"
        class="mt-4"
      >
        Registrar Nueva Medición
      </v-btn>
    </PageHeader>

    <!-- Success message -->
    <v-alert
      v-if="successMessage"
      type="success"
      variant="tonal"
      closable
      class="mx-auto my-4"
      max-width="800px"
    >
      {{ successMessage }}
    </v-alert>

    <!-- Loading state -->
    <div v-if="loading" class="d-flex justify-center align-center my-8">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
      ></v-progress-circular>
    </div>

    <!-- Error state -->
    <v-alert v-else-if="error" type="error" class="mx-auto my-4" max-width="800px">
      {{ error }}
    </v-alert>

    <div v-else>
      <!-- Latest Measurements Summary -->
      <SectionContainer title="Resumen Actual" v-if="mostRecentMedicion">
        <v-row class="measurement-summary">
          <v-col cols="12" md="4">
            <v-card class="h-100">
              <v-card-title class="measurement-card-title d-flex align-center">
                <v-icon start color="white" class="me-2">mdi-weight</v-icon>
                Peso
              </v-card-title>
              <v-card-text class="d-flex flex-column align-center">
                <div class="measurement-value">{{ mostRecentMedicion.peso || '—' }} kg</div>
                <div v-if="weightChange !== null" class="measurement-change" :class="weightChange < 0 ? 'text-success' : 'text-error'">
                  <v-icon size="small" :color="weightChange < 0 ? 'success' : 'error'">{{ weightChange < 0 ? 'mdi-arrow-down' : 'mdi-arrow-up' }}</v-icon>
                  {{ Math.abs(weightChange).toFixed(1) }} kg
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card class="h-100">
              <v-card-title class="measurement-card-title d-flex align-center">
                <v-icon start color="white" class="me-2">mdi-human-male-height</v-icon>
                IMC
              </v-card-title>
              <v-card-text class="d-flex flex-column align-center">
                <div class="measurement-value">{{ mostRecentMedicion.imc ? mostRecentMedicion.imc.toFixed(1) : '—' }}</div>
                <div class="measurement-category">
                  {{ mostRecentMedicion.imc 
                    ? (mostRecentMedicion.imc < 18.5 
                      ? 'Bajo peso' 
                      : mostRecentMedicion.imc < 25 
                        ? 'Peso normal' 
                        : mostRecentMedicion.imc < 30 
                          ? 'Sobrepeso' 
                          : 'Obesidad')
                    : '—' }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card class="h-100">
              <v-card-title class="measurement-card-title d-flex align-center">
                <v-icon start color="white" class="me-2">mdi-percent</v-icon>
                Grasa Corporal
              </v-card-title>
              <v-card-text class="d-flex flex-column align-center">
                <div class="measurement-value">{{ mostRecentMedicion.porcentajeGrasa || '—' }}%</div>
                <div v-if="bodyFatChange !== null" class="measurement-change" :class="bodyFatChange < 0 ? 'text-success' : 'text-error'">
                  <v-icon size="small" :color="bodyFatChange < 0 ? 'success' : 'error'">{{ bodyFatChange < 0 ? 'mdi-arrow-down' : 'mdi-arrow-up' }}</v-icon>
                  {{ Math.abs(bodyFatChange).toFixed(1) }}%
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Circumference measurements -->
        <v-row class="mt-4">
          <v-col cols="12" class="d-flex flex-wrap justify-space-around">
            <div v-if="mostRecentMedicion.circunferenciaBrazo" class="circumference-item">
              <div class="circ-label">Brazo</div>
              <div class="circ-value">{{ mostRecentMedicion.circunferenciaBrazo }} cm</div>
            </div>
            <div v-if="mostRecentMedicion.circunferenciaPecho" class="circumference-item">
              <div class="circ-label">Pecho</div>
              <div class="circ-value">{{ mostRecentMedicion.circunferenciaPecho }} cm</div>
            </div>
            <div v-if="mostRecentMedicion.circunferenciaCintura" class="circumference-item">
              <div class="circ-label">Cintura</div>
              <div class="circ-value">{{ mostRecentMedicion.circunferenciaCintura }} cm</div>
            </div>
            <div v-if="mostRecentMedicion.circunferenciaMuslo" class="circumference-item">
              <div class="circ-label">Muslo</div>
              <div class="circ-value">{{ mostRecentMedicion.circunferenciaMuslo }} cm</div>
            </div>
          </v-col>
        </v-row>
      </SectionContainer>

      <!-- No data state -->
      <SectionContainer v-else>
        <v-row justify="center" align="center" class="py-8">
          <v-col cols="12" class="text-center">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-scale-bathroom</v-icon>
            <h3 class="text-h5 mb-2">No tienes mediciones registradas</h3>
            <p class="text-subtitle-1 text-medium-emphasis mb-6">
              Registra tu primera medición para comenzar a hacer seguimiento de tu progreso
            </p>
            <v-btn 
              color="primary" 
              @click="openCreateForm"
              size="large"
              prepend-icon="mdi-plus"
            >
              Registrar Primera Medición
            </v-btn>
          </v-col>
        </v-row>
      </SectionContainer>

      <!-- Gráfico comparativo - NUEVA SECCIÓN -->
      <SectionContainer title="Comparativa de Mediciones" v-if="mediciones.length > 1">
        <v-card>
          <v-card-text>
            <v-row>
              <v-col cols="12">
                <h4 class="text-subtitle-1 mb-4">Evolución comparativa de tus mediciones</h4>
                
                <!-- Controles para seleccionar métricas -->
                <div class="d-flex flex-wrap align-center mb-4">
                  <v-checkbox v-model="showWeight" label="Peso" color="primary" hide-details class="mr-4 metric-checkbox"></v-checkbox>
                  <v-checkbox v-model="showBMI" label="IMC" color="success" hide-details class="mr-4 metric-checkbox"></v-checkbox>
                  <v-checkbox v-model="showBodyFat" label="% Grasa" color="info" hide-details class="mr-4 metric-checkbox"></v-checkbox>
                  <v-checkbox v-model="showWaist" label="Cintura" color="warning" hide-details class="metric-checkbox"></v-checkbox>
                </div>
                
                <!-- Contenedor del gráfico -->
                <div class="comparison-chart-container">
                  <canvas ref="chartRef"></canvas>
                </div>
                
                <div class="text-caption text-center mt-3">
                  Selecciona qué métricas quieres comparar para visualizar mejor tu progreso
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </SectionContainer>

      <!-- Progress Chart using Vuetify Sparkline -->
      <SectionContainer title="Progreso de Peso" backgroundColor="#f8f8f8" v-if="mediciones.length > 1">
        <v-card>
          <v-card-text>
            <v-row>
              <v-col cols="12">
                <h4 class="text-subtitle-1 mb-4">Evolución del peso (en kg)</h4>
                
                <!-- Vuetify Sparkline component for visualizing weight trend -->
                <v-sheet height="200" class="d-flex align-center justify-center">
                  <v-sparkline
                    :value="weightHistoryData"
                    :labels="weightHistoryLabels"
                    :gradient="['#e25401', '#ff8c00']"
                    :line-width="3"
                    :padding="8"
                    :smooth="10"
                    :auto-draw="true"
                    stroke-linecap="round"
                    auto-draw-duration="2000"
                    show-labels
                    label-size="6"
                    class="weight-sparkline"
                  />
                </v-sheet>
                
                <div class="text-caption text-center mt-2">
                  Últimas {{ weightHistoryData.length }} mediciones (de más antigua a más reciente)
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </SectionContainer>

      <!-- Measurement History Table -->
      <SectionContainer title="Historial de Mediciones" v-if="mediciones.length > 0">
        <v-card>
          <v-data-table
            :headers="tableHeaders"
            :items="mediciones"
            :items-per-page="5"
            density="comfortable"
            class="elevation-1"
          >
            <template v-slot:item.fecha="{ item }">
              {{ formatDate(item.fecha) }}
            </template>
            <template v-slot:item.peso="{ item }">
              {{ item.peso ? `${item.peso} kg` : '—' }}
            </template>
            <template v-slot:item.imc="{ item }">
              {{ item.imc ? item.imc.toFixed(1) : '—' }}
            </template>
            <template v-slot:item.porcentajeGrasa="{ item }">
              {{ item.porcentajeGrasa ? `${item.porcentajeGrasa}%` : '—' }}
            </template>
            <template v-slot:item.actions="{ item }">
              <div class="d-flex">
                <v-btn
                  icon
                  variant="text"
                  color="primary"
                  size="small"
                  @click="openEditForm(item)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                  icon
                  variant="text"
                  color="error"
                  size="small"
                  @click="confirmDelete(item.medicionID)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </SectionContainer>
    </div>

    <!-- Form Dialog -->
    <v-dialog v-model="showForm" max-width="600px">
      <v-card>
        <v-card-title class="dialog-title">
          {{ formMode === 'create' ? 'Nueva Medición' : 'Editar Medición' }}
          <v-btn icon @click="closeForm" class="ml-auto">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-form ref="formRef" @submit.prevent="handleSubmitForm">
            <v-row>
              <v-col cols="12" sm="6">
                <v-date-picker v-model="medicionForm.fecha" title="Fecha" class="mb-4" width="100%"></v-date-picker>
              </v-col>
              
              <v-col cols="12" sm="6">
                <v-card variant="outlined" class="pa-4">
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        v-model="medicionForm.peso"
                        :rules="rules.peso"
                        label="Peso (kg)"
                        type="number"
                        density="comfortable"
                        hint="Entre 20 y 300 kg"
                        variant="outlined"
                      ></v-text-field>
                    </v-col>
                    
                    <v-col cols="12">
                      <v-text-field
                        v-model="medicionForm.altura"
                        :rules="rules.altura"
                        label="Altura (m)"
                        type="number"
                        step="0.01"
                        density="comfortable"
                        hint="Entre 0.5 y 2.5 metros"
                        variant="outlined"
                      ></v-text-field>
                    </v-col>
                    
                    <v-col cols="12">
                      <v-text-field
                        v-model="medicionForm.porcentajeGrasa"
                        :rules="rules.porcentajeGrasa"
                        label="% Grasa Corporal"
                        type="number"
                        density="comfortable"
                        hint="Entre 1% y 80%"
                        variant="outlined"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>
              
              <v-col cols="12">
                <v-card variant="outlined" class="pa-4">
                  <div class="text-subtitle-1 mb-2">Circunferencias (cm)</div>
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="medicionForm.circunferenciaBrazo"
                        :rules="rules.circunferencia"
                        label="Brazo"
                        type="number"
                        density="comfortable"
                        variant="outlined"
                      ></v-text-field>
                    </v-col>
                    
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="medicionForm.circunferenciaPecho"
                        :rules="rules.circunferencia"
                        label="Pecho"
                        type="number"
                        density="comfortable"
                        variant="outlined"
                      ></v-text-field>
                    </v-col>
                    
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="medicionForm.circunferenciaCintura"
                        :rules="rules.circunferencia"
                        label="Cintura"
                        type="number"
                        density="comfortable"
                        variant="outlined"
                      ></v-text-field>
                    </v-col>
                    
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="medicionForm.circunferenciaMuslo"
                        :rules="rules.circunferencia"
                        label="Muslo"
                        type="number"
                        density="comfortable"
                        variant="outlined"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>
              
              <v-col cols="12">
                <v-textarea
                  v-model="medicionForm.notas"
                  :rules="rules.notas"
                  label="Notas"
                  rows="3"
                  density="comfortable"
                  variant="outlined"
                  counter="500"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            variant="outlined"
            @click="closeForm"
            class="mr-2"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="handleSubmitForm"
            :loading="loading"
          >
            {{ formMode === 'create' ? 'Guardar' : 'Actualizar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="bg-error text-white">
          Confirmar eliminación
        </v-card-title>
        <v-card-text class="pt-4">
          ¿Estás seguro de que deseas eliminar esta medición? Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="showDeleteDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="handleDelete"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.measurement-summary {
  margin-top: 1rem;
}

.measurement-card-title {
  background-color: $primary-color;
  color: white;
  padding: 1rem;
  font-family: $font-family-base;
}

.measurement-value {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 1rem 0;
  font-family: $font-family-base;
  color: $secondary-color;
}

.measurement-category {
  font-size: 1.2rem;
  color: $secondary-color;
  margin-bottom: 1rem;
}

.measurement-change {
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 1rem;
  gap: 0.25rem;
  
  &.text-success {
    color: #4CAF50;
  }
  
  &.text-error {
    color: #F44336;
  }
}

.weight-sparkline {
  width: 100%;
  height: 100%;
}

.dialog-title {
  background-color: $primary-color;
  color: white;
  display: flex;
  align-items: center;
  font-family: $font-family-base;
}

.circumference-item {
  padding: 1rem;
  min-width: 120px;
  text-align: center;
  border-radius: $border-radius;
  background-color: $light-gray;
  margin: 0.5rem;
  
  .circ-label {
    font-size: 0.9rem;
    color: rgba(0, 0, 0, 0.6);
    margin-bottom: 0.25rem;
  }
  
  .circ-value {
    font-size: 1.25rem;
    font-weight: 600;
    color: $secondary-color;
    font-family: $font-family-base;
  }
}

/* Estilos para el nuevo gráfico comparativo */
.comparison-chart-container {
  position: relative;
  height: 350px;
  width: 100%;
  margin: 1.5rem 0;
}

.metric-checkbox {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}

// Mobile-first responsive adjustments
@media (max-width: 600px) {
  .measurement-value {
    font-size: 2rem;
  }
  
  .measurement-card-title {
    font-size: 1rem;
  }
  
  .circumference-item {
    min-width: 100px;
    padding: 0.75rem;
    
    .circ-value {
      font-size: 1.1rem;
    }
  }
  
  .comparison-chart-container {
    height: 250px;
  }
  
  .metric-checkbox {
    margin-right: 0.3rem !important;
    
    :deep(.v-checkbox__label) {
      font-size: 0.85rem;
    }
  }
}
</style>