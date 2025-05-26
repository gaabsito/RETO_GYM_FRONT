<!-- src/views/MedicionView.vue -->
<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from 'vue';
import { useMedicionStore } from '@/stores/medicion';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import type { Medicion, MedicionCreateDTO } from '@/types/Medicion';
import PageHeader from '@/components/PageHeader.vue';
import SectionContainer from '@/components/SectionContainer.vue';
import progressImage from '@/assets/images/progress.jpg';

import Chart from 'chart.js/auto';

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
const dateMenu = ref(false);
const activeTab = ref('medidas');

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

// Formateo legible de la fecha seleccionada
const formattedDate = computed(() => {
  if (!medicionForm.value.fecha) return '';
  
  const date = new Date(medicionForm.value.fecha);
  return new Intl.DateTimeFormat('es-ES', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  }).format(date);
});

// Calcular IMC si hay peso y altura
const calculatedIMC = computed(() => {
  if (!medicionForm.value.peso || !medicionForm.value.altura) return null;
  
  const imc = medicionForm.value.peso / (medicionForm.value.altura * medicionForm.value.altura);
  return imc.toFixed(1);
});

// Categoría de IMC basada en el valor calculado
const imcCategory = computed(() => {
  if (!calculatedIMC.value) return '';
  
  const imc = parseFloat(calculatedIMC.value);
  
  if (imc < 18.5) return 'Bajo peso';
  if (imc < 25) return 'Peso normal (saludable)';
  if (imc < 30) return 'Sobrepeso';
  if (imc < 35) return 'Obesidad grado I';
  if (imc < 40) return 'Obesidad grado II';
  return 'Obesidad grado III';
});

// Load data on component mount
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    return;
  }

  try {
    await medicionStore.fetchMediciones();
    await medicionStore.fetchMedicionesResumen();
    // Renderizar el gráfico después de que los datos estén disponibles
    nextTick(() => {
      renderWeightChart();
    });
  } catch (err) {
    console.error('Error loading measurements:', err);
  }
});

// Referencia al elemento canvas para el gráfico
const weightChart = ref<HTMLCanvasElement | null>(null);
// Variable para la instancia de Chart
let weightChartInstance: any = null;

// Función para renderizar el gráfico de peso
const renderWeightChart = () => {
  if (!weightChart.value || !mediciones.value || mediciones.value.length === 0) return;

  // Datos para el gráfico
  const data = mediciones.value
    .slice(0, 10)
    .map(m => ({ peso: m.peso || 0, fecha: formatDate(m.fecha) }))
    .reverse();

  // Destruir gráfico existente si hay uno
  if (weightChartInstance) {
    weightChartInstance.destroy();
  }

  // Crear nuevo gráfico
  const ctx = weightChart.value.getContext('2d');
  if (!ctx) return;

  weightChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(item => item.fecha),
      datasets: [{
        label: 'Peso (kg)',
        data: data.map(item => item.peso),
        borderColor: '#e25401',
        backgroundColor: 'rgba(226, 84, 1, 0.1)',
        borderWidth: 3,
        tension: 0.2,
        fill: true,
        pointBackgroundColor: '#e25401',
        pointRadius: 4,
        pointHoverRadius: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
          },
          ticks: {
            precision: 1
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
};

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
  activeTab.value = 'medidas'; // Resetear a la primera pestaña
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
  activeTab.value = 'medidas'; // Resetear a la primera pestaña
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
    
    // Update chart
    nextTick(() => {
      renderWeightChart();
    });
    
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
    
    // Update chart
    nextTick(() => {
      renderWeightChart();
    });
    
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

// Actualizar chart cuando cambian los datos
watch(() => mediciones.value, () => {
  nextTick(() => {
    renderWeightChart();
  });
}, { deep: true });
</script>

<template>
  <v-container fluid class="pa-0">
    <!-- Hero Section -->
    <PageHeader 
      title="Seguimiento de Medidas"
      subtitle="Registra y monitorea tus medidas corporales para ver tu progreso"
      :backgroundImage="progressImage"
    >
      <v-btn 
        color="#2d3a4e"
        size="x-large" 
        prepend-icon="mdi-plus" 
        @click="openCreateForm"
        class="mt-4 register-button"
        rounded="pill"
        elevation="5"
        min-width="200"
      >
        <span class="button-text">REGISTRAR NUEVA MEDICIÓN</span>
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
              color="#2d3a4e"
              size="x-large" 
              prepend-icon="mdi-plus" 
              @click="openCreateForm"
              class="register-button"
              rounded="pill"
              elevation="5"
              min-width="200"
            >
              <span class="button-text">REGISTRAR PRIMERA MEDICIÓN</span>
            </v-btn>
          </v-col>
        </v-row>
      </SectionContainer>

      <!-- Progress Chart using Chart.js -->
      <SectionContainer title="Progreso de Peso" backgroundColor="#f8f8f8" v-if="mediciones.length > 1">
        <v-card>
          <v-card-text>
            <v-row>
              <v-col cols="12">
                <h4 class="text-subtitle-1 mb-4">Evolución del peso (en kg)</h4>
                
                <!-- Gráfico de evolución del peso usando Chart.js -->
                <v-sheet height="200" class="d-flex align-center justify-center">
                  <canvas ref="weightChart" width="400" height="200"></canvas>
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

    <!-- Form Dialog - DISEÑO MEJORADO -->
    <v-dialog v-model="showForm" :fullscreen="$vuetify.display.smAndDown" :max-width="$vuetify.display.smAndDown ? '100%' : '800px'">
      <v-card>
        <!-- Header del formulario con color naranja -->
        <v-toolbar color="#e25401" density="compact" dark>
          <v-toolbar-title class="font-weight-bold">{{ formMode === 'create' ? 'NUEVA MEDICIÓN' : 'EDITAR MEDICIÓN' }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="closeForm">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text class="pa-4">
          <v-form ref="formRef" @submit.prevent="handleSubmitForm">
            <!-- Selección de fecha y descripción general -->
            <v-row class="mb-6">
              <v-col cols="12">
                <div class="text-subtitle-1 font-weight-medium mb-2">¿Cuándo tomaste estas medidas?</div>
                <v-menu
                  v-model="dateMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  min-width="auto"
                >
                  <template v-slot:activator="{ props }">
                    <v-text-field
                      v-model="formattedDate"
                      label="Fecha"
                      prepend-inner-icon="mdi-calendar"
                      readonly
                      variant="outlined"
                      v-bind="props"
                      density="comfortable"
                    ></v-text-field>
                  </template>
                  <v-date-picker 
                    v-model="medicionForm.fecha" 
                    @update:model-value="dateMenu = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>

            <!-- Secciones en pestañas para mejor organización y experiencia móvil -->
            <v-tabs v-model="activeTab" show-arrows density="comfortable" color="#e25401" slider-color="#e25401" class="my-4">
              <v-tab value="medidas" class="text-uppercase font-weight-bold px-4">
                <v-icon start class="me-2">mdi-weight</v-icon>
                Medidas Principales
              </v-tab>
              <v-tab value="circunferencias" class="text-uppercase font-weight-bold px-4">
                <v-icon start class="me-2">mdi-tape-measure</v-icon>
                Circunferencias
              </v-tab>
              <v-tab value="notas" class="text-uppercase font-weight-bold px-4">
                <v-icon start class="me-2">mdi-note-text</v-icon>
                Notas
              </v-tab>
            </v-tabs>

            <v-window v-model="activeTab" class="mt-4">
              <!-- Pestaña 1: Medidas Principales -->
              <v-window-item value="medidas">
                <v-card variant="flat" class="pa-0">
                  <v-card-title class="px-0 text-subtitle-1 font-weight-medium">
                    Medidas Principales
                    <div class="text-caption text-medium-emphasis mt-1">Estas medidas son esenciales para calcular tu IMC</div>
                  </v-card-title>
                  
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="medicionForm.peso"
                        :rules="rules.peso"
                        label="Peso (kg)"
                        prepend-inner-icon="mdi-weight"
                        type="number"
                        density="comfortable"
                        variant="outlined"
                        hint="Entre 20 y 300 kg"
                        persistent-hint
                      ></v-text-field>
                    </v-col>
                    
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="medicionForm.altura"
                        :rules="rules.altura"
                        label="Altura (m)"
                        prepend-inner-icon="mdi-human-male-height"
                        type="number"
                        step="0.01"
                        density="comfortable"
                        variant="outlined"
                        hint="Entre 0.5 y 2.5 metros"
                        persistent-hint
                      ></v-text-field>
                    </v-col>
                    
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="medicionForm.porcentajeGrasa"
                        :rules="rules.porcentajeGrasa"
                        label="% Grasa Corporal"
                        prepend-inner-icon="mdi-percent"
                        type="number"
                        density="comfortable"
                        variant="outlined"
                        hint="Entre 1% y 80%"
                        persistent-hint
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-card>
              </v-window-item>
              
              <!-- Pestaña 2: Circunferencias -->
              <v-window-item value="circunferencias">
                <v-card variant="flat" class="pa-0">
                  <v-card-title class="px-0 text-subtitle-1 font-weight-medium">
                    Circunferencias
                    <div class="text-caption text-medium-emphasis mt-1">Medidas en centímetros de diferentes partes del cuerpo</div>
                  </v-card-title>
                  
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="medicionForm.circunferenciaBrazo"
                        :rules="rules.circunferencia"
                        label="Brazo"
                        prepend-inner-icon="mdi-arm-flex"
                        type="number"
                        density="comfortable"
                        variant="outlined"
                        hint="A la altura del bíceps"
                        persistent-hint
                      ></v-text-field>
                    </v-col>
                    
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="medicionForm.circunferenciaPecho"
                        :rules="rules.circunferencia"
                        label="Pecho"
                        prepend-inner-icon="mdi-human-male"
                        type="number"
                        density="comfortable"
                        variant="outlined"
                        hint="A la altura de los pectorales"
                        persistent-hint
                      ></v-text-field>
                    </v-col>
                    
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="medicionForm.circunferenciaCintura"
                        :rules="rules.circunferencia"
                        label="Cintura"
                        prepend-inner-icon="mdi-tape-measure"
                        type="number"
                        density="comfortable"
                        variant="outlined"
                        hint="A la altura del ombligo"
                        persistent-hint
                      ></v-text-field>
                    </v-col>
                    
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="medicionForm.circunferenciaMuslo"
                        :rules="rules.circunferencia"
                        label="Muslo"
                        prepend-inner-icon="mdi-human-handsdown"
                        type="number"
                        density="comfortable"
                        variant="outlined"
                        hint="En la parte más ancha"
                        persistent-hint
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-card>
              </v-window-item>
              
              <!-- Pestaña 3: Notas -->
              <v-window-item value="notas">
                <v-card variant="flat" class="pa-0">
                  <v-card-title class="px-0 text-subtitle-1 font-weight-medium">
                    Notas Adicionales
                    <div class="text-caption text-medium-emphasis mt-1">Observaciones o detalles que quieras registrar</div>
                  </v-card-title>
                  
                  <v-textarea
                    v-model="medicionForm.notas"
                    :rules="rules.notas"
                    label="Notas"
                    rows="4"
                    variant="outlined"
                    counter="500"
                    placeholder="Escribe aquí tus observaciones, sensaciones o detalles sobre esta medición..."
                    prepend-inner-icon="mdi-note-text-outline"
                    class="mt-4"
                  ></v-textarea>
                </v-card>
              </v-window-item>
            </v-window>

            <!-- Mensaje informativo sobre campos opcionales -->
            <div class="text-caption text-medium-emphasis mt-6 mb-4">
              Todos los campos son opcionales excepto la fecha. Rellena los que conozcas.
            </div>
            
            <!-- Información del IMC calculado (si ambos valores están presentes) -->
            <v-card v-if="calculatedIMC" class="mb-4" color="primary" variant="tonal">
              <v-card-text>
                <div class="d-flex align-center">
                  <v-icon start class="me-2">mdi-information</v-icon>
                  <div>
                    <div class="text-subtitle-2">IMC calculado: <strong>{{ calculatedIMC }}</strong></div>
                    <div class="text-caption">{{ imcCategory }}</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-form>
        </v-card-text>

        <!-- Botones de acción -->
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-btn
            variant="text"
            @click="closeForm"
            class="text-capitalize"
            :disabled="loading"
          >
            Cancelar
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="#2d3a4e"
            variant="elevated"
            @click="handleSubmitForm"
            :loading="loading"
            class="save-button"
            elevation="5"
            rounded="pill"
            size="large"
          >
            <span class="button-text">{{ formMode === 'create' ? 'GUARDAR MEDICIÓN' : 'ACTUALIZAR MEDICIÓN' }}</span>
            <v-icon end class="ms-1">{{ formMode === 'create' ? 'mdi-plus-circle' : 'mdi-check-circle' }}</v-icon>
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

.register-button {
  background-color: #2d3a4e !important;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 0.75rem 2rem !important;
  transition: all 0.3s ease;
  text-transform: uppercase;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3) !important;
  
  .v-icon {
    font-size: 1.2rem;
    margin-right: 0.5rem;
  }
  
  .button-text {
    font-family: $font-family-base;
    font-size: 0.95rem;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4) !important;
    background-color: #37465e !important;
  }
  
  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2) !important;
    background-color: #263044 !important;
  }
  
  @media (max-width: 600px) {
    min-width: 180px;
    margin: 1rem auto !important;
    
    .button-text {
      font-size: 0.85rem;
    }
  }
}

.save-button {
  background-color: #2d3a4e !important;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 0.75rem 2rem !important;
  transition: all 0.3s ease;
  text-transform: uppercase;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3) !important;
  
  .v-icon {
    font-size: 1.2rem;
    margin-right: 0.5rem;
  }
  
  .button-text {
    font-family: $font-family-base;
    font-size: 0.95rem;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4) !important;
    background-color: #37465e !important;
  }
  
  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2) !important;
    background-color: #263044 !important;
  }
  
  @media (max-width: 600px) {
    width: 70%;
    margin-left: 0;
    
    .button-text {
      font-size: 0.85rem;
    }
  }
}

// Estilo para los campos con iconos prepend
:deep(.v-field__prepend-inner) {
  padding-inline-end: 8px !important;
}

// Estilo para los tabs con mayor separación
:deep(.v-tab) {
  margin: 0 12px !important;
  min-width: 150px !important;
}

// Estilo para la versión móvil (fullscreen dialog)
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
  
  :deep(.v-dialog--fullscreen) {
    .v-card {
      border-radius: 0;
      min-height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    .v-card-text {
      flex: 1;
      overflow-y: auto;
      padding-bottom: 80px; // Espacio para el botón de guardar
    }
    
    .v-card-actions {
      position: sticky;
      bottom: 0;
      background-color: white;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
      z-index: 1;
    }
    
    // Ajustar tamaño del datepicker en móvil
    .v-date-picker {
      width: 100%;
    }
  }
  
  // Tab seleccionado más visible en móvil
  :deep(.v-tab--selected) {
    background-color: rgba(226, 84, 1, 0.15);
    font-weight: 700;
    border-radius: $border-radius;
  }
  
  // Tabs separados en móvil
  :deep(.v-tab) {
    margin: 0 4px !important;
    min-width: auto !important;
    padding: 0 8px !important;
  }
}

// Estilos para desktop
@media (min-width: 601px) {
  .v-card-text {
    padding: 24px 32px;
  }
  
  // Animación suave en las pestañas
  :deep(.v-window__container) {
    transition: all 0.3s ease;
  }
  
  :deep(.v-window-item) {
    padding: 16px;
    background-color: #fafafa;
    border-radius: 0 0 $border-radius $border-radius;
  }
}
</style>