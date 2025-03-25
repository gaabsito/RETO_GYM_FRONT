<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useMedicionStore } from '@/stores/mediciones';
import type { Medicion } from '@/types/Medicion';
import { mdiChartLineVariant, mdiPlus, mdiScale, mdiRulerSquare } from '@mdi/js';

const props = defineProps<{
  usuarioID: number;
}>();

const router = useRouter();
const medicionStore = useMedicionStore();
const loading = ref(true);
const error = ref<string | null>(null);
const ultimaMedicion = ref<Medicion | null>(null);
const penultimaMedicion = ref<Medicion | null>(null);

// Cargar datos
onMounted(async () => {
  try {
    loading.value = true;
    const mediciones = await medicionStore.fetchMediciones();
    
    if (mediciones && mediciones.length > 0) {
      // Ordenamos por fecha (aunque deberían venir ordenadas)
      const sortedMediciones = [...mediciones].sort((a, b) => 
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
      
      ultimaMedicion.value = sortedMediciones[0];
      
      if (sortedMediciones.length > 1) {
        penultimaMedicion.value = sortedMediciones[1];
      }
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al cargar mediciones';
  } finally {
    loading.value = false;
  }
});

// Calcular diferencias entre mediciones
const diferencias = computed(() => {
  if (!ultimaMedicion.value || !penultimaMedicion.value) return null;
  
  return {
    peso: ultimaMedicion.value.peso && penultimaMedicion.value.peso 
      ? +(ultimaMedicion.value.peso - penultimaMedicion.value.peso).toFixed(1) 
      : null,
    imc: ultimaMedicion.value.imc && penultimaMedicion.value.imc 
      ? +(ultimaMedicion.value.imc - penultimaMedicion.value.imc).toFixed(1) 
      : null,
    porcentajeGrasa: ultimaMedicion.value.porcentajeGrasa && penultimaMedicion.value.porcentajeGrasa 
      ? +(ultimaMedicion.value.porcentajeGrasa - penultimaMedicion.value.porcentajeGrasa).toFixed(1) 
      : null,
    cintura: ultimaMedicion.value.circunferenciaCintura && penultimaMedicion.value.circunferenciaCintura 
      ? +(ultimaMedicion.value.circunferenciaCintura - penultimaMedicion.value.circunferenciaCintura).toFixed(1) 
      : null
  };
});

// Obtener el color basado en el valor (positivo/negativo) y si menos es mejor
const getColorForDiff = (diff: number | null, lessIsBetter = true) => {
  if (diff === null) return 'grey';
  
  const isPositive = diff > 0;
  const isImprovement = (lessIsBetter && !isPositive) || (!lessIsBetter && isPositive);
  
  return isImprovement ? 'success' : (diff === 0 ? 'info' : 'error');
};

// Formatear la diferencia con signo
const formatDiff = (diff: number | null) => {
  if (diff === null) return '-';
  return diff > 0 ? `+${diff}` : diff.toString();
};

// Formatear fecha
const formatDate = (date: Date | null) => {
  if (!date) return '';
  
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Ir a la vista de mediciones
const verMediciones = () => {
  router.push('/mediciones');
};

// Ir a la vista de crear medición
const nuevaMedicion = () => {
  router.push('/mediciones/nueva');
};
</script>

<template>
  <v-card class="resumen-card" elevation="2">
    <v-card-title class="primary-bg d-flex justify-space-between align-center">
      <div class="d-flex align-center">
        <v-icon :icon="mdiScale" class="me-2" color="white"></v-icon>
        <span class="text-white">Tus Mediciones</span>
      </div>
      <div>
        <v-btn 
          icon="mdi-plus" 
          variant="text" 
          color="white" 
          density="comfortable" 
          @click="nuevaMedicion"
          title="Nueva medición"
        ></v-btn>
      </div>
    </v-card-title>
    
    <v-card-text class="pa-0">
      <!-- Estado de carga -->
      <div v-if="loading" class="d-flex justify-center align-center pa-6">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>
      
      <!-- Error -->
      <div v-else-if="error" class="pa-4 text-center">
        <v-alert type="error" variant="tonal" class="mb-0">
          {{ error }}
        </v-alert>
      </div>
      
      <!-- Sin mediciones -->
      <div v-else-if="!ultimaMedicion" class="pa-4 text-center">
        <v-icon :icon="mdiScale" size="48" color="grey-lighten-2" class="mb-2"></v-icon>
        <p class="mb-4">No tienes mediciones registradas</p>
        <v-btn 
          prepend-icon="mdi-plus" 
          color="primary" 
          @click="nuevaMedicion"
        >
          Añadir medición
        </v-btn>
      </div>
      
      <!-- Con mediciones -->
      <div v-else>
        <!-- Última medición -->
        <div class="pa-4 pb-2">
          <div class="d-flex justify-space-between align-center mb-3">
            <h3 class="text-subtitle-1 font-weight-bold mb-0">Última medición</h3>
            <span class="text-caption text-grey-darken-1">{{ formatDate(ultimaMedicion.fecha) }}</span>
          </div>
          
          <v-row class="metric-row">
            <!-- Peso -->
            <v-col cols="6" sm="3" class="metric-col">
              <div class="metric-card pa-3">
                <div class="metric-title">Peso</div>
                <div class="d-flex justify-space-between align-center">
                  <div class="metric-value">{{ ultimaMedicion.peso ? `${ultimaMedicion.peso} kg` : '-' }}</div>
                  <v-chip 
                    v-if="diferencias && diferencias.peso !== null" 
                    :color="getColorForDiff(diferencias.peso)" 
                    size="x-small" 
                    class="diff-chip"
                  >
                    {{ formatDiff(diferencias.peso) }}
                  </v-chip>
                </div>
              </div>
            </v-col>
            
            <!-- IMC -->
            <v-col cols="6" sm="3" class="metric-col">
              <div class="metric-card pa-3">
                <div class="metric-title">IMC</div>
                <div class="d-flex justify-space-between align-center">
                  <div class="metric-value">{{ ultimaMedicion.imc || '-' }}</div>
                  <v-chip 
                    v-if="diferencias && diferencias.imc !== null" 
                    :color="getColorForDiff(diferencias.imc)" 
                    size="x-small" 
                    class="diff-chip"
                  >
                    {{ formatDiff(diferencias.imc) }}
                  </v-chip>
                </div>
              </div>
            </v-col>
            
            <!-- Grasa corporal -->
            <v-col cols="6" sm="3" class="metric-col">
              <div class="metric-card pa-3">
                <div class="metric-title">Grasa</div>
                <div class="d-flex justify-space-between align-center">
                  <div class="metric-value">{{ ultimaMedicion.porcentajeGrasa ? `${ultimaMedicion.porcentajeGrasa}%` : '-' }}</div>
                  <v-chip 
                    v-if="diferencias && diferencias.porcentajeGrasa !== null" 
                    :color="getColorForDiff(diferencias.porcentajeGrasa)" 
                    size="x-small" 
                    class="diff-chip"
                  >
                    {{ formatDiff(diferencias.porcentajeGrasa) }}
                  </v-chip>
                </div>
              </div>
            </v-col>
            
            <!-- Cintura -->
            <v-col cols="6" sm="3" class="metric-col">
              <div class="metric-card pa-3">
                <div class="metric-title">Cintura</div>
                <div class="d-flex justify-space-between align-center">
                  <div class="metric-value">{{ ultimaMedicion.circunferenciaCintura ? `${ultimaMedicion.circunferenciaCintura} cm` : '-' }}</div>
                  <v-chip 
                    v-if="diferencias && diferencias.cintura !== null" 
                    :color="getColorForDiff(diferencias.cintura)" 
                    size="x-small" 
                    class="diff-chip"
                  >
                    {{ formatDiff(diferencias.cintura) }}
                  </v-chip>
                </div>
              </div>
            </v-col>
          </v-row>
        </div>
        
        <!-- Botón de ver más -->
        <div class="text-center py-2 px-4 pb-4">
          <v-btn 
            color="primary" 
            variant="outlined" 
            block 
            @click="verMediciones" 
            :prepend-icon="mdiChartLineVariant"
          >
            Ver todas mis mediciones
          </v-btn>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.resumen-card {
  border-radius: $border-radius;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  }
}

.primary-bg {
  background-color: $primary-color;
}

.v-card-title {
  font-family: $font-family-base;
  font-size: 1.2rem;
  padding: 0.75rem 1rem !important;
}

.metric-row {
  margin: 0 -0.5rem;
}

.metric-col {
  padding: 0.5rem !important;
}

.metric-card {
  background-color: $light-gray;
  border-radius: $border-radius;
  transition: all 0.2s ease;
  height: 100%;
  
  &:hover {
    background-color: darken($light-gray, 3%);
  }
}

.metric-title {
  font-size: 0.85rem;
  opacity: 0.7;
  margin-bottom: 0.25rem;
  font-family: $font-family-text;
}

.metric-value {
  font-size: 1.1rem;
  font-weight: 600;
  font-family: $font-family-base;
}

.diff-chip {
  height: 20px !important;
  font-size: 0.7rem;
}

// Responsive adjustments
@media (max-width: 600px) {
  .metric-value {
    font-size: 1rem;
  }
  
  .metric-card {
    padding: 0.5rem !important;
  }
}
</style>